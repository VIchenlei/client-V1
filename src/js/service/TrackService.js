import { CARD } from '../def/state.js'
import ol from 'openlayers'
import {ZOOM_LEVEL} from '../def/map_def.js'
export default class TrackService {
  constructor (cardLayer) {
    if (cardLayer.mapType === 'MONITOR') {
      this.cardLayer = cardLayer
      xdata.trackStore.vehicleLayerSource = cardLayer.vehicleLayerSource
      xdata.trackStore.staffLayerSource = cardLayer.staffLayerSource
    }
    this.map = cardLayer.map
    this.vehicleLayerSource = xdata.trackStore.vehicleLayerSource
    this.staffLayerSource = xdata.trackStore.staffLayerSource
    // this.cardLayer = cardLayer
    
    // this.vehicleLayerSource = cardLayer.vehicleLayerSource
    // this.staffLayerSource = cardLayer.staffLayerSource

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    // 切换跟踪状态
    window.trackToggle = (msg) => {
      self.toggleTracking(msg)
    }
    // xbus.on('CARD-TRACKING-TOGGLE', (msg) => {
    //   self.toggleTracking(msg)
    // })

    // 进入跟踪状态
    // xbus.on('CARD-TRACKING-START', (msg) => {
    //   self.startTracking(msg.cards[0])
    // })

    // 退出跟踪状态
    // xbus.on('CARD-TRACKING-STOP', (msg) => {
    //   self.stopTracking(msg.cards[0])
    // })

    xbus.on('MAP-CARD-UPDATE', (msg) => {
      if (msg && msg.card && xdata.trackStore.has(msg.card[CARD.card_id])) {
        this.trackTo(msg.card)
      }
    })

    let select = null
    // this.map.on('click', function (evt) {
    //   let pixel = self.map.getEventPixel(evt.originalEvent)
    //   // let selectSingleClick = new ol.interaction.Select()
    //   self.changeInteraction(select, pixel)
    // })
  }

  changeInteraction (select, pixel) {
    let feature = this.map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature
    })
    let id = feature ? feature.getId() : ''
    let self = this

    if (id === 'hisTrackLine') {
      setTimeout(function () {
        self.changeLineColor('#FF3333', feature, 8, 3)
        setTimeout(function () {
          self.changeLineColor('yellow', feature, 6, 3)
          setTimeout(function () {
            self.changeLineColor('#FF3333', feature, 8, 3)
            setTimeout(function () {
              self.changeLineColor('yellow', feature, 6, 3)
            }, 300)
          }, 300)
        }, 300)
      }, 300)
    }
  }

  changeLineColor (color, feature, width, zIndex) {
    feature.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: width,
        color: color,
        zIndex: zIndex
      })
    }))
  }

  // 对象移动时，增加一段轨迹
  trackTo (card) {
    let cardID = card[CARD.card_id]
    let cardTypeName = this.getCardTypeName(cardID)

    // line feature
    let lineFeatureID = cardID + 'line'
    let feature = this.getFeature(cardID, cardTypeName, lineFeatureID)

    // 增加 track 的线段
    if (feature && feature.getId() === lineFeatureID) {
      let linestring = feature.getGeometry()
      linestring.appendCoordinate([card[CARD.x], -card[CARD.y]])
      feature.setGeometry(linestring)
    }
  }

  toggleTracking (msg) {
    let cards = msg.cards
    for (let i = 0, len = cards.length; i < len; i++) {
      let cardID = cards[i]
      xdata.trackStore.has(cardID) ? this.stopTracking(cardID) : this.startTracking(cardID)
    }
  }

  getCardTypeName (cardID) {
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    if (!cardTypeName) {
      cardID = String(cardID)
      if (/^001/.test(cardID)) {
        cardTypeName = 'staff'
      } else if (/^002/.test(cardID)) {
        cardTypeName = 'vehicle'
      }
    }
    return cardTypeName
  }

  startTracking (cardID) {
    let cardTypeName = this.getCardTypeName(cardID)

    // line feature
    let lineFeatureID = cardID + 'line'
    let lfeature = this.getFeature(cardID, cardTypeName, lineFeatureID)

    if (!lfeature) { // new track line
      // icon feature
      let iconFeatureID = cardID
      let ifeature = this.getFeature(cardID, cardTypeName, iconFeatureID)
      let coord = ifeature && ifeature.getGeometry().getCoordinates()
      if (!coord) {
        let card = xdata.cardStore.getLastState(cardID)
        let x = Number(card[CARD.x])
        let y = -Number(card[CARD.y])
        coord = [x, y]
      }
      let posdata = [coord, coord]  // 开始时两个点重合

      let trackFeature = new ol.Feature({
        geometry: new ol.geom.LineString(posdata)
      })
      trackFeature.setProperties({type: 'trackFeature'})
      trackFeature.setId(lineFeatureID)
      trackFeature.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
          width: 3,
          color: [255, 0, 0, 1]
        })
      }))

      this.addFeature(cardID, cardTypeName, trackFeature)
      this.panCenterTo(coord)
    }
  }

  panCenterTo ([x, y]) {
    let view = this.map.getView()

    view.animate({
      center: [x, y],
      duration: 1000,
      zoom: ZOOM_LEVEL.STAFFLEAVE
    })
  }

  stopTracking (cardID) {
    let cardTypeName = this.getCardTypeName(cardID)

    // line feature
    let lineFeatureID = cardID + 'line'
    let lfeature = this.getFeature(cardID, cardTypeName, lineFeatureID)

    this.removeFeature(cardID, cardTypeName, lfeature)
    xbus.trigger('MAP-UPDATE-SIZE')
  }

  // 往地图上增加 track feature
  addFeature (cardID, cardTypeName, feature) {
    if (cardTypeName === 'vehicle') {
      this.vehicleLayerSource.addFeature(feature)
    } else if (cardTypeName === 'staff') {
      this.staffLayerSource.addFeature(feature)
    }

    xdata.trackStore.set(cardID, true)
  }

  // 从地图上删除 track feature
  removeFeature (cardID, cardTypeName, feature) {
    if (feature) {
      if (cardTypeName === 'vehicle') {
        this.vehicleLayerSource && this.vehicleLayerSource.getFeatureById(cardID + 'line') && this.vehicleLayerSource.removeFeature(feature)
      } else if (cardTypeName === 'staff') {
        this.staffLayerSource && this.staffLayerSource.getFeatureById(cardID + 'line') && this.staffLayerSource.removeFeature(feature)
      }
    }

    xdata.trackStore.delete(cardID)
  }

  // 获取地图上的 feature 对象
  getFeature (cardID, cardTypeName, featureID) {
    let feature = null

    if (cardTypeName === 'vehicle') {
      feature = this.vehicleLayerSource.getFeatureById(featureID)
    } else if (cardTypeName === 'staff') {
      feature = this.staffLayerSource.getFeatureById(featureID)
    }

    return feature
  }
}
