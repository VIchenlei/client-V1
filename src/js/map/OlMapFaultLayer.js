import ol from 'openlayers'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import {judgeURL} from '../utils/utils.js'

const FAULTMAPID = 7 //地质构造图层ID
const UNDERGROUNDCABLE = 6 // 地下三线图层ID

export default class OlMapFaultLayer extends OlMapWorkLayer {
  constructor(workspace) {
    super(workspace)
    this.map = workspace.map
    this.isInnerIP = false // 默认是外网

    this.wmsLayer = null // 地质构造图层
    this.undergroundLayer = null // 地下三线图层

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers() {
    xbus.on('DRAW-FAULT-LAYER', () => {
      this.wmsLayer = this.loadDC(FAULTMAPID)
      this.undergroundLayer = this.loadDC(UNDERGROUNDCABLE)
    })

    xbus.on('MAP-SHOW-FAULT', (msg) => {
      let layerName = msg.symbolType
      let layer = layerName === 'fault' ? this.wmsLayer : this.undergroundLayer
      if (msg.isVisible) {
        layer.setVisible(true)
      } else {
        layer.setVisible(false)
      }
    })

    xbus.on('MAP-LOAD-SUCESS', () => {
      this.wmsLayer = this.loadDC(FAULTMAPID)
      this.undergroundLayer = this.loadDC(UNDERGROUNDCABLE)
    })
  }

  loadDC (layerMapID) {
    //配置对象
    let mapID = 5
    let map = xdata.mapStore.maps && xdata.mapStore.maps.get(layerMapID)
    let row = xdata.metaStore.data.map_gis && xdata.metaStore.data.map_gis.get(layerMapID)
    if (!map) return
    // 判断是否是内网IP
    this.isInnerIP = judgeURL()

    let mapURL = map.tileWmsOpts.url
    map.tileWmsOpts.url = this.isInnerIP && row ? row.inner_url : mapURL
    let mapDef = map
    if (!mapDef) {
      console.warn('NO map definition of the mapID : ', mapID)
      return
    }

    let chooseMap = xdata.mapStore.gisMap && xdata.mapStore.gisMap.get(mapID)
    let projExtent = ol.proj.get('EPSG:3857').getExtent()
    let startResolution = ol.extent.getWidth(projExtent) / 256
    let resolutions = new Array(22)

    for (var i = 0, len = resolutions.length; i < len; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i)
    }

    let extent = [2000, -1500, 12000, 4000] // 地图范围 默认高河地图范围
    if (row) {
      extent = [parseInt(row.minX), parseInt(row.minY), parseInt(row.maxX), parseInt(row.maxY)]
    } else if (chooseMap) {
      extent = [parseInt(chooseMap.minX), parseInt(chooseMap.minY), parseInt(chooseMap.maxX), parseInt(chooseMap.maxY)]
    }

    let tileGrid = new ol.tilegrid.TileGrid({
      extent: extent,
      resolutions: resolutions,
      tileSize: [512, 256]
    })

    let tileWmsOpts = mapDef.tileWmsOpts,
      wmsLayer
    tileWmsOpts.tileGrid = tileGrid
    let mapType = mapDef.type
    if (!mapDef.type) {
      let str = mapDef.tileWmsOpts.url
      mapType = mapDef.tileWmsOpts.url.includes('wms')
      mapType = 'wms'
    }

    chooseMap = {
      map_type: mapType
    }
    let layer = null
    if (chooseMap.map_type === 'wms') {
      layer = new ol.layer.Tile({
        source: new ol.source.TileWMS(tileWmsOpts),
        zIndex: 20
      })
    } else {
      console.warn('unknow map type!')
    }
    this.map.addLayer(layer)
    layer.setVisible(false)

    return layer
  }
}
