import { createElement } from './OlMapUtils.js'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'
// const maxTrackCount = 10
// let gDuration = 1000  // ms

export default class OlMapTrackLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)
            // this.mapID = workspace.mapID
            // this.mapType = workspace.mapType

    this.hopDuration = 100 // 路径每一跳的动画时延（ms）
    this.layer = this.initLayer(workspace.workspace)
            // this.type = container.getAttribute('data-type')
            // xdata.trackStore = new Map() // {key: cardID, value: track}  , track = {cardInfo: {xxx}, color: '#xxx', path: pathObject}
  }

  initLayer (container) {
    // this.map= workspace.map
    // let cardLayer=new ol.layer.Vector({source:this.layerSource})
    // this.map.addLayer( cardLayer)
    // let canvas = createElement('g', {
    //  id: `${this.mapType}_track`
    /// /})
    // this.registerEventHandler(canvas)
    //
    /// /container.appendChild(canvas)
    //
    // return canvas
  }

  registerEventHandler (canvas) {
    canvas.addEventListener('click', (evt) => {
      let t = evt.target
      if (t.tagName === 'circle') { // 只有点击在 use 元素上才生效
        console.log('CLICK on the line')
      }
    }, false)
  }
}
