import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'
import { getPolylineBYPoints, drawOLLine } from './OlMapUtils.js'

export default class OlMapPatrolLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)
    this.mapType = workspace.mapType
    this.map = workspace.map
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this
    xbus.on('REMOVE-PATROL-PATH', () => {
      self.clearPreSource()
    })

    xbus.on('DRAW-PATH', (msg) => { // 接受数据库数据
      self.clearPreSource()
      msg.rows[0] ? this.initLayerPath(msg.rows) : console.warn('没有相关巡检数据！')
      msg.rows[0] ? this.initPoint(msg.rows) : console.warn('没有相关巡检数据！')
    })

    this.map.addEventListener('click', (evt) => {
      if (this.map == null) return
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

      if (feature && feature.getProperties()['data-type'] === 'patrolPoint') {
        let id = feature.getId().split('-')[1]
        this.showTips(evt, feature, id)
      }
    })
  }

  showTips (evt, feature, id) {
    xbus.trigger('PATROL-TOOLTIPS-SHOW', {
      feature: feature,
      id: id,
      evt: evt
    })
  }

  clearPreSource () {
    this.pathSource && this.pathSource.clear()
    this.pointSource && this.pointSource.clear()
  }

  initLayerPath (data) {
    this.pathSource = new ol.source.Vector()
    this.vectorLayer = new ol.layer.Vector({
      source: this.pathSource
    })
    let path = getPolylineBYPoints(data), id = 'patrolPath', className = ''
    drawOLLine(this.pathSource, id, path.pointCol, className)

    if (this.mapType === 'MONITOR') {
      this.map.addLayer(this.vectorLayer)
    }
  }

  initPoint (data) {
    let featureArr = [], len = data.length
    for (let i = 0; i < len; i++) {
      this.drawPoint(featureArr, data[i].patrol_point_id, data[i].x, data[i].y)
    }
    this.pointSource = new ol.source.Vector({
      features: featureArr
    })
    this.pointLayer = new ol.layer.Vector({
      source: this.pointSource
    })
    if (this.mapType === 'MONITOR') {
      this.map.addLayer(this.pointLayer)
    }
  }

  drawPoint (featureArr, id, x, y) {
    let patrolPoint = new ol.geom.Point([x, -y])
    let feature = new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
      name: 'patrolPonit',
      population: 4000,
      rainfall: 500,
      'data-type': 'patrolPoint'
    })
    feature.setId('patrolPonit-' + id)
    feature.setStyle(this.setFeatureStyle(feature))
    feature.setGeometry(patrolPoint)
    featureArr.push(feature)
  }

  setFeatureStyle (feature) {
    return new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.55, 140], anchorXUnits: 'fraction', anchorYUnits: 'pixels', src: '../img/patrolLandmark.png', scale: 0.15
      }))
    })
  }
}
