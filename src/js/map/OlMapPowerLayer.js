import {
  drawSymbol,
  getPolylineBYPoints,
  drawOLLine
} from './OlMapUtils.js'

import ol from 'openlayers'
import OlMapWorkLayer from './OlMapWorkLayer.js'

import {
  getRows,
  getMessage,
  judgeAreaIsneedDisplay,
  testMapID
} from '../utils/utils.js'

import {
  getInfo,
  getReaderMsg,
  getModifyReaderMsg,
  getReaderCoord,
  getIdx
} from '../../config/utils.js'

export default class OlMapPowerLayer extends OlMapWorkLayer {
  constructor (workspace,draw) {
    super(workspace)
    this.map = workspace.map
    this.mapID = workspace.mapID
    this.showToolTip = true
    this.initLayer()
    this.registerGlobalEventHandlers()
  }

  initLayer() {
    this.powerSource = new ol.source.Vector()
    this.powerLayer = new ol.layer.Vector({
      source: this.powerSource,
      style: new ol.style.Style({
        zIndex: 3
      })
    })
    this.powerLayer.setVisible(false)
    this.map.addLayer(this.powerLayer)
    this.isPowerDrawed = false
    this.registerEventHandler(this.map, this.powerLayer)

    return this.readerLayer
  }

  registerGlobalEventHandlers() {
    let self = this
    xbus.on('MAP-SHOW-POWER', (msg) => {
      if (msg.mapType === this.mapType) {
        window.powerLayer = msg.isVisible
        if (msg.isVisible) {
          if (!this.isPowerDrawed) {
            self.drawPowers(msg)
          }
          this.powerLayer.setVisible(true)
        } else {
          this.powerLayer.setVisible(false)
        }
      }
    })

    xbus.on('MAP-LOAD-SUCESS', () => {
      this.mapID = xdata.metaStore.defaultMapID
      this.resetLayer()
      this.powerLayer.setVisible(window.powerLayer)
    })
  }
  
  resetLayer() {
    this.powerSource.clear()
    this.drawPowers()
    this.showToolTip = true
  }

  registerEventHandler(map, layer) {
    if (map == null) return
    let clickTime
    this.map.addEventListener('click', (evt) => {
      clearTimeout(clickTime)
      clickTime = setTimeout(() => {
        let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
        if (feature && feature.getProperties()['data-type'] === 'power') {
          this.showTips(evt, feature)
        }
      }, 250)
    })
  }

  showTips(evt, feature) {
    let dataID = feature.get('data-id')
    let subtype = feature.get('data-subtype')
    let powerInfo = xdata.metaStore.data.reader.get(parseInt(dataID, 10))
    let powerDef = {
      keyIndex: 0,
      label: "电源",
      name: "reader",
      table: "dat_reader",
      fields: {
        names: ['power', 'name', 'position', 'charge', 'support'], // 字段
        types: ['NUMBER', 'STRING', 'STRING', 'STRING', 'STRING'], // 字段类型
        labels: ['电源编号', '型号', '位置信息', '充电状态', '支持分站']
      }
    }
    let power = dataID
    let name = 'KDW660/18B'
    let position = powerInfo.x + ',' + powerInfo.y
    let charge = `正在充电(${dataID}分站)`
    let support = dataID + '分站'
    let coordinate = evt.coordinate
    let msg = {
      type: 'DEVICE',
      subtype: subtype,
      id: dataID,
      event: evt,
      state: {
        def: powerDef,
        rec: {power, name, position, charge, support}
      },
      info: {
        def: powerDef,
        rec: {power, name, position, charge, support}
      },
      coordinate: coordinate
    }
    if (this.showToolTip) {
      xbus.trigger('MAP-TOOLTIPS-SHOW', msg)
    }
  }

  drawPowers() {
    let rows = xdata.metaStore.data.reader && Array.from(xdata.metaStore.data.reader.values())
    for( let reader of rows) {
      if (testMapID(reader.map_id, this.mapID)) {
        let readerId = reader.reader_id
        let attrs = {
          'data-id': readerId,
          'id': readerId,
          'data-type': 'power',
          'data-subtype': 'power',
          x: reader.x,
          y: reader.y
        }
        drawSymbol(attrs, this.powerSource, this.map)
      }
    }
    this.isPowerDrawed = true
  }
}