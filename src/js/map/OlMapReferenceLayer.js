// import { drawBBox, drawLine } from './OlMapUtils.js'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'
import {drawSymbol} from './OlMapUtils.js'
import { SYMBOL_TYPE } from './Symbol.js'

export default class OlMapReferenceLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)

    this.map = workspace.map
    this.cardLayer = workspace.cardLayer
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    xbus.on('WARN-FACE-PERSON', (msg) => {
      self.updateIconState(msg, 'warn')
    })

    xbus.on('WARN-FACE-LINE', (msg) => {
      self.updateIconState(msg, 'warn')
    })

    // xbus.on('WARN-FACE-NORMAL', (msg) => {
    //   self.updateIconState(msg, 'normal')
    // })
  }

  updateIconState (msg, state) {
    let src = state === 'warn' ? '../../img/warndrivingface.png' : '../img/drivingface.png'
    let id = msg ? msg.id : 3305
    let warningFeature = this.vectorSource && this.vectorSource.getFeatureById(id)
    warningFeature && warningFeature.getStyle().setImage(new ol.style.Icon({
      src: src,
      scale: 0.15,
      rotateWithView: true
    }))
  }

  initLabelLayers () { // 可以继续优化
    // 综采面
    let coalFeature = new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
      name: 'coalFace',
      population: 4000,
      rainfall: 500,
      'data-type': 'label'
    })

    coalFeature.setStyle(this.setFeatureStyle(coalFeature))
    let geo = new ol.geom.Point([3469, 231])
    coalFeature.setGeometry(geo)
    if (xdata.metaStore.dataInArray.get('coalface') && xdata.metaStore.dataInArray.get('coalface')[0]) {
      let id = xdata.metaStore.dataInArray.get('coalface')[0].coalface_id
      coalFeature.setId(id)
    }

  // 掘进面
    let featureArr = []
    // featureArr.push(coalFeature)隐藏综采面
    let drivingface = xdata.metaStore.dataInArray.get('drivingface')
    if (drivingface && drivingface.length > 0) {
      for (var i = 0; i < drivingface.length; i++) {
        let currentMapDrivingFace = drivingface[i].map_id
        if (currentMapDrivingFace === this.mapID) {
          let drivingfaceID = drivingface[i].drivingface_id
          let vehicleID = xdata.metaStore.data.drivingface_vehicle && xdata.metaStore.data.drivingface_vehicle.get(drivingfaceID) && xdata.metaStore.data.drivingface_vehicle.get(drivingfaceID).vehicle_id
          let cardID = xdata.metaStore.data.vehicle_extend && xdata.metaStore.data.vehicle_extend.get(vehicleID) && xdata.metaStore.data.vehicle_extend.get(vehicleID).card_id
          let areaID = xdata.metaStore.data.drivingface_vehicle && xdata.metaStore.data.drivingface_vehicle.get(drivingfaceID) && xdata.metaStore.data.drivingface_vehicle.get(drivingfaceID).area_id
          // console.log('xdata.metaStore.data.vehicle_extend',xdata.metaStore.data.vehicle_extend)
          // console.log('dat_vehicle_type',xdata.metaStore.data.dat_vehicle_type)
          let attrs = {
            'data-id': cardID,
            'card_area': areaID,
            'data-type': SYMBOL_TYPE.CARD,
            'data-subtype': 'vehicle',
            x: drivingface[i].icon_x,
            y: drivingface[i].icon_y,
            type: 'hidecard',
            name: 'tunnellerFace',
            faceID: drivingface[i].drivingface_id
          }
          let layerSource = this.cardLayer.vehicleLayerSource

          return drawSymbol(attrs, layerSource, this.map, 'hidecard')
          // this.drawlabel(featureArr, drivingface[i].drivingface_id, drivingface[i].icon_x, drivingface[i].icon_y)
        }
      }
    }

    // this.vectorSource = new ol.source.Vector({
    //   features: featureArr
    // })

    // this.vectorLayer = new ol.layer.Vector({
    //   source: this.vectorSource
    // })

    // this.map.addLayer(this.vectorLayer)
  }

  drawlabel (featureArr, id, x, y) {
    let tunnellerLabel = new ol.geom.Point([x, -y])
    let tunnellerFeature = new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
      name: 'tunnellerFace',
      population: 4000,
      rainfall: 500,
      'data-type': 'label'
    })
    tunnellerFeature.setId(id)
    tunnellerFeature.setStyle(this.setFeatureStyle(tunnellerFeature))
    tunnellerFeature.setGeometry(tunnellerLabel)
    featureArr.push(tunnellerFeature)
  }

  setFeatureStyle (feature) {
    let porp = feature.getProperties()
    switch (porp.name) {
      case 'coalFace' :
        return new ol.style.Style({
          image: new ol.style.Icon(({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '../img/coalFace.png',
            scale: 0.15,
            rotateWithView: true
          }))
        })
      case 'tunnellerFace':
        return new ol.style.Style({
          image: new ol.style.Icon(({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '../img/drivingface.png',
            scale: 0.15,
            rotateWithView: true
          }))
        })
      default :
        console.warn('please check your code!')
    }
  }
}
