/*
meta data structure is :
meta = {
 name: map{
       (key, {field: value, ...}),
       (...)
     }
 ...
}

so, the access path is : meta(name -> key -> field)
*/

import {
  formatElapsedTime
} from '../utils/utils.js'
import {
  CARD
} from '../def/state.js'
import {
  DEFAULT_MAP_ID
} from '../def/map_def.js'
import specialTable from '../def/special_tablekey_def.js'
import {
  clone
} from '../utils/utils.js'
import {
  AREA_DEEP
} from '../def/area_deep_def.js'

// 以 '_id' 结尾的通配符
let endWithID = /^(\w*)_id$/i

const CARD_TYPES = ['vehicle_extend', 'staff_extend', 'adhoc']
const SHIFTSETTING = 15 // 班次规则id
const SHIFTTABLENAME = 'shift_setting'

export default class MetaStore {
  constructor(gstore) {
    this.gstore = gstore
    this.needMove = false // 判断切换到实时地图界面是否需要动画

    this.maptype = 'MONITOR' // 判断地图是否为实时地图
    this.workAreaList = new Map() // 工作面所属区域列表
    this.defaultMapID = DEFAULT_MAP_ID // 当前显示的地图id, 如未加载完数据时，默认显示数据表第一条数据，数据表无数据时再显示id为5的地图

    this.defs = null // meta data definition
    this.data = {} // meta data store

    // 以卡号为索引的、卡绑定对象的列表
    this.cardIndex = new Map() // card_id -> staff or vehicle

    this.dataInArray = new Map() // name => array
    this.driverData = new Map()
    this.maxIDs = {} // meta data max id,
    this.alarm = new Map()
    // this.staffs = new Map() // 人员详细信息
    // this.vehicles = new Map() // 车辆详细信息
    this.deptStaff = new Map() // 人员按部门分组
    this.deptVehicle = new Map() // 车辆按部门分组
    this.depts = new Map()
    this.cardDeep = new Map() // 对象海拔，防止速度为0的对象海拔高度变化
    // 是否需要过滤部分卡
    this.needFilterCards = false

    this.firstPull = false
    this.sbasicUpdate = false // 更新元数据时，更新staffs
    this.sbasicExtendUpdate = false // 更新元数据时，更新staffs
    this.vbasicUpdate = false
    this.vbasicExtendUpdate = false
    this.basicDeptUpdate = false // 更新元数据时，更新员工性质表

    this.hmDeptIDMax = 1 // 虹膜部门id最大值

    this.fadeAreaArr = new Map() //记录显示的分站盲区
    // 地标/分站根据用户进行过滤
    // this.landmarkDisplay = false
    // this.readerDisplay = false

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers() {
    let self = this

    xbus.on('META-DEF', (res) => {
      self.saveMetaDef(res.data)
      // xdata.dexieDBStore.openLocalDb()
    })

    xbus.on('META-DATA', (res) => {
      // console.log(res)
      if (res && res.code === 0) { // execute succeed
        // self.saveMetaData(res.data.name, res.data.rows)
        let length = Object.keys(this.defs).length
        if (res.data.name === 'mdt_update' && this.defs) {
          if (!this.first && !this.data.mdt_update) {
            // let msg = {
            //   information: '系统正在加载中，请勿关闭页面！'
            // }
            let msg = {
              name: 'progress-bar',
              information: '正在更新数据，请稍候...'
            }
            xdata.dexieDBStore.storeForceData = true
            window.xhint.showLoading(msg)
            this.first = !this.first
          }
          xbus.trigger('DB-OPEN', (res.data))
        } else if (res.data.name === 'driver_arrange') {
          let data = res.data.rows
          if (data && data.length > 0) {
            let time = new Date().format('yyyy-MM-dd')
            let currentArrangement = data.filter(item => new Date(item.driver_date).format('yyyy-MM-dd') === time)
            currentArrangement && currentArrangement.length > 0 && self.updateDriverData(currentArrangement)
          }
        } else {
          let name = res.data.name
          if (name.indexOf('dat') < 0) {
            name = `dat_${res.data.name}`
          }
          xdata.dexieDBStore.db[name] ? xdata.dexieDBStore.storeDATA(name, res.data.rows, res.upMethod) : this.saveMetaData(res.data.name, res.data.rows)
        }
      } else {
        console.warn(`获取 META ${res.data.name} 失败。`)
      }
    })

    xbus.on('SAVE-META-DATA-SPECIAL', () => {
      this.storeSpecialData()
    })
  }

  // 检查账号登录，需要特殊处理dat_dept/dat_staff_extend表
  storeSpecialData (data) {
    if (!data) { // 登陆时，需要删除dataInArray中的相关数据
      let deptCkArray = this.dataInArray.get('dept_ck'), staffExtendCkArray = this.dataInArray.get('staff_extend_ck')
      this.dataInArray.set('dept', deptCkArray)
      this.dataInArray.set('staff_extend', staffExtendCkArray)
      this.dataInArray.delete('dept_ck')
      this.dataInArray.delete('staff_extend_ck')
    }
    data = data || this.data
    let deptCk = data['dept_ck'], staffExtendCk = data['staff_extend_ck']
    data['dept'] = deptCk
    data['staff_extend'] = staffExtendCk
    delete data['dept_ck']
    delete data['staff_extend_ck']
    this.maxIDs['dept'] = this.maxIDs['dept_ck']
  }

  dealSpecialCheckName (name) {
    if (xdata.isCheck === 1) {
      if (name === 'dat_dept_ck' || name === 'dat_staff_extend_ck') return {
        isSaveMetaData: true,
        tableName: name.replace('_ck', '')
      }
      if (name === 'dat_dept' || name === 'dat_staff_extend') return {
        isSaveMetaData: false,
        tableName: null
      }
    }
    return {
      isSaveMetaData: true,
      tableName: name
    }
  }

  getMdtlength() {
    // let table = xdata.dexieDBStore.db['mdt_update'] || xdata.dexieDBStore.db.table['mdt_update']
    // let arr = table && await table.toArray()
    let arr = xdata.dexieDBStore.rows
    if (!arr) {
      arr = this.data.mdt_update && Array.from(this.data.mdt_update.values())
    }
    if (arr && Object.keys(this.data).length >= arr.length && !this.firstPull && arr.length !== 0) {
      console.log('=====================', Object.keys(this.data).length)
      this.firstPull = true
      this.first = true
      // window.xhint.close()
    }
  }

  handleTable(name) {
    let self = this
    if (!name || name === 'settings') {
      let settings = this.dataInArray.get('setting')
      settings && settings.forEach(item => {
        self.alarm.set(item.name, item.value)
      })
      if (!this.alarm.get('alarm')) {
        self.alarm.set('alarm', 5) // 默认显示全部
      }
    }

    // this.updateFilterCardFlag() // 过滤卡

    // store drivers
    if (!name || name === 'driver_arrange') {
      let drivers = this.dataInArray.get('driver_arrange')
      if (drivers && drivers.length > 0) {
        let time = new Date().format('yyyy-MM-dd')
        let currentArrangement = drivers.filter(item => new Date(item.driver_date).format('yyyy-MM-dd') === time)
        currentArrangement && currentArrangement.length > 0 && self.updateDriverData(currentArrangement)
      }
    }

    if (!name || /staff/.test(name)) this.jointObj('staff')
    if (!name || /vehicle/.test(name)) this.jointObj('vehicle')

    // this.setWorkArea(this.dataInArray.get('drivingface_vehicle'))
    // this.setWorkArea(this.dataInArray.get('coalface_vehicle'))

    if (!name || name === 'map_gis') {
      xbus.trigger('SAVE-GIS-MAP', this.dataInArray.get('map_gis'))
      xbus.trigger('DRAW-FAULT-LAYER')
    }
    if (!name || name === 'camera') xbus.trigger('MAP-INIT-CAMERA')
    if (!name || name === 'area') xbus.trigger('DRAW-AREA-UPDATE')
    if (!name || name === 'reader') xbus.trigger('DRAW-READER-UPDATE')
    if (!name || name === 'landmark') xbus.trigger('DRAW-LANDMARKER-UPDATE')
    if (!name || name === 'area') xbus.trigger('MAP-INIT-AREALIST', this.dataInArray.get('area'))
    if (!name || name === 'reader_path_tof_n') xbus.trigger('DRAW-READERPATH-UPDATE')
    if (!name || name === 'goaf') xbus.trigger('DRAW-ALL-GOAF')
  }

  setWorkArea(rows) {
    if (!rows) return
    for (let i = 0, len = rows.length; i < len; i++) {
      this.workAreaList.set(rows[i].area_id, rows[i].area_id)
    }
  }

  async saveData(name, value) {
    try {
      let table = xdata.dexieDBStore.db.table(name) || xdata.dexieDBStore.db[name]
      let rows = value || await table.toArray()
      let {isSaveMetaData, tableName} = this.dealSpecialCheckName(name)
      // name = xdata.isCheck === 1 ? this.dealSpecialCheckName(name) : name
      let keyname = tableName.slice(4)
      isSaveMetaData && this.saveMetaData(keyname, rows)
      this.getMdtlength()
      xdata.dexieDBStore.progressBar(name)
      // this.dealDataByDept()
    } catch (error) {
      console.warn(`table ${name} does not exist!`)
    }
  }

  dealDataByDept() {
    this.distributeDept('staff_extend', 'staff')
    this.distributeDept('vehicle_extend', 'vehicle')
    // xbus.trigger('DISTRIBUTE-HAD-OVER')
  }

  distributeDept(tableName, baseTable) { // 按部门存储人员或车辆数据
    let deptData = xdata.metaStore.dataInArray.get('dept'),
      tableData = xdata.metaStore.dataInArray.get(tableName)
    let baseData = baseTable === 'staff' ? xdata.metaStore.data.staff : xdata.metaStore.data.vehicle
    if (tableData && tableData.length > 0 && deptData && deptData.length > 0) {
      for (let i = 0, len = deptData.length; i < len; i++) {
        // let data = tableData.filter(item =>item.dept_id === deptData[i].dept_id)
        let data = tableData.filter((item) => {
          let ident = baseTable === 'staff' ? item.staff_id : item.vehicle_id
          if (item.dept_id === deptData[i].dept_id && baseData && baseData.get(ident)) return item // 保证staff及extend表中数据一一对应，防止直接在数据库中插入某一表的一条数据
        })
        tableName === 'staff_extend' && data ? this.deptStaff.set(deptData[i].dept_id, data) : this.deptVehicle.set(deptData[i].dept_id, data)
      }
    }
  }


  dealSpecialId(keyName, name) {
    return specialTable[name] ? specialTable[name] : keyName
  }

  // 获取虹膜部门最大id+1
  getMaxHMDeptID (rows) {
    let hmDeptIDArr = Array.from(rows.values()).map(item => item.hm_dept_id || 0)
    this.hmDeptIDMax = Math.max(...hmDeptIDArr) + 1
  }

  /*
   * name: the meta_data's name, such as : staff, reader, etc.
   * keyName: the key's name
   * data: the origin resultset
   */
  saveMetaData(name, rows) {
    // console.debug(`meta: ${name}, \t\tcount: ${rows ? rows.length : 0}`)

    // save to a map
    this.dataInArray.set(name, rows) // TODO: meta saved two copys !!!
    let tmp = new Map() // temp map to save the rows
    let cardList = CARD_TYPES.includes(name) ? new Map() : null
    let maxID = 0
    if (rows) {
      let def = this.defs && this.defs[name]
      let keyName = def ? def.fields.names[def.keyIndex] : name + '_id'
      keyName = this.dealSpecialId(keyName, name)
      for (let item of rows) {
        // save to data
        let keyValue = item[keyName]
        if (name != 'staff_extend' && name != 'vehicle_extend') {
          let spy = item['name'] ? xdata.spell.makePy(item['name']) : ''
          // if(keyName === 'staff_id' && !item.hasOwnProperty('name')) {
          //   let name = `${xdata.metaStore.getNameByID(keyName, keyValue)}`
          //   spy = xdata.spell.makePy(name)
          // }
          spy = spy ? spy[0] : ''
          item['spy'] = spy
        }

        if (name === 'setting' && keyValue === 15) {
          let shiftData = new Map()
          shiftData.set(keyValue, item)
          this.data[SHIFTTABLENAME] = shiftData
          continue
        }

        tmp.set(keyValue, item)

        // is card, save to cardIndex
        if (cardList) {
          let cardID = item['card_id']
          cardList.set(cardID, item)
          this.cardIndex.set(cardID, item)
        }

        // init the maxID
        if (keyValue > maxID) {
          maxID = keyValue
        }
      }
    }

    this.data[name] = tmp
    this.maxIDs[name] = maxID === 0 ? 1 : maxID

    if (['reader', 'traffic', 'speaker', 'turnout'].includes(name)) {
      xbus.trigger('DEVICE-INFO-UPDATED') // tell others to update the device info
    }

    if (name === 'dept') {
      this.getMaxHMDeptID(rows)
    }

    if (cardList) {
      xbus.trigger('CARD-INFO-UPDATE', {
        type: name,
        data: cardList
      })
    }

    this.broadcastMetaUpdate(name, maxID, rows)
  }

  jointObj(type) {
    if (type === 'staff') {
      this.staffs = new Map()
    } else if (type === 'vehicle') {
      this.vehicles = new Map()
    }
    let objects = this.data[type] ? Array.from(this.data[type].values()) : this.dataInArray.get(type)
    if (objects) {
      objects = clone(objects)
      for (let i = 0, len = objects.length; i < len; i++) {
        let obj = objects[i]
        let objID = obj[type + '_id']
        let name = obj.name
        let objExtend, objInfo
        if (type === 'staff' || type === 'vehicle') {
          objExtend = this.data[type + '_extend'] && this.data[type + '_extend'].get(objID)
          objInfo = objExtend ? this.concatObject(obj, objExtend) : obj
          let cardInfo = objInfo && xdata.metaStore.data.card && xdata.metaStore.data.card.get(objInfo.card_id)
          let stateID = cardInfo && cardInfo.state_id
          if (objInfo) objInfo.state_id = (stateID || stateID === 0) ? stateID : ''
        }
        if (type === 'staff') {
          this.staffs.set(objID, objInfo)
        } else if (type === 'vehicle') {
          this.vehicles.set(objID, objInfo)
        }
      }
      if (type === 'staff' || type === 'vehicle') {
        this.broadcastMetaUpdate(type)
      }
    }
  }

  /**
   * [broadcastMetaUpdate when meta updated, inform all (the views) to refresh their local data]
   * @param  {[type]} name [meta data's name]
   * @param  {[type]} rows [the result data, may be null]
   * @return {[type]}      [description]
   */
  broadcastMetaUpdate(name, maxID, rows) {
    let def = this.defs ? this.defs[name] : name + '_id'
    let table = {
      def: def,
      maxid: maxID,
      rows: rows
    }
    xbus.trigger('META-DATA-UPDATE', table)
  }

  saveMetaDef(data) {
    this.defs = data
    xdata.isCheck === 1 && this.storeSpecialData(this.defs)
  }

  // operation

  /**
   * 从数据集 name 中，获取 key 值为 id 的字段 field 的值
   * @param {*} name 数据集名称，比如 map
   * @param {*} id 数据集中 key 的值，比如 1
   * @param {*} field 需要获取字段的名称，比如 map_id
   */
  getField(name, id, field) {
    let ret = null
    if (name && id && field) {
      let rows = this.data[name]
      if (rows) {
        let row = rows.get(id)
        if (row) {
          ret = row[field]
        }
      }
    }
    return ret
  }

  isChangeDeptCk (value, cardID) {
    if (xdata.isCheck === 1) {
      let staff = this.getCardBindObjectInfo(cardID)
      let deptID = staff && staff.dept_id
      value = deptID
    }
    return value
  }

  formatStateArray(def, row, rule) { // rule: SHORT-DATE or not, etc.
    if (!def || !row) {
      return row
    }
    let ret = []
    for (let i = 0, len = def.fields.names.length; i < len; i++) {
      let name = def.fields.names[i]

      if (i === def.keyIndex) { // key 不做转换
        ret.push(row[i])
        continue
      }
      let type = def.fields.types[i]
      let value = row[i]
      if (name === 'area_id' && row[i] === 0) {
        value = '未识别区域'
      } else {
        if (name === 'dept_id') { // 虚拟部门信息转化
          value = this.isChangeDeptCk(value, row[def.fields.names.indexOf('card_id')])
        }
        value = this.formatField(name, value, type, rule)
      }

      if (name === 'work_time') { // 工作时间转化
        value = formatElapsedTime(value)
      }

      if (name === 'map_pos') { // 地图位置信息组装
        value = this.getPositionDesc(row[i], row[i + 1], row[i + 2])
      }
      ret.push(value)
    }

    return ret
  }

  // 按区域获取对象海拔
  getCardDeep(areaID, cardID, speed) {
    if (speed === 0) { // 静止不动
      return this.cardDeep.get(cardID)
    }
    let areaDeepObj = AREA_DEEP[areaID]
    let deep = ''
    if (areaDeepObj) {
      let m = areaDeepObj['max_deep']
      let n = areaDeepObj['min_deep']
      deep = Math.random() * (m - n) + n
    }
    deep = deep ? deep.toFixed(3) : deep
    this.cardDeep.set(cardID, deep)
    return deep
  }

  formatnosignalcards(def, row, rule) {
    if (!def || !row) {
      return row
    }
    let ret = []
    for (let i = 0; i < def.fields.names.length; i++) {
      let name = def.fields.names[i]
      let type = def.fields.types[i]
      let value = row[CARD[name]]
      if (name === 'map_pos') { // 地图位置信息组装
        value = this.getPositionDesc(row[16], row[17], row[18])
      } else if (name === 'occupation_id') {
        let occupationID = this.getCardBindObjectInfo(row[0]) ? this.getCardBindObjectInfo(row[0]).occupation_id : '未识别岗位'
        value = this.formatField(name, occupationID, type, rule)
      } else if (name === 'state_biz') {
        value = this.formatField('state_biz_id', value, type, rule)
      } else if (name === 'state_card') {
        value = this.formatField('state_card_id', value, type, rule)
      } else if (name === 'work_time') { // 工作时间转化
        value = formatElapsedTime(value)
      } else {
        value = this.formatField(name, value, type, rule)
      }
      ret.push(value)
      // let value = row[CARD.name]
    }

    return ret
  }

  //  获得位置描述
  getPositionDesc(landmarkID, directionID, distance) {
    let ret = ''

    let landmarkName = this.getNameByID('landmark_id', landmarkID)
    if (landmarkName !== 0 && distance) {
      distance = distance.toFixed(2)
      ret = landmarkName
      let directionName = this.getNameByID('direction_mapper_id', directionID)
      if (directionName !== 0) {
        if (distance !== 0) {
          ret = landmarkName + directionName + distance + '米'
        }
      } else {
        if (distance !== 0) {
          ret = landmarkName + distance + '米'
        }
      }
    }

    return ret
  }

  formatRecordArray(def, row, rule) { // rule: SHORT-DATE or not, etc.
    if (!def || !row) {
      return row
    }

    let ret = []
    for (let i = 0; i < def.fields.names.length; i++) {
      let name = def.fields.names[i]

      if (i === def.keyIndex) { // key 不做转换
        ret.push(row[name])
        continue
      }

      let type = def.fields.types[i]
      let value = row[name]
      value = this.formatField(name, value, type, rule)

      ret.push(value)
    }
    return ret
  }

  formatLoop(def, row, rule) {
    let ret = {}
    for (let i = 0; i < def.fields.names.length; i++) {
      let name = def.fields.names[i]

      if (i === def.keyIndex) { // key 不做转换
        ret[name] = row[name]
        continue
      }

      let type = def.fields.types[i]
      let value = row[name]
      value = this.formatField(name, value, type, rule)

      ret[name] = value
    }
    return ret
  }

  formatRecord(def, row, rule) { // rule: SHORT-DATE or not, etc.
    if (!def || !row) {
      return row
    }
    let name = def.name
    let basicExtend = null
    let basic = this.formatLoop(def, row, rule)
    if (name === 'staff' || name === 'vehicle') { // 车辆和人员 需要基础表信息和业务表信息拼起来 组成完整信息
      basicExtend = this.formatLoop(this.defs[name + '_extend'], row, rule)
    }
    return this.concatObject(basic, basicExtend)
  }

  formatField(name, value, type, rule) {
    if (value === null || value === undefined || value === '') {
      return ''
    }
    if (name === 'speed') {
      // console.warn('speed', value)
    }
    if (name == 'description' && value.indexOf("&") != -1) {
      let IdArr = value.split('&').map(item => this.getCardNameByID(item))
      value = IdArr.join('与')
    }
    // debugger  // eslint-disable-line
    let ret = value
    switch (type) {
      case 'NUMBER':
      case 'SELECT':
        if (endWithID.exec(name)) {
          ret = this.getNameByID(name, value)
        }
        break
      case 'DATETIME':
        let sformater = rule && rule === 'SHORT-DATE' ? 'MM-dd hh:mm' : 'yyyy-MM-dd hh:mm:ss'
        ret = new Date(value).format(sformater)
        break
      default:
        // console.warn('未知的字段类型：', type)
        break
    }

    return ret
  }

  /**
   * 从 'xxx_id' 字段获取所对应的名称(name字段)
   * 要求：
   * 1. 所有 id 字段必须为 xxx_id 的形式，其对应表的名字为 dat_xxx，如 map_id, 对应表为 dat_map
   * 2. 有一个 name 字段，如 dat_map 中，有一个 name 字段，是对 map_id 的名称
   * 则： getNameByID('map_id', 5) 可以获得 map_id = 5 的地图的名称
   *
   * @method getNameByID
   *
   * @param  {[type]}    idFieldName  [description]
   * @param  {[type]}    idFieldValue [description]
   *
   * @return {[type]}                   [description]
   */
  getNameByID(idFieldName, idFieldValue) {
    let fieldName = 'name'
    if (idFieldName === 'device_type_id' || idFieldName === 'card_type_id') {
      fieldName = 'detail' // device 和 card 的描述字段是 'detail'
    } else if (idFieldName === 'drivingface_id' || idFieldName === 'coalface_id') {
      idFieldName = 'work_face_id'
    }

    return this.getFieldByID(idFieldName, idFieldValue, fieldName)
  }

  // 根据 cardID 获得绑定对象的名称（name）：人员 - 姓名；车辆 - 车牌
  getCardNameByID(cardID) {
    let name = null

    let objInfo = this.getCardBindObjectInfo(cardID)
    name = objInfo && objInfo.name

    return name
  }

  getFieldByID(idName, idValue, fieldName) {
    let ret = idValue
    let r = endWithID.exec(idName)
    if (r) {
      let ds = this.data[r[1]]
      if (ds) {
        let row = (isNaN(parseInt(idValue, 10)) || (isNaN(Number(idValue)))) ? ds.get(idValue) : ds.get(parseInt(idValue, 10))
        if (row) {
          let label = row[fieldName]
          if (label) {
            ret = label
          }
        }
      }
    }

    return ret
  }

  /**
   * [getList 根据 xx_id 字段，获取对应的列表
   * @param  {[type]} idName [description]
   * @return {[type]}        [list: [{row}, {row}, ...]]
   */
  getList(idName) {
    let list = []
    let r = endWithID.exec(idName)
    if (r) {
      let dsName = r[1]
      let ds = this.data[dsName]
      if (ds) {
        list = ds.values()
      }
    }

    return list
  }

  // ----------- about card ----------- start
  // card, card_type, cardBindedObject(staff, vehicle)
  getCardLevelID(cardID) {
    let info = this.getCardInfo(cardID)
    return info ? info.level_id : null
  }

  getCardLevelInfo(cardID) {
    let cardLevelID = this.getCardLevelID(cardID)
    return cardLevelID ? this.data['level'].get(cardLevelID) : null
  }

  getCardLevelName(cardID) {
    return this.getCardLevelInfo(cardID).name
  }

  getCardTypeID(cardID) {
    let card = this.getCardInfo(cardID)
    return card ? card.card_type_id : -1
  }

  getCardTypeInfo(cardID) {
    let ret = null

    let cardTypeID = this.getCardTypeID(cardID)
    cardTypeID = parseInt(cardTypeID, 10)
    if (cardTypeID >= 0) {
      ret = this.data['card_type'] && this.data['card_type'].get(cardTypeID)
    }

    return ret
  }

  getCardTypeName(cardID) {
    let typeInfo = this.getCardTypeInfo(cardID)
    if (typeInfo && typeInfo.name) {
      let name = typeInfo.name
      return name === 'CMJ' || name === 'JJJ' ? 'vehicle' : name
    } else {
      return undefined
    }
    // return typeInfo ? typeInfo.name : undefined
  }

  getCardInfo(cardID) {
    let cards = this.data['card']
    return cards ? cards.get(cardID) : null
  }

  concatObject(obj1, obj2) {
    for (var key in obj2) {
      // obj1[key] = obj2[key]
      if (obj1.hasOwnProperty(key)) continue// 有相同的属性则略过
      obj1[key] = obj2[key]
    }
    return obj1
  }

  getVehicleCategoryByTypeID(vehicleTypeID) {
    let ret = null

    let vehicleTypes = this.data['vehicle_type']
    let vehicleTypeObj = vehicleTypes && vehicleTypes.get(vehicleTypeID)

    if (vehicleTypeObj) {
      let vehicleCategorys = this.data['vehicle_category']
      ret = vehicleCategorys && vehicleCategorys.get(vehicleTypeObj.vehicle_category_id)
    }

    return ret
  }

  getCardBindName(cardID) {
    cardID = String(cardID)
    cardID = cardID.padStart(13, '00')
    let cardmark = cardID.slice(0, 3)
    let cardType = xdata.metaStore.data.card_type.get(parseInt(cardmark, 10))
    return cardType ? cardType.name : ''
  }

  /**
   * 获得卡所绑定对象的信息
   * @param {*} cardID 卡号
   */
  getCardBindObjectInfo(cardID) { // such as staff or vehicle
    let cardTypeName = this.getCardTypeName(cardID)
    cardTypeName = cardTypeName === 'CMJ' || cardTypeName === 'JJJ' ? 'vehicle' : cardTypeName
    let baseInfoTable = this.data[cardTypeName]
    // if (!baseInfoTable && !this[cardTypeName]) {
    //   this.pullDownMetadata(cardTypeName)
    //   baseInfoTable = this.data[cardTypeName]
    // }

    let objExtendInfo = this.cardIndex.get(cardID)
    // if (!objExtendInfo && !this[cardTypeName + '_extend']) {
    //   this.pullDownMetadata(cardTypeName + '_extend')
    //   objExtendInfo = this.cardIndex.get(cardID)
    // }
    let objID = objExtendInfo && objExtendInfo[cardTypeName + '_id']

    let objBaseInfo = baseInfoTable && baseInfoTable.get(objID)

    // 防止如果一张卡触发拉取元数据，但是并未拉取到，每张push来的定位数据卡重复多次拉取元数据
    this[cardTypeName] = true
    this[cardTypeName + '_extend'] = true

    return this.concatObject(objExtendInfo, objBaseInfo)
  }

  // process driver-arrange data  ------ begin

  // 司机是三班制，获取当前班次的 ID
  // TODO: 需要修改 hardcode
  getCurrentShiftID() {
    let shiftID = -1

    let time = new Date().format('hh:mm:ss')
    if (time >= '23:00:00' || time < '07:00:00') {
      shiftID = 1
    } else if (time >= '07:00:00' && time < '15:00:00') {
      shiftID = 2
    } else {
      shiftID = 3
    }

    return shiftID
  }

  // 更新当前班次的司机排班到 this.driverData 中
  updateDriverData(data) {
    let shiftID = this.getCurrentShiftID()

    let recs = data.filter(item => item.shift_id === shiftID)
    if (recs && recs.length > 0) {
      this.driverData.clear() // clear all preview data first

      for (let i = 0, len = recs.length; i < len; i++) {
        let rec = recs[i]
        // let driverID = rec.staff_id
        // let staff = this.data.staff && this.data.staff.get(driverID)
        // let tel = staff && staff.telephone
        // rec['tel'] = tel
        this.driverData.set(recs[i].vehicle_number, rec)
      }
    }
  }

  getVehicleDriver(vehicleNumber) {
    return this.driverData && this.driverData.get(vehicleNumber)
  }

  /**
   *  获取默认的地图 id，
   */
  getDefaultMapID() {
    let maps = this.data['map_gis'] ? this.data['map_gis'].values() : null
    let defaultMap
    if (maps) {
      maps = Array.from(maps)
      defaultMap = this.getDefaultMapData(maps)
      if (!defaultMap) { // 没有默认字段填写时，为第一张地图
        defaultMap = maps[0]
      }
    }

    return defaultMap ? defaultMap['map_id'] : DEFAULT_MAP_ID
  }

  getDefaultMapData(maps) {
    for (let i = 0, len = maps.length; i < len; i++) {
      if (maps[i].default_map === '是') {
        return maps[i]
      }
    }
  }

  // 是否需要过滤部分卡
  // 被过滤目标不在前端显示,即生效, 目前数据库为1生效
  updateFilterCardFlag() {
    this.needFilterCards = false // 默认不过滤

    let rules = this.dataInArray.get('rules')
    let filterCardRules = rules && rules.filter(item => item.name === 'filtercard')
    let filterCardRule = filterCardRules && filterCardRules[0]

    if (filterCardRule && filterCardRule.status === 1) {
      this.needFilterCards = true
    }
  }

  // 返回一张卡是否显示
  // return : 1 - display, 0 - hide
  needDisplay(cardID) {
    let ret = true
    let objRange = xdata.objRange
    let isCheck = xdata.isCheck
    if (objRange === 1 || isCheck === 1) { // obj.need_display = 0, 不显示
      let obj = this.getCardBindObjectInfo(cardID)
      if (obj && obj.need_display === 0) ret = false
    }

    return ret
  }

  // 根据卡号过滤部门
  filterDept(cardID) {
    if (xdata.depts) {
      let obj = this.getCardBindObjectInfo(cardID)
      let deptID = obj && obj.dept_id
      if (deptID && xdata.depts.includes(deptID)) {
        return true
      }
      return false
    }
    return true
  }
  /**
   * { vehicle_id : 1110 }
   * @param {*}
   */
  needDisplayByJobNumber(obj) { // 过滤通过工号，因为一张卡可绑定不同的对象
    let ret = true
    let needDisplay = null
    let objRange = xdata.objRange
    if (this.needFilterCards) {
      if (obj.vehicle_id) {
        let vData = xdata.metaStore.data.vehicle_extend.get(obj.vehicle_id)
        needDisplay = vData && vData.need_display
      } else if (obj.staff_id) {
        let sData = xdata.metaStore.data.staff_extend.get(obj.staff_id)
        needDisplay = sData && sData.need_display
      }
      if (objRange === 1 && needDisplay === 0) {
        ret = false
      }
    }
    return ret
  }

  // 获得过滤后的 人员/车辆 列表，用于模糊查询
  getFilterCardList() {
    this.filteredStaffs = []
    this.filteredVehicles = []
    let objRange = xdata.objRange
    if (this.needFilterCards && objRange === 1) {
      if (!this.dataInArray.get('staff_extend') || !this.dataInArray.get('vehicle_extend')) {
        return console.warn('请更新server！')
      }
      this.dataInArray.get('staff_extend').filter((item) => {
        if (item.need_display === 1) {
          let objID = item.card_id
          this.filteredStaffs.push(this.getCardBindObjectInfo(objID))
        }
      })
      this.dataInArray.get('vehicle_extend').filter((item) => {
        if (item.need_display === 1) {
          let objID = item.card_id
          this.filteredVehicles.push(this.getCardBindObjectInfo(objID))
        }
      })
    } else {
      this.filteredStaffs = this.dataInArray.get('staff')
      this.filteredVehicles = this.dataInArray.get('vehicle')
    }
    this.filteredVehicles = this.fiilterWorkFaceCard(this.filteredVehicles)
    return {
      staffs: this.filteredStaffs,
      vehicles: this.filteredVehicles
    }
  }

  // 根据 vehicle_id，过滤掉工作面的卡
  fiilterWorkFaceCard(cards) {
    let drivingfaceCards = this.dataInArray.get('drivingface_vehicle')
    if (!drivingfaceCards || drivingfaceCards.length <= 0) {
      return cards
    }

    let filterData = []
    let filteredVechicleID = drivingfaceCards.map(item => item.vehicle_id)
    for (let i = 0, len = cards.length; i < len; i++) {
      if (!filteredVechicleID.includes(cards[i].vehicle_id)) {
        filterData.push(cards[i])
      }
    }

    return filterData
  }

  // 登录加载不到元数据时，继续拉取元数据
  // pullDownMetadata (name) {
  //   if (name) {
  //     let dataLongs = this.data[name] && this.data[name].size
  //     if (!dataLongs) {
  //       let sql = `select * from dat_${name}`
  //       this.loopPullDown(name, sql, true)
  //       this.openOnEvent(name)
  //     }
  //   }
  // }

  loopPullDown(name, sql, isLoop) {
    console.log(isLoop)
    let num = 1
    while (num <= 3 && isLoop) {
      let msg = {
        cmd: 'query',
        data: {
          name: name,
          sql: sql
        }
      }

      xbus.trigger('REPT-FETCH-DATA', {
        req: msg,
        def: {
          name: name
        }
      })

      num++
    }
  }

  // openOnEvent (name) {
  //   xbus.on('REPT-SHOW-RESULT', (ds) => {
  //     if (ds.def.name === name) {
  //       this.saveMetaData(ds.def.name, ds.def.rows)
  //       this.loopPullDown('', '', false) // 拉取到数据后，停止拉取数据
  //     }
  //   })
  // }

  /*
  fiilterWorkFaceByCardID (cards) { // 过滤掉工作面的卡通过card_id
    let filterData = []
    let drivingfaceCards = this.dataInArray.get('drivingface_vehicle')
    drivingfaceCards.filter((item) => {
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = xdata.metaStore.data.vehicle_extend.get(item.vehicle_id)
        cardID = cardID && cardID.card_id
        if (cards[i][0] !== cardID) {
          filterData.push(cards[i])
        }
      }
    })
    return filterData
  } */
}
