import {
  drawSymbol,
  createLabelStyle,
  workFace,
  addPersonNum,
  personOnCar,
  createPosition,
  createLabelStyleStaff
} from './OlMapUtils.js'
import {
  SYMBOL_TYPE
} from './Symbol.js'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'

import LocateService from '../service/LocateService.js'
import TrackService from '../service/TrackService.js'

import {
  CARD
} from '../def/state.js'

import {
  OD,
  ST
} from '../def/odef.js'
import {
  ZOOM_LEVEL
} from '../def/map_def.js'
import {
  testMapID
} from '../utils/utils.js'

const maxZoom = 19
const showStaffLevel = ZOOM_LEVEL.MIDDLE
const MONKEYID = 7 // 上猴车
const MONKEYIDDOWN = 8 // 下猴车
const SPECIALARR = ['special', 'uncover', 'nosignal']
// const SPECIALARR = ['uncover']
const MONKEYAREA = 32 // 猴车巷区域
const MONKEYAREASOUTH = 48 // 南翼猴车巷
const SOUTHROAD = 4
const CMJTYPE = 25
const VEHICLEDISTANCE = 100 // 车辆不做动画的距离
const STAFFDISTANCE = 25 // 人员不做动画的距离
const STAFFSPEED = 8 // 上猴车的速度

export default class OlMapCardLayer extends OlMapWorkLayer {
  constructor(workspace) {
    super(workspace)
    this.mapType = workspace.mapType
    this.map = workspace.map
    this.staff = true
    this.areaStaff = true

    // 在地图上面增加图层
    this.initLayers()
    this.isMeetingCards = []
    this.meetingMap = new Map()
    this.groups = new Map() // 保存 card group 的 DOM 对象，用于后续修改状态，避免 DOM 搜索
    this.registerGlobalEventHandlers()

    this.ls = new LocateService(this)
    this.ts = new TrackService(this)
  }

  initLayers(workCanvas) {
    // 车辆图层
    this.vehicleLayerSource = new ol.source.Vector()
    this.vehicleLayer = new ol.layer.Vector({
      source: this.vehicleLayerSource,
      zIndex: 6
    })

    // 人员明细图层
    this.staffLayerSource = new ol.source.Vector()
    this.staffLayer = new ol.layer.Vector({
      source: this.staffLayerSource,
      zIndex: 5
    })

    // 人员按区域的统计图层
    this.areaStaffSource = new ol.source.Vector()
    this.areaStaffLayer = new ol.layer.Vector({
      source: this.areaStaffSource,
      zIndex: 10
    })

    this.map.addLayer(this.vehicleLayer)
    this.map.addLayer(this.staffLayer)
    this.map.addLayer(this.areaStaffLayer)
    this.registerEventHandler(this.map, this.vehicleLayer)
  }

  registerGlobalEventHandlers() {
    let self = this

    xbus.on('MAP-INIT-CARD', (msg) => {
      if (testMapID(msg.mapID, self.mapID) && msg.mapType === self.mapType && msg.cardType === '*') {
        self.drawAllCards()
      }
    })

    let posdata = []

    xbus.on('MAP-CARD-UPDATE', (msg) => {
      self.mapType !== 'HISTORY' && xdata.reconnect && self.clearStaffs()
      xdata.reconnect = false
      self.mapType !== 'HISTORY' && self.drawCard(msg, posdata)
    })

    xbus.on('REMOVE-MAP-CARD', (msg) => {
      if (!msg.id) {
        return
      }
      if (msg.type === 'staff') {
        let feature = this.staffLayerSource.getFeatureById(msg.id)
        feature && this.staffLayerSource.removeFeature(feature)
      } else if (msg.type === 'vehicle') {
        let feature = this.vehicleLayerSource.getFeatureById(msg.id)
        feature && this.vehicleLayerSource.removeFeature(feature)
      }
    })

    xbus.on('REMOVE-MAP-GROUPCARD', (msg, type) => {
      if (msg && msg[0]) {
        if (type === 'staff') {
          for (let i = 0, len = msg.length; i < len; i++) {
            let card = xdata.metaStore.data.staff.get(msg[i].staff_id),
              cardid
            cardid = card && card.card_id
            let feature = cardid && this.staffLayerSource.getFeatureById(cardid)
            feature && this.staffLayerSource.removeFeature(feature)
          }
        } else if (type === 'vehicle') {
          for (let i = 0, len = msg.length; i < len; i++) {
            let card = xdata.metaStore.data.vehicle.get(msg[i].vehicle_id),
              cardid
            cardid = card && card.card_id
            let feature = cardid && this.vehicleLayerSource.getFeatureById(cardid)
            feature && this.vehicleLayerSource.removeFeature(feature)
          }
        }
      }
    })

    xbus.on('CARD-STATE-CHANGED', () => {
      let rows = xdata.cardStore.getStat(OD.STAFF, ST.AREA)
      if (rows) {
        let viewZoom = this.map.getView().getZoom()
        if (viewZoom >= showStaffLevel || !this.staff || !this.areaStaff) {
          this.areaStaffLayer.setVisible(false)
        } else {
          this.areaStaffLayer.setVisible(true)
        }
        self.mapType !== 'HISTORY' && self.drawAreaStaff(rows, posdata)
      } else {
        self.mapType !== 'HISTORY' && self.drawAreaStaff()
      }
    })

    xbus.on('DRAG-HANDUP-CARD-RES', (msg) => {
      if (msg.state === 0) {
        xdata.dragCardStore.moveCardList.delete(msg.card_id)
      }
    })

    xbus.on('CHANGE-WORKFACE-VEHICLE', (msg) => {
      this.changeWorkfaceVehicle(msg)
    })

    // xbus.on('SOCKET-RECONNECT-SUCCESS', () => {
    //   this.staffLayerSource.clear()
    //   this.groups.clear()
    // })
  }

  registerEventHandler(map, layer) {
    if (this.map == null) {
      return
    }

    let view = this.map.getView()

    xbus.on('MAP-SHOW-CARD', (msg) => {
      let self = this
      self.showCard(msg)
    })

    this.map.addEventListener('click', (evt) => {
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

      if (feature) {
        let type = feature.getProperties()['data-type']
        switch (type) {
          case 'card':
            this.showTips(evt, feature)
            break
          case 'label':
            this.showbox(feature)
            break
            // case 'startMarker':
            //   console.log('start')
            //   break
            // case 'endMarker':
            //   console.log('end')
            //   break
          case 'staffArea':
            let groupID = feature.getProperties('staffArea').areaid
            let msg = {
              type: 'card',
              subTypeID: OD.STAFF,
              statType: ST.AREA,
              groupID: parseInt(groupID, 10),
              area: true
            }
            window.showDetailDialog(msg)
            break
          case 'camera':
            xbus.trigger('START-PLAY-VEDIO', {
              evt: evt,
              feature: feature
            })
            break
          case 'device':
          case 'landmark':
            break
          default:
            xbus.trigger('HIDE-ALL-POPUP')
        }
      } else {
        // this.tooltipsContainer.classList.add('hide')
        // document.querySelector('.hisTrack').classList.add('hide')
        // this.cardtipsContainer.classList.add('hide')
        xbus.trigger('HIDE-ALL-POPUP')
      }
    })

    this.map.getView().addEventListener('change:resolution', (evt) => {
      let viewZoom = view.getZoom()
      if (this.mapType === 'HISTORY') {
        this.staffLayer.setVisible(true)
      } else if (this.staff) {
        if (viewZoom >= showStaffLevel) { // 显示人员图标
          this.areaStaffLayer.setVisible(false)
          this.staffLayer.setVisible(true)
          if (viewZoom > ZOOM_LEVEL.STAFFLEAVE) {
            this.adjustStaffs(viewZoom)
          } else {
            let isStaffChange = this.judgeZoomlevel(viewZoom, 'staff')
            isStaffChange && this.adjustStaffs(viewZoom) // 调整人员图标随地图放大而缩小
          }
          // let isStaffChange = this.judgeZoomlevel(viewZoom, 'staff')
          // isStaffChange && this.adjustStaffs(viewZoom) // 调整人员图标随地图放大而缩小
        } else { // 显示人员区域数量
          this.areaStaff ? this.areaStaffLayer.setVisible(true) : this.areaStaffLayer.setVisible(false)
          this.staffLayer.setVisible(false)
        }
      } else {
        this.areaStaffLayer.setVisible(false)
        this.staffLayer.setVisible(false)
      }

      this.changeScaleVehicle(viewZoom)
    })
  }

  changeWorkfaceVehicle(datas) {
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i]
      let cardID = data[0]
      let new_state = data[1]
      let group = this.vehicleLayerSource.getFeatureById(cardID)
      if (group) {
        let img = group.getStyle() ? group.getStyle().getImage().getSrc() : ''
        let old_state = /ON.png$/g.test(img) ? 1 : 0
        if (new_state !== old_state && img) {
          let card = xdata.cardStore.vcards.get(cardID)
          this.removeOldDrawNew(cardID, 'vehicle', group, card, '', new_state)
        }
      }
    }
  }

  clearStaffs() {
    this.staffLayerSource.clear(true)
    this.groups.clear()
  }

  changeScaleVehicle(viewZoom) {
    let shouldChange = this.judgeZoomlevel(viewZoom)
    let features = this.vehicleLayerSource.getFeatures()
    for (let feature of features) {
      let featureID = feature.getId()
      let vehicle = xdata.metaStore.getCardBindObjectInfo(featureID)
      let vehicleType = vehicle && vehicle.vehicle_type_id
      if (vehicleType === CMJTYPE) {
        feature.setStyle(createLabelStyle(feature, null, viewZoom, 0, this.map))
      } else if (shouldChange) {
        if (!/line/g.test(featureID)) {
          let type = feature.getProperties() && feature.getProperties().type

          let img = feature.getStyle() && feature.getStyle().getImage()
          let rotation = img ? img.getRotation() : 0
          if (type !== 'trackFeature' && viewZoom < maxZoom) {
            feature.setStyle(createLabelStyle(feature, type, viewZoom, rotation, this.map)) // Don't change the order
          } else if (viewZoom >= maxZoom) {
            let isfeature = this.workspace.OlMapWorkFace.layerSource.getFeatureById('workface')
            if (isfeature) {
              this.workspace.OlMapWorkFace && this.workspace.OlMapWorkFace.adjustmentVehicle(this.workspace.OlMapWorkFace.cardID)
            }
          }
        }
      }
    }
  }

  adjustStaffs(viewZoom) {
    let features = this.staffLayerSource.getFeatures()
    for (let feature of features) {
      let type = feature.getProperties() && feature.getProperties().type
      let state = feature.getProperties() && feature.getProperties()['card_state']
      let featureID = feature.getId()
      if (!/line/g.test(featureID)) {
        feature.setStyle(createLabelStyleStaff(feature, type, state, viewZoom, this.map))
      }
    }
  }

  judgeZoomlevel(viewZoom, type) {
    let zoomLevel = '',
      preZoomlevel = this.map.getView().getProperties().zoomLevel
    if (viewZoom < ZOOM_LEVEL.SMALL) {
      zoomLevel = 'SMALL'
    } else if (viewZoom < ZOOM_LEVEL.MIDDLE) {
      zoomLevel = 'MIDDLE'
    } else {
      zoomLevel = 'MAX'
      if (type === 'staff') {
        if (viewZoom < ZOOM_LEVEL.STAFFLEAVE) {
          zoomLevel = 'STAFFSMALL'
        }
      }
    }
    return preZoomlevel !== zoomLevel
  }

  showCard(msg) {
    let viewZoom = this.map.getView().getZoom()
    if (msg.isVisible) {
      if (msg.symbolType === 'vehicle') {
        this.vehicleLayer.setVisible(true)
      } else if (msg.symbolType === 'staff') {
        this.staff = true
        // this.staffLayer.setVisible(true)
        if (viewZoom >= showStaffLevel) {
          this.staffLayer.setVisible(true)
        } else {
          this.areaStaffLayer.setVisible(true)
        }
      } else if (msg.symbolType === 'area_person') {
        this.areaStaff = true
        this.areaStaffLayer.setVisible(true)
      }
    } else {
      if (msg.symbolType === 'vehicle') {
        this.vehicleLayer.setVisible(false)
        let keys = xdata.locateStore.getInArrayVehicle()
        window.triggerLocating({
          cards: keys
        })
      } else if (msg.symbolType === 'staff') {
        this.staff = false
        this.areaStaffLayer.setVisible(false)
        this.staffLayer.setVisible(false)
        let keys = xdata.locateStore.getInArrayStaff()
        window.triggerLocating({
          cards: keys
        })
      } else if (msg.symbolType === 'area_person') {
        this.areaStaff = false
        this.areaStaffLayer.setVisible(false)
      }
    }
  }

  /**
   * [drawAllCards 用于在切换至 mapID 时，将 model(即cardStore) 中的信息显示到对应地图上]
   * @param  {[type]} mapID           [description]
   * @param  {[type]} cardsCanvasList [description]
   */
  drawAllCards() {
    let cardsOnMap = xdata.cardStore.getCardsOnMap(this.mapID)
    if (cardsOnMap && cardsOnMap.size > 0) {
      // clean all card canvas of the map
      for (let key in this.canvasList) {
        this.canvasList[key].innerHTML = ''
      }

      for (let card of cardsOnMap) {
        let cardID = card[CARD.card_id]
        // let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
        // let canvas = this.canvasList[cardTypeName]
        let group = this.drawCardOn(card, 'card-update')

        this.groups.set(cardID, group)
      }
    }
  }

  /**
   * 根据图标中心点 pos，计算整个 group 的左上角坐标
   * @param {*} group 整个图标组（ 包括图标 和 label ）
   * @param {*} pos  中心点
   */
  getGroupLeftTop(group, pos) {
    let bgBox = group.bg.getBBox()
    let gBox = group.g.getBBox()

    let x = pos.x - (bgBox.x - gBox.x + bgBox.width / 2)
    let y = pos.y - (bgBox.y - gBox.y + bgBox.height / 2)

    return {
      x: x,
      y: y
    }
  }

  drawAreaStaff(datas, posdata) {
    this.areaStaffLayer.getSource().clear()
    if (datas) {
      for (let data of datas) {
        data[0] !== 0 && this.drawAllPerson(data)
      }
    }
  }

  drawAllPerson(data) {
    let areas = xdata.metaStore.dataInArray.get('area')
    // let staffAreas = areas && areas.filter(item => item.area_id === data[0])
    // let staffArea = staffAreas && staffAreas[0]
    this.drawStaffs(data)
  }

  changeText(group, data) {
    let text = group.getStyle() ? group.getStyle().getText() : ''
    if (text) {
      let newText = data[2] + data[1] + '人'
      text.setText(newText)
      group.set('totle', newText)
    }
  }

  stringDivider(str, width, spaceReplacer) {
    if (str.length > width) {
      var p = width
      while (p > 0 && str[p] != ' ') {
        p--
      }
      if (p > 0) {
        var left = str.substring(0, p)
        var right = str.substring(p + 1)
        return left + spaceReplacer + this.stringDivider(right, width, spaceReplacer)
      }
    }
    return str
  }

  drawStaffs(data) {
    let areaID = data[0]
    let areaLists = xdata.areaListStore.arealist
    if (areaLists && areaLists.get(areaID)) {
      let area = areaLists.get(areaID)
      if (xdata.isCheck === 1 && area.need_display === 0) return
      let polygon = areaLists.get(areaID)
      let extent = polygon.getExtent()
      let coord = ol.extent.getCenter(extent)
      if (coord.every(item => isNaN(item))) return
      let centerPoly = new ol.geom.Point(coord)
      if (areaID == MONKEYAREA) {
        centerPoly = new ol.geom.Point([4572, -63])
      } else if (areaID === MONKEYAREASOUTH) {
        centerPoly = new ol.geom.Point([5403, -242])
      } else if (areaID === SOUTHROAD) {
        centerPoly = new ol.geom.Point([5791, -420])
      }
      let feature = new ol.Feature(centerPoly)
      let areaNumber = data[1]
      // if (xdata.isCheck === 1) {
      //   let areas = xdata.metaStore.data.area
      //   let area = areas && areas.get(areaID)
      //   let overCountPersonRP = area && area.over_count_person_rp
      //   if (areaNumber > overCountPersonRP) areaNumber = overCountPersonRP
      // }
      let text = data[2] + ' ' + areaNumber + '人'
      let totle = this.stringDivider(text, data[2].length, '\n')
      let msg = {
        'totle': totle,
        'areaid': data[0],
        'data-type': 'staffArea',
        'number': parseInt(data[1])
      }
      feature.setProperties(msg)
      feature.setId('staffArea' + data[0])
      this.areaStaffSource.addFeature(feature)
      feature.setStyle(this.createStaffAreaStyle(feature))
    }
  }

  createStaffAreaStyle(feature) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.6)'
        }),
        radius: 40,
        stroke: ol.style.Stroke({
          color: '#000000',
          width: 2
        })
      }),
      text: new ol.style.Text({
        text: feature.get('totle'),
        font: '18px',
        textAlign: 'center',
        fill: new ol.style.Fill({
          color: '#000000'
        })
      })
    })
  }

  //  根据卡号、卡类型获取对应的 feature
  getFeature(cardID, cardTypeName) {
    let feature = null
    if (cardTypeName === 'vehicle' || String(cardID).match(/^002/)) {
      feature = this.vehicleLayerSource.getFeatureById(cardID)
    } else if (cardTypeName === 'staff' || String(cardID).match(/^001/)) {
      feature = this.staffLayerSource.getFeatureById(cardID)
    }
    return feature
  }

  // 将卡画在地图上
  drawCard(msg, posdata) {
    let cmd = msg.cmd
    let needMove = msg.needMove // 是否需要动画 true:不需要动画
    let card = msg.card
    let cardID = card[CARD.card_id]
    let speed = Number(card[CARD.speed])
    let type = cmd === 'NOSIGNAL' ? 'nosignal' : null

    // 在画卡或卡动画前，先判断是是否为清除盲区卡，主要针对车卡
    let drag = this.judgeDragCard(cmd, cardID)
    if (drag === 'drag') {
      return
    }

    let areaID = card[CARD.area_id]
    let mapID = card[CARD.map_id] ? card[CARD.map_id] : msg.card.map_id
    let defaultMapID = parseInt(xdata.metaStore.defaultMapID, 10)
    if (cmd !== 'UPMINE' && !testMapID(mapID, defaultMapID)) return 

    let state = card[CARD.state_object]
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    let group = this.getFeature(cardID, cardTypeName)

    let viewZoom = this.map.getView().getZoom()

    // 是否显示 staffLayer
    let isShowStaffLayer = this.mapType === 'HISTORY' ? true : false
    if (this.staff && viewZoom >= showStaffLevel) {
      isShowStaffLayer = true
    }
    this.staffLayer.setVisible(isShowStaffLayer)

    switch (cmd) {
      case 'POSITION':
      case 'DOWNMINE':
      case 'NOSIGNAL': // 丢失信号时如果有坐标变化，也做移动处理，若此时状态还是进入盲区则推送数据问题
        if (group) {
          this.judgePreCardState(card, group, cardTypeName, 'POSITION', type)
          this.judgePreCardColor(card, group, cardTypeName, type)
          if (needMove) {
            this.setCardCoord(cardID, group, card)
          } else {
            cardTypeName === 'staff' && this.judgePreCardMonky(card, group, state, type)
            let isAnimate = speed > 0 && this.setOrAnimate(card, cardTypeName)
            if (isAnimate) {
              if (isAnimate !== 'nomove') this.cardAnimation(cardID, group, card, cardTypeName)
            } else {
              this.setCardCoord(cardID, group, card)
            }
          }
        } else {
          group = this.drawCardOn(card, 'card-add', type)
          group && this.groups.set(cardID, group)
        }
        break
      case 'SPECIAL': // 胶轮车 无label
        if (group) {
          this.judgePreCardState(card, group, cardTypeName, 'special', 'special')
          this.judgePreCardColor(card, group, cardTypeName, type)
          if (needMove) {
            this.setCardCoord(cardID, group, card)
          } else {
            speed > 0 && this.cardAnimation(cardID, group, card, cardTypeName)
          }
        } else {
          group = this.drawCardOn(card, 'card-add', 'special')
          group && this.groups.set(cardID, group)
        }
        break
      case 'UPMINE':
        this.deleteCardFrom(cardID)
        break
      case 'UNCOVER': // 非覆盖 无速度
        if (cardTypeName === 'staff') {
          if (group) {
            if (needMove) {
              this.setCardCoord(cardID, group, card)
            } else {
              speed > 0 && this.cardAnimation(cardID, group, card, cardTypeName)
            }
          } else {
            group = this.drawCardOn(card, 'card-add')
            group && this.groups.set(cardID, group)
          }
        } else {
          this.uncoverArea(card, cardID, cardTypeName, areaID)
          let positionLay = this.map.getOverlayById('position' + cardID)
          if (positionLay) {
            this.map.removeOverlay(positionLay)
            xdata.locateStore.locates.delete(cardID)
          }
        }
        break
      case 'NOCHANGE':
        if (group) {
          this.judgePreCardColor(card, group, cardTypeName, type)
          // this.judgePreUncoverCardPos(card, group, cardTypeName) // 判断非覆盖区域卡位置
        } else {
          group = this.drawCardOn(card, 'card-add', type)
          group && this.groups.set(cardID, group)
        }
        break
      default:
        console.warn(`未知的标识卡指令 ${msg.cmd}`)
    }
    return group
  }

  setOrAnimate(card, cardTypeName, group) {
    let curView = this.map.getView()
    let curZoom = curView.getZoom()
    let setOrAnimate = card[CARD.set_move] // 0：动画；1：定位
    let isAnimate = false // 是否做动画
    let isMove = null
    if (cardTypeName === 'vehicle') {
      isAnimate = setOrAnimate === 0 ? true : false
    } else { // 人员 < 21 不做动画
      if (curZoom < 21) {
        isAnimate = false
      } else {
        let curExtent = curView.calculateExtent()
        let coords = {
          x: card[CARD.x],
          y: -card[CARD.y]
        }
        // 在可视范围内
        if (coords.x > curExtent[0] && coords.x < curExtent[2] && coords.y > curExtent[1] && coords.y < curExtent[3]) {
          // if (curZoom < 21) { // 可视范围内的显示小点 不做动画
          //   isAnimate = false
          // } else {
          //   isAnimate = setOrAnimate === 1 ? false : true
          // }
          isAnimate = setOrAnimate === 1 ? false : true
        } else {
          // if (curZoom >= 21) { // 显示人员图标时，更新人员位置
          //   isAnimate = false
          // } else { // 显示人员小圆点时，不做移动处理
          //   isMove = 'nomove'
          // }
          isAnimate = false
        }
      }
    }
    return isMove ? isMove : isAnimate
  }

  judgePreUncoverCardPos(card, group, cardTypeName) {
    let areaID = card[CARD.area_id]
    let uncoverAreaID = xdata.metaStore.data.area_ex && xdata.metaStore.data.area_ex.get(areaID)
    if (uncoverAreaID) {
      let uncoverAreaRange = xdata.areaListStore.uncoverAreaList && xdata.areaListStore.uncoverAreaList.get(areaID)
      let x = card[CARD.x]
      let y = card[CARD.y]
      if (uncoverAreaRange && !uncoverAreaRange.intersectsCoordinate([x, -y])) {
        let attrs = {
          'card_area': areaID,
          x: x,
          y: y
        }
        let pos = createPosition(attrs)
        pos = pos && pos.getCoordinates()
        pos && group.getGeometry() && group.getGeometry().setCoordinates(pos)
      }
    }
  }

  judgeDragCard(cmd, cardID) {
    // let dragCardList = xdata.dragCardStore.dragCardList
    let dragCardList = xdata.dragCardStore.moveCardList
    if (dragCardList && dragCardList.get(cardID) && cmd === 'NOSIGNAL') {
      return 'drag' // 在列表中并且状态为1024，不允许移动
    } else {
      xdata.dragCardStore.moveCardList.delete(cardID)
      return 'notDrag' // 不在列表 or 状态不为1024，允许移动
    }
  }

  meetingCards(group, state, x, y, cardID) {
    let msg = {
      group: group,
      cardID: cardID,
      state: state,
      x: x,
      y: y
    }
    if (state === 3) {
      let hasSameGroupMeeting = this.getExtendDis(cardID, x, y)
      if (hasSameGroupMeeting) {
        if (!this.meetingMap.get(cardID)) { // 如果此时已经有了该卡的gif,移动时不应该再次重画gif
          this.meetingMap.set(cardID, cardID)
          xbus.trigger('MEETING-CARS-BEGAIN', msg)
        }
      }
    } else if (state === 4) {
      this.meetingMap.delete(cardID)
      xbus.trigger('MEETING-CARS-STOP', msg)
    }
  }

  getExtendDis(cardId, x, y) { // 判断如果x,y距离不超过7的话只有一个gif会车效果
    let arr = this.isMeetingCards,
      len = arr.length,
      msg = {
        x: x,
        y: y
      }
    if (len === 0) {
      this.isMeetingCards.push(msg)
      return true
    }
    for (let i = 0; i < len; i++) {
      if (arr[i].x - 7 < x && x < arr[i].x + 7 && arr[i].y - 7 < y && y < arr[i].y + 7) {
        return false
      } else {
        this.isMeetingCards.push(msg)
        return true
      }
    }
  }

  filterNeedDisplayCard(cardID, cardTypeName) {
    let state = xdata.metaStore.needDisplay(cardID)
    if (state) {
      return
    }
    console.warn('该卡已被过滤,后台不应推送改卡数据', cardID)
    let feature
    switch (cardTypeName) {
      case 'vehicle':
        feature = this.vehicleLayerSource.getFeatureById(cardID)
        feature && this.vehicleLayerSource.removeFeature(feature)
        break
      case 'staff':
        feature = this.staffLayerSource.getFeatureById(cardID)
        feature && this.staffLayerSource.removeFeature(feature)
        break
      default:
        console.warn('Unknown cardTypeName,please check config!')
    }
  }

  removeOldDrawNew(cardID, cardTypeName, group, card, type, state) {
    let cardBindObj = xdata.metaStore.getCardBindObjectInfo(cardID)
    if (cardBindObj) {
      if (cardTypeName === 'vehicle') {
        this.vehicleLayerSource.getFeatures().includes(group) && this.vehicleLayerSource.removeFeature(group)
      } else if (cardTypeName === 'staff') {
        this.staffLayerSource && this.staffLayerSource.getFeatures().includes(group) && this.staffLayerSource.removeFeature(group)
      }
      // 重画
      group = this.drawCardOn(card, 'card-add', type, state)
      this.groups.set(cardID, group)
    }
  }

  // 判断该卡是否是黑色图标/label是否显示为卡号/该卡之前是否显示图片
  judgePreCardColor(card, group, cardTypeName, type) {
    let img = group.getStyle() ? group.getStyle().getImage().getSrc() : ''
    let cardID = card[CARD.card_id]
    if (img && (/unregistered/ig).test(img)) {
      this.removeOldDrawNew(cardID, cardTypeName, group, card, type)
    }
  }

  // 车只有label改变，车辆图标不改变
  // judgePreCardState (card, group, cardTypeName, special, type) {
  //   let style = group.getStyle()
  //   let text = style ? style.getText() : ''
  //   let isPreviewInUncoverArea = group.getProperties().type
  //   let cardID = card[CARD.card_id]
  //   if (this.mapType === 'MONITOR' && text) {
  //     // 正常区域-特殊区域
  //     if (!SPECIALARR.includes(isPreviewInUncoverArea) && SPECIALARR.includes(special)) {
  //       let newText = card[CARD.object_id] || String(cardID)
  //       text.setText(newText)
  //       group.set('data-number', card[CARD.object_id])
  //     } else {
  //       // 特殊区域-正常区域，正常-正常
  //       // let preSpeed = group.get('card-speed')
  //       // let speed = card[CARD.speed]
  //       // if (preSpeed != speed) {
  //         if (!SPECIALARR.includes(special)) {
  //           let newText = `${card[CARD.object_id] || String(cardID)}|${card[CARD.speed]}Km/h`
  //           text.setText(newText)
  //           group.set('card-speed', card[CARD.speed])
  //           group.set('data-number', newText)
  //         }
  //       // }
  //     } 
  //   }
  // }

  // 判断该卡之前状态
  judgePreCardState(card, group, cardTypeName, special, type) {
    let style = group.getStyle()
    let text = style ? style.getText() : ''
    let isPreviewInUncoverArea = group.getProperties().type
    let cardID = card[CARD.card_id]
    if (this.mapType === 'MONITOR' && (!SPECIALARR.includes(isPreviewInUncoverArea) && SPECIALARR.includes(special)) || (SPECIALARR.includes(isPreviewInUncoverArea) && !SPECIALARR.includes(special))) {
      // 非覆盖-正/特 or 正-特 or 特-正 都将原卡擦除,再重新画卡
      // if (cardTypeName === 'vehicle') {
      //   this.removeOldDrawNew(cardID, cardTypeName, group, card, type)
      // }
      this.removeOldDrawNew(cardID, cardTypeName, group, card, type) // 车辆label改变，人员图标样式改变
    } else if (text && /Km/ig.test(text.getText())) { // 正-正
      // let newText = card[2] || String(cardID) + '|' + card[CARD.speed] + 'Km/h'
      let newText = `${card[2] || String(cardID)}|${card[CARD.speed]}Km/h`
      newText = addPersonNum(cardID, newText)
      text.setText(newText)
      group.set('card-speed', card[CARD.speed])
      group.set('data-number', card[2])
    }
    if (text && Number(text.getText()) === Number(cardID)) {
      let newText = card[2] ? card[2] : String(cardID)
      text.setText(newText)
      group.set('data-number', card[2])
    } else if (text && text.getText() === 'undefined') {
      let cardObj = xdata.metaStore.getCardBindObjectInfo(cardID)
      let name = cardObj && cardObj.name
      let newText = name || String(cardID)
      text.setText(newText)
      group.set('data-number', card[2])
    }
  }

  // 判斷該卡之前是否是上猴車狀態
  judgePreCardMonky(card, group, state, type) {
    let ismonkeyType = Number(group.getProperties().card_state)
    let cardID = card[CARD.card_id]
    if ((state === MONKEYID && ismonkeyType !== MONKEYID) || (state !== MONKEYID && ismonkeyType === MONKEYID)) {
      this.removeOldDrawNew(cardID, 'staff', group, card, type)
    }
  }

  // // 判斷該卡之前是否是上猴車狀態
  // judgePreCardMonky (card, group, state, type) {
  //   let ismonkeyType = Number(group.getProperties().card_state)
  //   let cardID = card[CARD.card_id]
  //   let preState = group.get('type')
  //   // let img = group.getStyle() ? group.getStyle().getImage().getSrc() : ''
  //   // || (preState === 'nosignal' && type !== 'nosignal') || (preState !== 'nosignal' && type === 'nosignal')
  //   if ((state === MONKEYID && ismonkeyType !== MONKEYID) || (state !== MONKEYID && ismonkeyType === MONKEYID) || (preState === 'nosignal' && type !== 'nosignal') || (preState !== 'nosignal' && type === 'nosignal')) {
  //     this.removeOldDrawNew(cardID, 'staff', group, card, type)
  //   } else {
  //     if (type !== 'nosignal' || state === MONKEYID) {
  //       let style = group.getStyle()
  //       let text = style && style.getText()
  //       let innertext = text && text.getText()
  //       let newText = `${card[CARD.object_id] || String(cardID)}|${card[CARD.speed]}Km/h`
  //       innertext && text.setText(newText)
  //       group.set('card-speed', card[CARD.speed])
  //       group.set('data-number', newText)
  //     }
  //   }
  // }

  // 卡动画
  cardAnimation(cardID, group, card, cardTypeName) {
    let positionLay = this.map.getOverlayById('position' + cardID)
    let msg = {
      group: group,
      positionLay: positionLay
    }

    if (this.mapType === 'HISTORY') {
      let duration = new Date(card[CARD.end_time]).getTime() - new Date(card[CARD.rec_time]).getTime()
      this.workspace.doHistoryAnimate({
        msg: msg,
        x: card[CARD.x],
        y: -card[CARD.y],
        duration: duration / 1000
      })
    } else {
      this.workspace.doAnimate({
        msg: msg,
        x: card[CARD.x],
        y: -card[CARD.y],
        cardtype: cardTypeName
      })
    }
  }

  // 其他页面切换到实时地图页面, 直接给点
  setCardCoord(cardID, group, card) {
    let positionLay = this.map.getOverlayById('position' + cardID)
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    let lineTrack = this.vehicleLayerSource.getFeatureById(cardID + 'line') || this.staffLayerSource.getFeatureById(cardID + 'line')
    let x = card[CARD.x]
    let y = -card[CARD.y]
    let pos = [x, y]
    let oldpos = group.getGeometry().getCoordinates()
    if (oldpos[0] === x && oldpos[1] === y) return
    if (cardTypeName === 'vehicle') {
      let dataType = group.getProperties()['vehicle_type_id']
      if (dataType !== 25 && dataType !== 26) {
        let msg = {}
        msg['group'] = group
        group = this.workspace.animator.rotateIcon(msg, x, y, oldpos)
      }
    }
    group && group.getGeometry() && group.getGeometry().setCoordinates(pos)
    if (positionLay) {
      positionLay.setPosition(pos)
    }
    if (lineTrack) {
      if (cardTypeName === 'staff') {
        // this.staffLayerSource.removeFeature(lineTrack)
      } else if (cardTypeName === 'vehicle') {
        // this.vehicleLayerSource.removeFeature(lineTrack)
      }
    }
    //大跳删除跟踪
    //xdata.trackStore.tracks.delete(cardID)
  }

  // 处理非覆盖区域的逻辑
  uncoverArea(card, cardID, cardTypeName, areaID) {
    let group = null

    if (cardTypeName === 'vehicle') {
      group = this.vehicleLayerSource.getFeatureById(cardID)
    } else {
      group = this.staffLayerSource.getFeatureById(cardID)
    }

    if (group) {
      let isPreviewInSpecialArea = group.getProperties().type
      if (isPreviewInSpecialArea !== 'uncover') {
        if (cardTypeName === 'vehicle') {
          // console.log('UNCOVER', card)
          this.removeOldDrawNew(cardID, cardTypeName, group, card, 'uncover')
        }
      } else {
        this.judgePreCardColor(card, group, cardTypeName)
      }
    } else {
      group = this.drawCardOn(card, 'card-add', 'uncover')
      this.groups.set(cardID, group)
    }
  }

  // 将图标重绘到指定位置
  drawCardJump(msg) {
    let feature = null // card 所对应的 feature

    let cmd = msg.cmd
    let card = msg.card
    // let type = msg.type

    // let mapID = card[CARD.map_id]
    // if (mapID !== this.mapID) {
    //   return
    // }

    let cardID = card[CARD.card_id]
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)

    let layer = null
    if (cardTypeName === 'vehicle') {
      layer = this.vehicleLayerSource
    } else if (cardTypeName === 'staff') {
      layer = this.staffLayerSource
    }
    if (!layer) {
      console.warn('NO such LayerSource found on map : ', cardTypeName)
      return
    }

    switch (cmd) {
      case 'POSITION':
      case 'DOWNMINE':
        feature = layer.getFeatureById(cardID)
        if (feature) {
          layer.removeFeature(feature)
        }

        // 重画 feature
        feature = this.drawCardOn(card, 'card-add')
        this.groups.set(cardID, feature)
        break

      case 'UPMINE':
        this.deleteCardFrom(cardID)
        break
      default:
        console.warn(`未知的标识卡指令 ${msg.cmd}`)
    }

    return feature
  }

  deleteCardsInHisPlayer(msg) {
    let cards = msg.cards

    // let mapID = msg.mapID
    // if (mapID !== this.mapID) {
    //   return
    // }

    for (let i = 0, len = cards.length; i < len; i++) {
      let card = cards[i]
      this.deleteCardFrom(card[0])
    }
  }

  getCardStateName(stateID) {
    return (stateID === 0) ? 'normal' : 'alarm'
  }

  judgeWorkFace(vehicleID) {
    let jueFace = xdata.metaStore.data.drivingface_vehicle && Array.from(xdata.metaStore.data.drivingface_vehicle.values())
    let caiFace = xdata.metaStore.data.coalface_vehicle && Array.from(xdata.metaStore.data.coalface_vehicle.values())
    let name = jueFace.filter(item => item.vehicle_id === vehicleID)
    if (name.length === 0) {
      name = caiFace.filter(item => item.vehicle_id === vehicleID)
    }
    if (name.length > 0) {
      if (name[0].drivingface_id) {
        return {
          name: 'tunnellerFace',
          faceID: name[0].drivingface_id
        }
      } else if (name[0].coalface_id) {
        return {
          name: 'coalFace',
          faceID: name[0].coalface_id
        }
      }
    }
  }

  /**
   * 将 card 对象画在地图上
   * @param {*} canvas
   * @param {*} card
   * @param {*} className
   */
  drawCardOn(card, className, type, workfacestate) {
    let cardID = card[CARD.card_id] ? card[CARD.card_id] : card.card_id
    let areaID = card[CARD.area_id]
    // let state = xdata.metaStore.needDisplay(cardID) // state 为true则需要显示
    // if (!state) {
    //   return console.warn('该卡已被过滤，后台不应推送该卡数据', cardID)
    // }

    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    if (cardTypeName === undefined) {
      if (String(cardID).match(/^002/)) {
        cardTypeName = 'vehicle'
      } else if (String(cardID).match(/^001/)) {
        cardTypeName = 'staff'
      }
    }

    let cardBindObj = xdata.metaStore.getCardBindObjectInfo(cardID)
    let name = ''
    let faceID = ''
    let vehicleTypeID = ''
    if (!cardBindObj) {
      console.warn(`当前系统中卡号为 ${cardID} 的卡没有绑定到 ${cardTypeName}`)
      type = 'unregistered'
    } else {
      // 目前没有需要隐藏的工作面车辆，控制车辆显隐用need_display字段来控制
      // let ishide = workFace({
      //   'data-id': cardID
      // })
      // if (ishide === 'hidecard') {
      //   type = 'hidecard'
      //   let vehicleID = cardBindObj.vehicle_id
      //   let faceObj = this.judgeWorkFace(vehicleID)
      //   name = faceObj && faceObj.name
      //   faceID = faceObj && faceObj.faceID
      // }
      vehicleTypeID = cardTypeName === 'vehicle' && cardBindObj.vehicle_type_id
    }
    let objectID = card[CARD.object_id]
    let attrs = {
      'card': card,
      'data-id': cardID,
      'data-number': objectID,
      'data-type': SYMBOL_TYPE.CARD,
      'data-subtype': cardTypeName,
      'card-speed': card[CARD.speed],
      'card_area': areaID,
      'vehicle_type_id': vehicleTypeID,
      // 'card_occupation': occupationID,
      'card_state': card[CARD.state_object],
      'workface_state': workfacestate, // 采煤机、掘进机状态
      x: card[CARD.x] || Number(card[CARD.x]) === 0 ? card[CARD.x] : card.x,
      y: card[CARD.y] || Number(card[CARD.y]) === 0 ? card[CARD.y] : card.y,
      type: type,
      name: name,
      faceID: faceID,
      playtype: this.mapType
    }

    let layerSource = cardTypeName === 'vehicle' ? this.vehicleLayerSource : this.staffLayerSource
    return drawSymbol(attrs, layerSource, this.map, type)
  }

  /**
   * 将卡号为 cardID 的对象从 canvas 上删除。
   * @param {*} canvas 画布
   * @param {*} cardID 卡号
   */
  deleteCardFrom(cardID) {
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    if (cardTypeName === 'staff' || (/^001/i).test(cardID)) {
      let deleteCardFeature = this.groups.get(cardID)
      let lineCard = this.staffLayerSource.getFeatureById(cardID + 'line')
      if (deleteCardFeature) {
        this.staffLayerSource.removeFeature(deleteCardFeature)
        deleteCardFeature = this.staffLayerSource.getFeatureById(cardID)
        if (deleteCardFeature) {
          this.staffLayerSource.removeFeature(deleteCardFeature)
        }
        this.groups.delete(cardID)
        // console.log('UPMINE', cardID)
        // console.log('UPMINE-GROUP', this.groups)
      }
      if (lineCard) {
        this.staffLayerSource.removeFeature(lineCard)
      }
    }
    let moveLay = this.map.getOverlayById('cardID' + cardID)
    let positionLay = this.map.getOverlayById('position' + cardID)
    if (moveLay) {
      this.map.removeOverlay(moveLay)
    }

    if (positionLay) {
      this.map.removeOverlay(positionLay)
      xdata.locateStore.locates.delete(cardID)
    }
  }

  showTips(evt, feature) {
    let id = feature.get('data-id')
    // let type = t.getAttribute('data-type') // card or device
    let ishide = workFace({
      'data-id': id
    })
    // if (ishide === 'hidecard') {
    //   xbus.trigger('SHOW-WORK-FACE', {
    //     isShow: true,
    //     area: feature.get('card_area'),
    //     map: 'monitormap',
    //     areaChoosed: xdata.areaListStore.arealist.get(Number(feature.get('card_area')))
    //   })
    //   this.showbox(feature)
    // } else {
    let subtype = feature.get('data-subtype') // staff or vehicle; reader or traffic or etc.

    let cardCurrentState = xdata.cardStore.getLastState(id)
    let cardStateDef = xdata.cardStore.stateDefs[subtype]

    let msg = {
      id: id,
      cardtype: subtype,
      event: evt,
      // 以下数据，直接放到 tooltips 中处理，当需要使用时才获取
      state: { // 当前状态
        def: cardStateDef,
        rec: cardCurrentState
      },
      info: { // TODO 基础信息，需根据 card_type_id 关联对应的 vechicle 表或 staff 表
        def: xdata.cardStore.getInfoDef(subtype),
        rec: xdata.cardStore.getInfo(id, subtype)
      },
      curTitleType: this.mapType
    }
    window.cardtips.show(msg)
    // }
  }

  showbox(feature) {
    let name = feature.getProperties().name
    let id = feature.get('faceID')
    let msg = {
      cmd: 'tunneller_stat',
      data: ''
    }
    xbus.trigger('DRIVINGFACE-REQ-DATA', msg)

    if (name === 'coalFace') {
      let sql = `select * from dat_coalface dc where dc.coalface_id = ${id}`
      this.queryData('coalFace', sql)
      riot.mount('popuplabel-coalface', {
        id: id
      })
    } else if (name === 'tunnellerFace') {
      let drivingface = xdata.metaStore.dataInArray.get('drivingface')
      if (drivingface && drivingface.length > 0) {
        for (var i = 0; i < drivingface.length; i++) {
          if (id === drivingface[i].id) {
            id = drivingface[i].id
          }
        }
      } else {
        return console.warn('请检查掘进面配置！')
      }
      let sql = `select * from dat_drivingface dd where dd.drivingface_id = ${id}`
      this.queryData('tunnellerFace', sql)
      riot.mount('dimensional-workface', {
        id: id
      })
    }
  }

  queryData(name, sql) {
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
  }
}
