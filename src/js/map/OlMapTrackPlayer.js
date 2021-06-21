// import TWEEN from 'tween.js'
import OlMapTrackLayer from './OlMapTrackLayer.js'
import { getPolylineBYPoints, drawOLLine } from './OlMapUtils.js'
import ol from 'openlayers'
export default class OlMapTrackPlayer extends OlMapTrackLayer {
  constructor (workspace) {
    super(workspace)
    this.map = workspace.map
    this.trackWhole = null // 整个 track，作为背景
    this.layerSource = new ol.source.Vector()
    this.trackPlayerLayer = new ol.layer.Vector({source: this.layerSource})
    this.trackPlayerLayer.name = 'trackplayerlayer'
    // let length = this.map.getLayers().count
    this.map.addLayer(this.trackPlayerLayer)
  }

  drawWholeTrack (msg, PatrolPath) {
    let cardID = msg.cardID
    this.data = msg.rows
    let data = this.data
    let track = this.drawOLTrack(cardID, data, 'track-whole', PatrolPath)

    this.trackWhole = { cardID: cardID, pathDef: track.pathDef, pathDom: track.pathDom, pathLength: track.pathLength }
    // this.map.getView().setCenter(center);
    /// / 通过 dashArray 和 dashOffset 先隐藏路径
    // this.initAnimation(track.pathLength)
  }

  drawOLTrack (cardID, data, className, PatrolPath) {
    // 1、根据点坐标数据，在cardlayer里面
    let track = null
    let path = getPolylineBYPoints(data)
    if (path.hopCount > 0) {
      let id = `HISTORY_TRACK_${cardID}`
      // track = drawPath(this.canvas, id, pathDef.d, className)
      track = drawOLLine(this.layerSource, id, path.pointCol, className, PatrolPath)
      // console.log(track.popup)
      // this.map.addOverlay(track.popup)
    }
    // this.map.render()
    return { pathDom: track.lineFeature, pathLength: track.lineLength, pathDef: path }
  }
}
