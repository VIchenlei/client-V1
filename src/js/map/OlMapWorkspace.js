// import { createElement } from './OlMapUtils.js'
import OlMapDeviceLayer from './OlMapDeviceLayer.js'
import OlMapFadeAreaLayer from './OlMapFadeAreaLayer.js'
import OlMapCardLayer from './OlMapCardLayer.js'
import OlMapMeasureLayer from './OlMapMeasureLayer.js'
import OlMapReferenceLayer from './OlMapReferenceLayer.js'
import OlMapCameraLayer from './OlMapCameraLayer.js'
import OlMapGasLayer from './OlMapGasLayer.js'
import OlMapWindLayer from './OlMapWindLayer.js'
import OlMapTemperatureLayer from './OlMapTemperatureLayer.js'
// import OlMapTrackMonitor from './OlMapTrackMonitor.js'
import OlMapTrackPlayer from './OlMapTrackPlayer.js'
// import OlMapTrackLayer from './OlMapTrackLayer.js'
import OlMapAreaLayer from './OlMapAreaLayer.js'
import OlMapAnimator from './OlMapAnimator.js'
import OlMapQueryByGeo from './OlMapQueryByGeo.js'
import OlMapLayerEdit from './OlMapLayerEdit.js'
import OlMapLandmarkEdit from './OlMapLandmarkEdit.js'
import OlMapPatrolLayer from './OlMapPatrolLayer.js'
import OlMapPersonCardsLayer from './OlMapPersonCardsLayer.js'
import OlMapBzlxLayer from './OlMapBzlxLayer.js'
import OlMapTrafficLightsLayer from './OlMapTrafficLightsLayer.js' 
import OlMapShowReaderPath from './OlMapShowReaderPath.js' 
import OlMapFill from './OlMapFill.js'
import OlMapRoutePlan from './OlMapRoutePlan.js'

import OlMapWorkFace from './OlMapWorkFace.js'
import OlMapFaultLayer from './OlMapFaultLayer'
import OlMapPowerLayer from './OlMapPowerLayer.js';
// import SVGAnimator from './SVGAnimator.js'

export default class OlMapWorkspace {
  constructor (map, mapID, mapType) {
    this.map = map
    this.mapID = mapID
    this.mapType = mapType

    // this.workspace = null

    this.referenceLayer = null
    this.cameraLayer = null
    this.deviceLayer = null
    this.fadeAreaLayer = null
    this.cardLayer = null
    this.trackLayer = null
    this.areaLayer = null
    this.landmarkLayer = null
    this.OlMapWorkFace = null
    this.OlMapBzlxLayer = null
    this.measureLayer = null
    this.animator = null
    this.queryByGeo = null
    this.patrolLayer = null
    this.gasLayer = null
    this.windLayer = null
    this.temperatureLayer = null
    this.personCardsLayer = null
    this.trafficLightsLayer = null
    this.powerLayer = null
    this.ShowReaderPath = null
    this.mapFill = null
    this.routePlan = null
    // this.FaultLayer = null
    this.draw = {interaction: 'yes'}
    this.init()
  }

  doHistoryAnimate (msg) {
    // let duration = 990
    this.animator.animate(msg.msg, msg.x, msg.y, msg.duration)
  }

  doAnimate (msg) {
    let cardtype = msg.cardtype
    let duration = cardtype === 'staff' ? xdata.cardStore.averageUpdateDurationStaff * 0.99 : xdata.cardStore.averageUpdateDurationVehicle * 0.99  // 本次动画周期 为 上次数据刷新周期 的 99%，尽量避免动画被中断(车辆)
    // let duration = xdata.cardStore.averageUpdateDurationVehicle * 0.95
    // let duration = 980 // 980 ms
    this.animator.animate(msg.msg, msg.x, msg.y, duration)
  }

  init () {
    this.areaLayer = new OlMapAreaLayer(this)

    switch (this.mapType) {
      case 'MONITOR':
        // this.trackLayer = new OlMapTrackMonitor(this)
        break
      case 'HISTORY':
        this.trackLayer = new OlMapTrackPlayer(this)
        break
      default:
        console.warn('未知的 mapType : ', this.mapType)
    }
    this.fadeAreaLayer = new OlMapFadeAreaLayer(this)
    this.deviceLayer = new OlMapDeviceLayer(this)
    this.cardLayer = new OlMapCardLayer(this)
    this.referenceLayer = new OlMapReferenceLayer(this)
    this.cameraLayer = new OlMapCameraLayer(this)
    this.gasLayer = new OlMapGasLayer(this)
    this.windLayer = new OlMapWindLayer(this)
    this.temperatureLayer = new OlMapTemperatureLayer(this)
    this.patrolLayer = new OlMapPatrolLayer(this)

    this.animator = new OlMapAnimator(this.map)
    // 初始化
    this.measureLayer = new OlMapMeasureLayer(this, this.draw)

    this.queryByGeo = new OlMapQueryByGeo(this, this.cardLayer, this.draw)
    this.OlMapLayerEdit = new OlMapLayerEdit(this, this.draw)
    this.OlMapLandmarkEdit = new OlMapLandmarkEdit(this, this.draw)
    this.OlMapWorkFace = new OlMapWorkFace(this)
    this.OlMapBzlxLayer = new OlMapBzlxLayer(this)
    this.personCardsLayer = new OlMapPersonCardsLayer(this)
    this.trafficLightsLayer = new OlMapTrafficLightsLayer(this,this.draw)
    this.powerLayer = new OlMapPowerLayer(this)
    this.FaultLayer = new OlMapFaultLayer(this)
    this.ShowReaderPath = new OlMapShowReaderPath(this)
    this.mapFill = new OlMapFill(this, this.draw)
    this.routePlan = new OlMapRoutePlan(this, this.draw)
    // this.searchPOILayer = new OlMapSearchPOI(this)
  }

  destroy () {
    this.areaLayer.unregisterGlobalEventHandlers()
    this.areaLayer = null
  }
}
