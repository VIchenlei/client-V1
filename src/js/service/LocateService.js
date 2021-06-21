import { CARD } from '../def/state.js'
// import { createLabelStyle } from '../map/OlMapUtils.js'
import ol from 'openlayers'
import {ZOOM_LEVEL} from '../def/map_def.js'
import {mercatorToCatesian3} from '../map/CeMapUtils.js'
let map = null
let viewer = null
export default class LocateService {
  constructor (cardLayer) {
    if (cardLayer.mapType === 'MONITOR') {
      map = cardLayer.map
    } else if (cardLayer.mapType === '3DGIS') {
      viewer = cardLayer.map
    }
    this.cardLayer = cardLayer
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    /*
      // 处理  标识卡 的定位，输入消息定位如下
      let msg ={
        action: 'START',  // *, START, STOP
        cards: [id, id, ...],  // *, id list
        type: 'ALARM'  // 可选，默认无此字段或null，即手工触发定位；告警定位为 ALARM
      }
      xbus.trigger('CARD-LOCATING-TOGGLE', (msg))
    */

    // 切换定位状态
    window.triggerLocating = (msg) => {
      self.toggleLocating(msg)
    }

    // 进入定位状态
    window.cardStartLocating = (msg) => {
      let cards = msg.cards
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = cards[i]
        self.startLocating(cardID, msg.type, msg.symbolType)
      }
    }

    window.cardStopLocating = (msg) => {
      let cards = msg.cards
      for (let i = 0, len = cards.length; i < len; i++) {
        let cardID = cards[i]
        self.stopLocating(cardID)
      }
    }

    xbus.on('MEETING-CARS-BEGAIN', (msg) => {
      this.startMeetingCars(msg)
    })

    xbus.on('MEETING-CARS-STOP', (msg) => {
      this.endMeetingCars(msg)
    })
  }

  startMeetingCars (msg) {
    let x = msg.x, y = msg.y, cardID = msg.cardID
    let div = document.createElement('div')
    div.setAttribute('class', 'meetingCars')
    let pointOverlay = new ol.Overlay({
      element: div,
      positioning: 'center-center',
      id: 'meetingCars' + cardID,
      stopEvent: false
    })

    map.addOverlay(pointOverlay)
    pointOverlay.setPosition([x, y])
   // this.panCenterTo(x, y)
  }

  endMeetingCars (msg) {
    let cardID = msg.cardID
    let meetingCars = map.getOverlayById('meetingCars' + cardID)
    meetingCars && map.removeOverlay(meetingCars)
  }
  // 移动地图，将(x,y)放置到视图中心
  panCenterTo (x, y) {
    let view = map.getView()

    view.animate({
      center: [x, y],
      duration: 1000,
      zoom: ZOOM_LEVEL.STAFFLEAVE
    })
  }

  toggleLocating (msg) {
    let type = msg.type
    let cards = msg.cards
    let symbolType = msg.symbolType
    for (let i = 0, len = cards.length; i < len; i++) {
      let cardID = cards[i]
      xdata.locateStore.locates.has(cardID) ? this.stopLocating(cardID) : this.startLocating(cardID, type, symbolType)
    }
  }

  /**
   * 启动单张卡的定位
   * @param {*} cardID 卡号
   * @param {*} type 定位类型
   */
  startLocating (cardID, type, symbolType) {
    let x, y
    if (symbolType) {
      let card = xdata.metaStore.data[symbolType]
      card = card && card.get(Number(cardID))
      if (!card) {
        console.log('当前井下没有此设备', cardID)
        return
      }
      x = card.x
      y = -card.y
    } else {
      let card = xdata.cardStore.getLastState(cardID)
      if (!card) {
        console.warn('当前井下没有此卡: ', cardID)
        return
      }

      x = card[CARD.x]
      y = -card[CARD.y]
    }
    if (!xdata.locateStore.locates.has(cardID)) {
      this.doLocating(cardID, type, x, y)
      xdata.locateStore.locates.set(cardID, true)
      if ((/^001/i).test(cardID)) {
        xdata.locateStore.locatestaff.set(cardID, true)
      } else if ((/^002/i).test(cardID)) {
        xdata.locateStore.locatevehicle.set(cardID, true)
      } else if (symbolType === 'reader') {
        xdata.locateStore.localReader.set(cardID, true)
      } else if(symbolType === 'landmark'){
        xdata.locateStore.locateLandmark.set(cardID, true)        
      }
    }
    this.panCenterTo(x, y)
    // if (type !== 'ALARM') {
    //   this.panCenterTo(x, y)
    // }
    if (window.workFaceLayer) {
      window.workFaceLayer.setVisible(false)
      map.getView().setMaxZoom(ZOOM_LEVEL.MAX)
      window.wmsLayer.setVisible(true)
    }
  }

  doLocating (cardID, type, x, y) {
    let div = document.createElement('div')
    let oclass = 'css_animation'
    if (type === 'ALARM' || type === 'HELP') {
      oclass = 'css_animation_alarm'
    }
    div.setAttribute('id', oclass)
    div.setAttribute('class', 'animation' + cardID)

    let pointOverlay = new ol.Overlay({
      element: div,
      positioning: 'center-center',
      id: 'position' + cardID,
      stopEvent: false
    })

    var svgDataDeclare = 'data:image/svg+xml,'
    var svgCircle = '<circle cx="200" cy="200" r="50" style="fill: #ff6600"><animate id="c1" attributeName="r" attributeType="XML" from="50" to="80" begin="0s" dur="2s" fill="freeze" repeatCount="indefinite" values="50;80;50"/><animate attributeName="fill-opacity" attributeType="CSS" values="1;0.6;1" begin="0s" dur="2s" repeatCount="indefinite"/></circle>'
    var svgPrefix = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="400px" height="400px" xml:space="preserve">'
    var svgSuffix = '</svg>'
    var svgString = svgPrefix + svgCircle + svgSuffix
    var svgEntityImage = svgDataDeclare + svgString

    if (viewer) {
      let entity = viewer.entities.getById(cardID)
      if (entity) {
        let position = entity.mercatorPos
        let cameraPos = mercatorToCatesian3(position.x, position.y, 50)
        entity.billboard = {
          image: svgEntityImage,
          height: 100,
          width: 100
        }
        let homeCameraView = {
          destination: cameraPos,
          duration: 2.0,
          maximumHeight: 2000,
          pitchAdjustHeight: 2000
        }
        viewer.scene.camera.flyTo(homeCameraView)
      }
    }
    // viewer.scene.camera.zoomOut(3000)
    map.addOverlay(pointOverlay)
    pointOverlay.setPosition([x, y])
  }

  /**
   * 停止单张卡的定位
   * @param {*} cardID 卡号
   */
  stopLocating (cardID) {
    let position = map.getOverlayById('position' + cardID)
    position && map.removeOverlay(position)
    if (viewer) {
      let entity = viewer.entities.getById(cardID)
      // 移除3维模型的billboard
      entity.billboard = null
    }
    xdata.locateStore.locates.delete(cardID)
    if ((/^001/i).test(cardID)) {
      xdata.locateStore.locatestaff.delete(cardID, true)
    } else if ((/^002/ig).test(cardID)) {
      xdata.locateStore.locatevehicle.delete(cardID, true)
    } else if (xdata.locateStore.locateLandmark.get(cardID)){
      xdata.locateStore.locateLandmark.delete(cardID, true)
    } else {
      xdata.locateStore.localReader.delete(cardID, true)
    }
  }
}
