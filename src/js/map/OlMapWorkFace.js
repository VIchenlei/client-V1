
import {ZOOM_LEVEL} from '../def/map_def.js'
import {drawSymbol} from './OlMapUtils.js'
import { CARD } from '../def/state.js'
import ol from 'openlayers'
export default class OlMapWorkFace {
  constructor (workspace) {
    // super(workspace)
    this.workspace = workspace
    this.map = workspace.map
    this.cardLayer = workspace.cardLayer
    // 工作面图层
    this.layerSource = new ol.source.Vector()
    this.workAreaLayer = new ol.layer.Vector({
      source: this.layerSource,
      zIndex: 1
    })

    // 皮带图层
    this.beltSource = new ol.source.Vector()
    this.beltLayer = new ol.layer.Vector({
      source: this.beltSource,
      zIndex: 2
    })
    this.workAreaLayer.setVisible(false)
    this.beltLayer.setVisible(false)
    this.map.addLayer(this.workAreaLayer)
    this.map.addLayer(this.beltLayer)

    // this.registerEventHandler()
  }

  registerEventHandler () {
    xbus.on('SHOW-WORK-FACE', (msg) => {
      if (this.map.getTarget() !== 'monitormap') return
      if (msg.isShow) {
        this.showWorkArea(msg.area, msg.areaChoosed)
        this.setWorkFaceConfigur('workface')
        window.workFaceLayer = this.workAreaLayer
      } else {
        let feature = this.layerSource.getFeatureById('workface')
        let beltFeature = this.beltSource.getFeatureById('belt')
        if (feature) {
          this.layerSource.removeFeature(feature)
        }
        if (beltFeature) {
          this.beltSource.removeFeature(beltFeature)
        }
        this.setWorkFaceConfigur()
      }
    })
  }

  // 显示工作面二维定位图层
  showWorkArea (area, areaChoosed) {
    if (areaChoosed) {
      let feature = new ol.Feature(areaChoosed)
      feature.setStyle(this.createPolygonStyle('workface'))
      feature.setId('workface')
      feature.setProperties({name: 'workArea'})
      this.layerSource.addFeature(feature)

      let driverFace = xdata.metaStore.data.drivingface_vehicle.values() && Array.from(xdata.metaStore.data.drivingface_vehicle.values()).filter(item => item.area_id === area)
      let driverIcon = driverFace[0] && xdata.metaStore.data.drivingface && xdata.metaStore.data.drivingface.get(driverFace[0].drivingface_id)
      let vehicle = driverFace[0] && xdata.metaStore.data.vehicle_extend && xdata.metaStore.data.vehicle_extend.get(driverFace[0].vehicle_id)

      if (vehicle || driverIcon) {
        // this.drawVehicle(driverIcon)
        this.adjustmentVehicle(vehicle.card_id)
        this.showBeltArea(vehicle.card_id, driverIcon)
        this.pancenterTO(vehicle.card_id, driverIcon)
        this.cardID = vehicle.card_id
      } else {
        console.warn('can not get vehicle')
      }
    }
  }

  // 显示皮带
  showBeltArea (cardID, driverIcon) {
    let card = xdata.cardStore.getLastState(cardID)
    let feature = null
    let coordinates = []
    let x, y
    if (card) {
      x = card[CARD.x]
      y = -card[CARD.y]
    } else if (driverIcon) {
      x = driverIcon.icon_x
      y = -driverIcon.icon_y
    }
    coordinates.push([x - 3, -80], [x + 4, -80], [x + 4, y], [x - 3, y]) // TODO 从数据库中读取
    let polygon = new ol.geom.Polygon([coordinates])
    feature = new ol.Feature(polygon)
    feature.setId('belt')
    feature.setProperties({name: 'belt'})
    feature.setStyle(this.createPolygonStyle('belt'))
    this.beltSource.addFeature(feature)
  }

  setWorkFaceConfigur (name) {
    if (name) {
      window.wmsLayer.setVisible(false)
      this.workAreaLayer.setVisible(true)
      this.beltLayer.setVisible(true)
      this.map.getView().setZoom(19)
      this.map.getView().setMinZoom(19)
      this.map.getView().setMaxZoom(25)
    } else {
      window.wmsLayer.setVisible(true)
      this.workAreaLayer.setVisible(false)
      this.beltLayer.setVisible(false)
      this.map.getView().setMinZoom(ZOOM_LEVEL.MIN)
      this.map.getView().setMaxZoom(ZOOM_LEVEL.MAX)
      window.workFaceLayer = null
    }
  }

  // 调整工作面车辆大小
  adjustmentVehicle (cardID) {
    let vechileLayer = this.cardLayer.vehicleLayerSource
    if (!cardID) return
    let feature = vechileLayer.getFeatureById(cardID)
    if (!feature) return
    let style = feature.getStyle()
    style.getImage().setScale(this.map.getView().getZoom() / 100)
    feature.setStyle(style)
  }

  pancenterTO (cardID, driverIcon) {
    let card = xdata.cardStore.getLastState(cardID)
    let x, y
    if (card) {
      x = Number(card[CARD.x])
      y = -Number(card[CARD.y])
    } else if (driverIcon) {
      x = driverIcon.icon_x
      y = -driverIcon.icon_y
    }
    this.map.getView().setCenter([x + 130, y])
  }

  // 画车辆标志图标
  drawVehicle (driverIcon) {
    let attrs = {
      'data-subtype': 'workFace',
      x: driverIcon.icon_x,
      y: driverIcon.icon_y
    }
    return drawSymbol(attrs, this.layerSource, this.map)
  }

  createPolygonStyle (name) {
    let style = null
    if (name === 'workface') {
      style = {
        stroke: { width: 1, color: [255, 203, 165] },
        fill: { color: [255, 203, 165, 0.4] }
      }
    } else if (name === 'belt') {
      style = {
        stroke: { width: 1, color: [102, 102, 102] },
        fill: { color: [102, 102, 102, 0.6] }
      }
    }
    return new ol.style.Style({
      stroke: new ol.style.Stroke(style.stroke),
      fill: new ol.style.Fill(style.fill)
    })
  }
}
