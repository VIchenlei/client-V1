import ol from 'openlayers'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import { testMapID } from '../utils/utils.js'
import { drawSymbol } from './OlMapUtils.js'
export default class OlMapFadeAreaLayer extends OlMapWorkLayer {
  constructor(workspace) {
    super(workspace)
    this.map = workspace.map
    this.layersList = this.initLayersList()
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers() {
    xbus.on('FADE-READER-DATA-RESULT', (ds) => {
      if (ds.def.name === 'fadeArea') {
        let rows = ds.rows
        this.drawFadeArea(rows)
        window.xhint.close()
      }
    })

    xbus.on('MAP-HIDE-FADEAREA', (msg) => {
      let readerId = msg.readerId
      if (readerId) {
        let features = this.fadeAreaSource.getFeatures()
        for (let feature of features) {
          let featureReaderId = feature.get('readerId')
          if (featureReaderId == readerId) this.fadeAreaSource.removeFeature(feature)
        }
        if (xdata.metaStore.fadeAreaArr.get(readerId)) xdata.metaStore.fadeAreaArr.delete(readerId)
      } else {
        this.fadeAreaSource.clear()
        xdata.metaStore.fadeAreaArr = new Map()
      }
    })
  }

  initLayersList () {
    this.fadeAreaSource = new ol.source.Vector()
    this.fadeAreaLayer = new ol.layer.Vector({
      source: this.fadeAreaSource,
      zIndex: 0
    })
    this.map.addLayer(this.fadeAreaLayer)
    return this.fadeAreaLayer
  }

  drawFadeArea (rows) {
    this.mapID = xdata.metaStore.defaultMapID 
    for( let reader of rows) {
      if (testMapID(reader.map_id, this.mapID)) {
        let deviceID = reader.reader_id
        let readerObj = xdata.metaStore.data.reader && xdata.metaStore.data.reader.get(deviceID)
        if (readerObj) {
          let fadeValue = readerObj.fade_value
          let distanceCount = reader.distance_count
          if (!xdata.metaStore.fadeAreaArr.get(deviceID)) xdata.metaStore.fadeAreaArr.set(deviceID, {readerId: deviceID})
          let attrs = {
            'data-id': deviceID,
            'data-subtype': 'fadeArea',
            x: readerObj.x,
            y: readerObj.y,
            fadeValue: fadeValue,
            distanceCount: distanceCount,
            name: 'fadeArea'
          }
          drawSymbol(attrs, this.fadeAreaSource, this.map)
        }
      }
    }
  }
}
