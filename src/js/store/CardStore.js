import cardStateDef from '../def/card_state_def.js'
// import { isValidID } from '../utils/utils'
import {
  CARD
} from '../def/state.js'
import {
  OD,
  ST
} from '../def/odef.js'

import {
  toJson,
  testMapID
} from '../utils/utils.js'
import DisplayingList from './DisplayingStore.js'

export default class CardStore {
  constructor(gstore) {
    this.gstore = gstore

    // 井下移动对象概况
    this.overview = {
      vehicle: 0,
      staff: 0,
      tdVehicle: 0
    }

    // card info
    this.infoDefs = null // from MetaStore
    this.infos = new Map() // card mapping relations: from cardID => vechicleID or staffID: map(cardID, {cardID, ...})

    // card states
    this.stateDefs = cardStateDef // card state definition, cardType => Object{card-state-def}

    // 井下车辆状态：cardID -> []
    this.vcards = new Map()

    // 井下非覆盖区域车辆状态
    this.uncovercards = new Map()

    // 井下人员状态：cardID -> []
    this.scards = new Map()

    // 井下人员上一次状态
    this.prescards = new Map()

    // 井下人员无信号卡
    this.nosignalscars = new Map()
    this.nosignal = new Map()
    this.handuping = new Map()

    // 当天0点开始出车列表
    this.tdVehicle = new Map()

    // 工作面区域人员列表
    this.workfacescards = new Map()
    // 离开工作区与人员列表
    this.unworkfacescards = new Map()

    // 当前正在显示的人员 id 列表
    this.displayingList = new DisplayingList()
    // card update frequency
    this.averageUpdateDurationVehicle = 1000 // 默认的卡信息更新间隔(车辆)
    this.averageUpdateDurationStaff = 2000 // 默认的卡信息更新间隔(人员)
    this.lastUpdateTime = 0 // 上一次卡状态/信息更新时间

    this.areaMap = null // 暂时增加

    this.special = 1001 // 特殊区域
    this.uncover = 1000 // 非覆盖区域

    this.wholeCards = new Map() // 按登陆用户管理部门区分区域、部门、级别信息
    this.wholeCards.set('v', new Map())
    this.wholeCards.set('s', new Map())
    this.v = null
    this.s = null

    this.changeMap = false // 是否切换地图，如果切换，需要重画人卡图标

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers() {
    let self = this
    // card info
    xbus.on('CARD-INFO-UPDATE', (msg) => {
      if (msg !== undefined) {
        self.infos[msg.type] = msg.data
      }
    })

    xbus.on('CARD-UPDATE-POS', (data) => {
      let needMove = xdata.needMove
      self.cardMove(data, needMove)
      this.updateRefreshDuration()
      xdata.needMove = false
    })

    xbus.on('CARD-ADD-CARD', (data) => {
      self.cardEnter(data)
    })

    xbus.on('CARD-REMOVE-CARD', (data) => {
      let msg = {
        data: data
      }
      self.cardLeave(msg)
    })

    xbus.on('CARD-REMOVE-ICON', (data) => {
      let msg = {
        cmd: 'UNCOVER',
        data: data
      }
      self.cardLeave(msg)
    })

    xbus.on('RESP-ALL-DATA', (data) => {
      let Data = data.data
      let msg = {
        cmd: 'UNCOVER',
        data: Data
      }
      self.cardLeave(msg)
    })

    xbus.on('POS-ALL-DATA', (data) => {
      let posdata = data.data
      self.cardMove(posdata)
      this.updateRefreshDuration()
    })

    xbus.on('CARD-NOSIGNAL', (data) => {
      let nosignal = data.nosignal
      let handuping = data.handuping
      // self.cardNosignal(nosignal)
      self.cardHanduping(handuping)
    })
  }

  // ---------------- 构造模糊查询数据集 begin
  getSearchData(type, value) {
    let sdata = []
    let objs = this.getStatesMapByCardType(type)
    let cards = objs && Array.from(objs.values())
    if (cards) {
      for (let i = 0, len = cards.length; i < len; i++) {
        let card = cards[i]
        let id = parseInt(card[0].slice(-6), 10) + ''
        let cardType = card[CARD.card_type_id]
        let name = card[CARD.object_id]
        name = cardType === 1 ? `${name}-${xdata.metaStore.getNameByID('dept_id', card[CARD.dept_id])}` : name
        let spy = name && xdata.spell.makePy(name) // 首字母
        let brief = spy ? spy[0] : ''

        sdata.push({
          id: id,
          n: name,
          b: brief,
          t: type,
          c: card[0],
          k: card[CARD.obj_id]
        })
      }
    }

    return sdata
  }
  // ---------------- 构造模糊查询数据集 end

  // ---------------- 可视列表 begin
  // 将卡列表加入可视列表
  addToDisplaying(cardList) {
    if (cardList && cardList.length > 0) {
      for (let i = 0, len = cardList.length; i < len; i++) {
        this.displayingList.set(cardList[i], true)
      }
    }
  }

  // 从显示列表中清除卡列表
  removeFromDisplaying(cardList) {
    if (cardList && cardList.length > 0) {
      for (let i = 0, len = cardList.length; i < len; i++) {
        this.displayingList.delete(cardList[i])
      }
    }
  }

  // 从显示列表中清除所有卡
  clearDisplaying() {
    this.displayingList.clear()
  }

  // ---------------- 可视列表 end

  // 计算卡位置更新的周期
  updateRefreshDuration() {
    let inow = performance.now()
    if (this.lastUpdateTime > 0) {
      this.averageUpdateDuration = inow - this.lastUpdateTime
    }
    this.lastUpdateTime = inow
  }

  // 通知地图更新指定的卡
  informMapUpdateCard(cmd, cardState, needMove) {
    xbus.trigger('MAP-CARD-UPDATE', {
      cmd: cmd,
      card: cardState,
      needMove: needMove
    })
  }

  // Add cardTypeID & cardBindedObjectID to the card(Array)
  addFields(cardID, card) {
    let cardTypeID = -1
    let cardBindedObjectID = ''
    let obj_id = ''

    let cardTypeInfo = xdata.metaStore.getCardTypeInfo(cardID)

    if (cardTypeInfo) {
      cardTypeID = cardTypeInfo.card_type_id
      // let cardTypeName = cardTypeInfo.name
      let bindedObject = xdata.metaStore.getCardBindObjectInfo(cardID)
      if (bindedObject) {
        cardBindedObjectID = bindedObject.name
        obj_id = bindedObject.staff_id || bindedObject.vehicle_id
      }

      // if (cardTypeName === 'staff') {
      //   let cardLevelInfo = xdata.metaStore.getCardLevelInfo(cardID)
      //   let cardLevelID = cardLevelInfo.level_id
      //   card.splice(1, 0, cardTypeID, cardBindedObjectID, cardLevelID)
      // } else {
      //   card.splice(1, 0, cardTypeID, cardBindedObjectID)
      // }
    }
    // else {
    //   console.warn(`Can NOT find cardTypeInfo for ${cardID}`)
    // }

    // console.log('card:' + card + 'cardType:' + typeof card)
    card && card.splice(1, 0, cardTypeID, cardBindedObjectID, obj_id)
    if (cardTypeID === 4 || cardTypeID === 5) card[CARD.speed] = Number((card[CARD.speed] * 1000 / 60).toFixed(1))
    // console.log(card)
    return card
  }

  cardNosignal(data) {
    if (!data || data.length <= 0) {
      return
    }
    let rows = data
    for (let i = 0, len = rows.length; i < len; i++) {
      let card = rows[i][1]
      let cardID = card[CARD.card_id]
      this.addFields(cardID, card)
      this.nosignal.set(cardID, card)
    }
    xbus.trigger('CARD-NOSIGNAL-CHANGED')
  }

  cardHanduping(data) {
    if (!data || data.length <= 0) {
      return
    }
    let rows = data
    for (let i = 0, len = rows.length; i < len; i++) {
      let card = rows[i]
      let cardID = card[0]
      card = this.scards.get(cardID)
      // this.addFields(cardID, card)
      this.handuping.set(cardID, card)
    }
    xbus.trigger('CARD-NOSIGNAL-CHANGED')
  }

  /**
   * Card 升井
   *
   * @method doUpMine
   *
   * @param  {[type]} data [description]
   *
   */
  cardLeave(data) {
    if (!data || data.length <= 0) {
      return
    }

    let rows = data.data
    let cmd = data.cmd
    if (!rows || rows.length <= 0) {
      return
    }
    let workfaceCards = []
    for (let i = 0, len = rows.length; i < len; i++) {
      let card = rows[i]
      let cardID = card[0]

      this.addFields(cardID, card)
      this.nosignalscars.delete(cardID)
      if (this.scards && this.scards.has(cardID)) { //  只有人员有升级消息
        // if (this.nosignalscars.has(cardID)) { // 如果该卡无信号,则为手动升井,在无信号卡中清除该卡
        //   this.nosignalscars.delete(cardID)
        // }

        let workfaceAreas = xdata.metaStore.data.drivingface_vehicle && Array.from(xdata.metaStore.data.drivingface_vehicle.values())
        let areaID = card[CARD.area_id]
        let isWorkfaceArea = workfaceAreas && workfaceAreas.filter(item => item.area_id === areaID)
        if (isWorkfaceArea && isWorkfaceArea.length > 0) {
          let workfacearea = this.workfacescards.get(isWorkfaceArea[0].area_id)
          if (workfacearea.has(cardID)) { // 如果该卡在工作面，则移除该卡
            workfacearea.delete(cardID)
            // this.unworkfacescards.set(cardID, card) // 离开工作区域卡列表 没有必要添加 卡升井会将工作面升井的卡传过去
            workfaceCards.push(card)
          }
        }

        this.scards.delete(cardID)
        this.informMapUpdateCard('UPMINE', card)
      }

      if (cmd === 'UNCOVER' && !this.uncovercards.has(cardID)) {
        this.uncovercards.set(cardID, card)
        this.informMapUpdateCard('UNCOVER', card)
      }
    }
    xbus.trigger('CARD-NOSIGNAL-CHANGED') // 是否合理?
    xbus.trigger('CARD-STATE-CHANGED', {
      cards: workfaceCards
    })
  }

  cardEnter(data) {
    if (!data || data.length <= 0) {
      return
    }
    for (let i = 0, len = data.length; i < len; i++) {
      let card = data[i]
      let cardID = card[0]

      this.addFields(cardID, card)

      let cmd = 'DOWNMINE'
      if (this.scards && this.scards.has(cardID)) {
        cmd = 'POSITION' // 已有卡，做卡移动处理
      }
      this.informMapUpdateCard(cmd, card)
    }

    xbus.trigger('CARD-STATE-CHANGED')
  }

  /**
   * 处理车辆数据
   * @param {*} data
   */
  processVehicleData(data, needMove) {
    if (!data) {
      return
    }

    this.tdVehicle.clear() // 每次清空当前车辆列表
    this.vcards = this.processDetail(data.detail, needMove, 'vehicle')
    this.overview.tdVehicle = Array.from(this.tdVehicle.values()).length
    if (xdata.depts || xdata.objRange === 1) this.constructData('vehicle')

    this.vStat = this.processStat(data.stat, 'vehicle')
    this.overview.vehicle = this.vStat ? this.vStat.sum : 0
  }

  /**
   * 处理人员数据
   * @param {*} data
   */
  processStaffData(data, needMove) {
    if (!data) {
      return
    }
    if (data.detail.length <= 0) return // 人卡2s推一次

    this.scards = this.processDetail(data.detail, needMove, 'staff') // 增加staff，解决人员区域数据差错，暂时解决方法，等待采集修改
    this.prescards = this.scards 

    if (xdata.depts || xdata.objRange === 1 || xdata.isCheck === 1) this.constructData('staff')

    this.sStat = this.processStat(xdata.isCheck === 1 ? data.stat_ck : data.stat, 'staff')
    this.overview.staff = this.sStat ? this.sStat.sum : 0
    if (this.changeMap) this.changeMap = !this.changeMap // 切换地图后，只重画一次所有人卡
  }

  // 处理统计数据
  // {sum:#, area:[[]], dept:[[]]}
  processStat(data, type) {
    let stat = null

    if (data) {
      if (!xdata.depts && xdata.objRange !== 1) {
        stat = data.glbl
      } else {
        stat = this[`${type ==='staff' ? 's' : 'v'}`]
      }
    }

    return stat
  }

  storeWorkFaceArea(card) { // 判断是否为工作区人卡
    let cardID = card[CARD.card_id]
    let areaID = card[CARD.area_id]
    let workfaceAreas = xdata.metaStore.data.drivingface_vehicle && Array.from(xdata.metaStore.data.drivingface_vehicle.values())
    let isWorkfaceArea = workfaceAreas && workfaceAreas.filter(item => item.area_id === areaID)
    if (isWorkfaceArea && isWorkfaceArea.length > 0) {
      let workfacecard = this.workfacescards.get(isWorkfaceArea[0].area_id)
      if (!workfacecard) {
        workfacecard = new Map()
        this.workfacescards.set(isWorkfaceArea[0].area_id, workfacecard)
      }
      workfacecard.set(cardID, card)
      if (this.unworkfacescards.has(cardID)) {
        this.unworkfacescards.delete(cardID)
      }
    } else { // 卡离开工作区，删除该卡
      let keys = Array.from(this.workfacescards.keys())
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        if (this.workfacescards.get(key).has(cardID)) {
          this.workfacescards.get(key).delete(cardID)
          this.unworkfacescards.set(cardID, card)
        }
      }
    }
  }

  dealData(name, cardID, typeID, card, type) {
    let wholestore = type === 'staff' ? this.wholeCards.get('s') : this.wholeCards.get('v')
    if (!wholestore.get(name)) {
      let ret = new Map()
      wholestore.set(name, ret)
    }
    let store = wholestore.get(name)
    if (!store.get(typeID)) {
      let ret = new Map()
      store.set(typeID, ret)
    }
    let storeresult = store.get(typeID)
    storeresult.set(cardID, card)
  }

  constructDetail(type, objtype) {
    let self = this
    let countData = []
    objtype = objtype === 'staff' ? 's' : 'v'
    let wholestore = this.wholeCards.get(objtype)
    let objs = wholestore.get(type) && Array.from(wholestore.get(type).keys())
    if (objs) {
      objs.forEach(obj => {
        let count = wholestore.get(type).get(obj).size
        countData.push([obj, count])
      })
    }
    return countData
  }

  constructData(type) {
    let store = new Object()
    store['sum'] = type === 'staff' ? this.scards.size : this.vcards.size
    store['area'] = this.constructDetail('area', type)
    store['dept'] = this.constructDetail('dept', type)
    store['occupation_level'] = this.constructDetail('occupation', type)
    this[`${type === 'staff' ? 's' : 'v'}`] = store
  }

  storeCardsByUserRole(card, type) {
    let cardID = card[CARD.card_id]
    let areaID = card[CARD.area_id]
    let deptID = card[CARD.dept_id]
    let occupationID = card[CARD.occupation_level_id]
    this.dealData('area', cardID, areaID, card, type)
    this.dealData('dept', cardID, deptID, card, type)
    this.dealData('occupation', cardID, occupationID, card, type)
  }

  judgeCardState (cardID, card, needMove, type) {
    if (type === 'vehicle' || card[CARD.speed] > 0) {
      this.showCard(cardID, card, needMove)
    } else {
      let prescard = this.prescards.get(cardID)
      let ispreMonkey = prescard && prescard[CARD.state_object]
      let isMonkey = card[CARD.state_object]
      let ispreUncover = prescard && prescard[CARD.state_biz]
      let isUncover = card[CARD.state_biz]
      if (!prescard || this.changeMap || (ispreMonkey != isMonkey && (ispreMonkey == 7 || isMonkey == 7)) || (ispreUncover != isUncover && (ispreUncover == 1024 || isUncover == 1024))) {
        this.showCard(cardID, card, needMove)
      }
    }
    xbus.trigger('CARD-UPDATE-MONITOR', {
      card: card
    })
  }

  /**
   * 处理明细数据。注意：明细为全量推送
   * @param {*} type
   * @param {*} data
   */
  processDetail(data, needMove, type) { // type暂时增加
    let xmap = new Map()
    // let areaMap = type && new Map() // 暂时增加
    let defaultMapID = parseInt(xdata.metaStore.defaultMapID, 10)
    let workfaceAreas = xdata.metaStore.data.drivingface_vehicle && Array.from(xdata.metaStore.data.drivingface_vehicle)
    let areas = xdata.metaStore.data.area
    if (data) {
      for (let i = 0, len = data.length; i < len; i++) {
        let card = data[i]
        let cardID = card[CARD.card_id]
        let deptID = card[CARD.dept_id]
        let areaID = card[CARD.area_id]
        let area = areas.get(areaID)
        let areaNeedDisplay = area && area.need_display
        // 人卡是否显示 检查用户登录时，卡所在区域是否可见 全部or部分部门
        let condition = xdata.metaStore.needDisplay(cardID) && (xdata.isCheck !== 1 || areaNeedDisplay !== 0) && (!xdata.depts || xdata.depts.includes(deptID))
        if (condition) {
          this.addFields(cardID, card)
          let mapID = Number(card[CARD.map_id])
          let tdvehicle = parseInt(card[CARD.td_vehicle], 10)

          // if (type === 'staff') { // 目前没有工作面3d显示，所以隐藏
          //   this.storeWorkFaceArea(card)
          // }
          xmap.set(cardID, card)
          // 与上一次卡的状态做比较
          this.judgeCardState(cardID, card, needMove, type)
          // this.showCard(cardID, card, needMove)
          if (type === 'vehicle' && tdvehicle === 1) {
            this.tdVehicle.set(cardID, card)
          }
          if (xdata.depts || xdata.objRange === 1) {
            this.storeCardsByUserRole(card, type)
          }
        }
      }
    }

    return xmap
  }

  getNomalCmd(areaTypeName, cardID, cardTypeName) {
    let cmd = 'POSITION'
    if (this.nosignalscars.has(cardID)) { // 该卡有信号时,如果之前为无信号状态,则删除该卡
      this.nosignalscars.delete(cardID)
    }
    if (areaTypeName === this.uncover) {
      if (!this.uncovercards.has(cardID)) {
        this.uncovercards.set(cardID, true)
        cmd = 'UNCOVER' // 非覆盖区域,防止推实时数据时,非覆盖区域卡乱动
      } else {
        cmd = 'NOCHANGE'
      }
    } else {
      if (areaTypeName === this.special && cardTypeName === 'vehicle') { // 只有车辆有特殊区域
        cmd = 'SPECIAL' // 胶轮车存放硐室,无label
      }
      this.uncovercards.delete(cardID)
    }
    return cmd
  }

  /**
   * 根据卡 推送过来的状态类型，获得对应的 cmd 指令
   * @param {*} 车:(非覆盖区域/运动/静止/停车场) 与 (丢失信号)
   * @param {*} 人: 接收 与 没接收到
   */
  getCmdByState(card, cardID) {
    // console.log(cardID, card)
    let cmd = 'POSITION'
    let areas = xdata.metaStore.data.area
    let areatype = xdata.metaStore.data.area_type
    let areaID = card[CARD.area_id]
    let area = areas && areas.get(areaID)
    let areaTypeID = area && Number(area.area_type_id)
    let areaTypeName = areaTypeID && areatype && areatype.get(areaTypeID) && areatype.get(areaTypeID).area_type_id
    areaTypeName = parseInt(areaTypeName, 10)
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)

    let cardstate = card[CARD.state_biz] // 卡的业务状态 接收/没接收信号
    if (cardstate === 1024) { // 接收不到信号
      if (cardTypeName === 'staff') {
        cmd = 'NOSIGNAL' // 卡类型为人员时,存入无信号人员卡缓冲区
        if (!this.nosignalscars.has(cardID)) {
          this.nosignalscars.set(cardID, card)
        }
      } else if (cardTypeName === 'vehicle') {
        if (areaTypeID < 1000) { // 正常区域时，会出现无信号状态
          cmd = 'NOSIGNAL'
        } else { // 非覆盖区域 or 胶轮车硐室 的情况
          cmd = this.getNomalCmd(areaTypeName, cardID, cardTypeName)
        }
      }
    } else {
      cmd = this.getNomalCmd(areaTypeName, cardID, cardTypeName)
    }

    return cmd
  }

  // 在地图上显示卡
  showCard(cardID, card, needMove) {
    let cmd = this.getCmdByState(card, cardID)
    // 仍然呆在非覆盖区域没动，不处理
    // if (cmd === 'NOCHANGE') {
    //   return
    // }

    this.informMapUpdateCard(cmd, card, needMove)
  }

  /**
   * 获取（vehicle, staff）按照（area, dept, level）分类的某个类别（id）的明细
   * @param {*} cardType 卡类别，（vehicle, staff）
   * @param {*} groupBy 分类（area, dept, level）
   * @param {*} groupID 分类 ID（id）
   */
  getDetail(cardType, groupBy, groupID, filterGeo) {
    let fieldIndex = 0
    switch (groupBy) {
      case ST.AREA:
        fieldIndex = CARD.area_id
        break
      case ST.DEPT:
        fieldIndex = CARD.dept_id
        break
      case ST.LEVEL:
        fieldIndex = CARD.occupation_level_id
        break
      case ST.SUM:
        fieldIndex = -1 // ALL
        break
      default:
        // console.log('UNKNOWN groupBy: ', groupBy)
        return
    }

    let xmap = this.getStatesMapByCardType(cardType)
    let allCards = xmap && Array.from(xmap.values())
    let arrtriFilterCards = fieldIndex < 0 ? allCards : allCards.filter(item => item[fieldIndex] === groupID)
    if (filterGeo) {
      // 空间条件过滤
      arrtriFilterCards = arrtriFilterCards.filter(function (item) {
        let coord = [item[CARD.x], -item[CARD.y]]
        let isItem = filterGeo.intersectsCoordinate(coord)
        return isItem
      })
    }
    return arrtriFilterCards
  }

  /**
   * 根据卡类型（vehicle, staff）和统计类型（area, dept, level）获取统计数据
   * @param {*} cardType
   * @param {*} statType
   */
  getStat(cardType, statType) {
    let stat = null

    let data = null
    switch (cardType) {
      case OD.VEHICLE:
      case OD.CMJ:
      case OD.JJJ:
        data = this.vStat
        break
      case OD.STAFF:
        data = this.sStat
        break
      default:
        console.log('UNKNOWN cardType: ', cardType)
        return
    }

    stat = data && data[statType]
    stat = this.addName(stat, statType)

    return stat
  }

  // 根据统计的 ID，补全名称
  addName(data, statType) {
    if (data && data.length > 0) {
      let idName = statType + '_id'
      for (let i = 0, len = data.length; i < len; i++) {
        let row = data[i]
        let name = xdata.metaStore.getNameByID(idName, row[0])

        row.push(name)
        if (statType === 'area') {
          let areatype = xdata.metaStore.data.area && xdata.metaStore.data.area.get(row[0]) && xdata.metaStore.data.area.get(row[0]).area_type_id
          row.push(areatype)
        }
      }
    }

    return data
  }

  /**
   * 处理卡移动
   * @param {*} data
   */
  cardMove(data, needMove) {
    if (!data) {
      return
    }
    data = toJson(data)
    this.processVehicleData(data.v, needMove)
    this.processStaffData(data.s, needMove)

    // 通知统计、详细列表更新数据
    xbus.trigger('CARD-STATE-CHANGED')
  }

  getInfoDef(cardType) {
    if (!this.infoDefs) { // 延迟初始化 this.infoDefs
      let defs = xdata.metaStore.defs
      this.infoDefs = {
        vehicle: defs.vehicle,
        staff: defs.staff
      }
    }
    return this.infoDefs ? this.infoDefs[cardType] : null
  }

  /**
   * 根据卡类型（vehicle, staff）获得对应的 map
   * @param {*} type
   */
  getStatesMapByCardType(type) {
    let xmap = null
    switch (type) {
      case OD.VEHICLE:
      case OD.CMJ:
      case OD.JJJ:
        xmap = this.vcards
        break
      case OD.STAFF:
        xmap = this.scards
        break
      default:
        console.log('UNKNOWN type:', type)
        return null
    }

    return xmap
  }

  /**
   * 获取卡（cardID）最后一次状态信息
   * @param {*} cardID
   */
  getLastState(cardID) {
    let cardType = parseInt(cardID.slice(0, 3), 10)
    let xmap = this.getStatesMapByCardType(cardType)
    return xmap && xmap.get(cardID)
  }

  /**
   * 判断卡所在的区域是否为非覆盖区域
   * @param {*} cardID 卡号
   */
  isInUncoverArea(cardID) {
    let ret = null

    let card = this.getLastState(cardID)
    if (!card) {
      return false
    }
    let areaID = card[CARD.area_id]

    let areas = xdata.metaStore.data.area
    let area = areas && areas.get(areaID)
    let areaTypeID = area && area.area_type_id

    // let areaTypes = xdata.metaStore.data.area_type
    // let areaType = areaTypeID && areaTypes && areaTypes.get(areaTypeID).area_type_id
    if (areaTypeID === this.uncover) {
      ret = {
        areaID: areaID,
        isUncoverArea: true
      }
    }

    return ret
  }

  // get card's last info'
  // 注意： 要求 cardID 必须是唯一的，比如：不允许出现 人卡ID 和 车卡ID 相同的情况
  getInfo(cardID) {
    let info = null

    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    if (!cardTypeName) {
      if (cardID.match(/^001/)) {
        cardTypeName = 'staff'
      } else if (cardID.match(/^002/)) {
        cardTypeName = 'vehicle'
      } else if (cardID.match(/^003/)) {
        cardTypeName = 'adhoc'
      }
    }
    if (cardTypeName !== 'adhoc') {
      info = this.infos[cardTypeName + '_extend'].get(cardID)
    } else {
      info = this.infos[cardTypeName].get(cardID)
    }
    return info
  }

  /**
   * 获取一张地图上所有卡，包括人卡和车卡
   * @param {*} mapID
   */
  getCardsOnMap(mapID) {
    let cards = []

    let vehicles = Array.from(this.vcards.values())
    let staffs = this.scards && Array.from(this.scards.values())
    let all = vehicles.concat(staffs)
    
    cards = all.filter((item) => testMapID(item[CARD.map_id], mapID))

    return cards
  }

  // 根据状态 ID 获取所有 card，返回 card 的数组
  getCardsByState(cardTypeID, cardStateID) {
    let cards = []

    let data = Array.from(this.states.values())
    if (cardTypeID === '*') {
      if (cardStateID === '*') {
        cards = data
      } else {
        let stateID = parseInt(cardStateID, 10)
        cards = data.filter(item => item[CARD.state_card] === stateID)
      }
    } else {
      let typeID = parseInt(cardTypeID, 10)
      if (cardStateID === '*') {
        cards = data.filter(item => item[CARD.card_type_id] === typeID)
      } else {
        let stateID = parseInt(cardStateID, 10)
        cards = data.filter(item => item[CARD.card_type_id] === typeID && item[CARD.state_card] === stateID)
      }
    }

    return cards
  }

  getLeaderShipCards() {
    let data = Array.from(this.states.values())
    let cards = data.filter(item => item[CARD.level_id] !== 0)

    return cards
  }

  reset() {
    // this.nosignalscars.clear() // 丢失信号卡
    this.uncovercards.clear() // 未覆盖区域
    this.changeMap = true // 切换地图，通知地图重画人员图标
  }
}
