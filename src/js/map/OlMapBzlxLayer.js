import ol from 'openlayers'

export default class OlMapBzlxLayer {
  constructor (workspace) {
    this.workspace = workspace
    this.map = workspace.map

    this.registerEventHandler()
  }

  registerEventHandler () {
    xbus.on('VectorlayerControl', (msg) => {
      if (this.map.getTarget() !== 'monitormap') return
      let layername = msg.layername
      let isVisible = msg.isVisible
      if (layername === 'bzlx_sz') {
        if (this.drawsz) {
          this.vectorsz.setVisible(isVisible)
        } else {
          this.drawszbz()
        }
      } else if (layername === 'bzlx_hz') {
        if (this.drawhz) {
          this.vectorhz.setVisible(isVisible)
        } else {
          this.drawhzbz()
        }
      }
    })
  }

  drawszbz () {
    let layers = xdata.metaStore.data.gis_layer
    let sz = layers && Array.from(layers.values()).filter(item => item.name === 'sz')
    if (sz.length > 0 && Number(sz[0].map_id) === Number(xdata.metaStore.defaultMapID)) {
      let szurl = `${sz[0].url}request=${sz[0].request}&typename=${sz[0].typename}&outputFormat=${sz[0].outputFormat}&srsname=${sz[0].srsname}&`

      this.vectorSourcesz = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: function () {
          return szurl
        }
      })
      this.vectorsz = new ol.layer.Vector({
        source: this.vectorSourcesz,
        style: this.styleFunction
      })

      this.map.addLayer(this.vectorsz)
      this.drawsz = true
    }
  }

  drawhzbz () {
    let layers = xdata.metaStore.data.gis_layer
    let hz = layers && Array.from(layers.values()).filter(item => item.name === 'hz')
    if (hz.length > 0 && Number(hz[0].map_id) === Number(xdata.metaStore.defaultMapID)) {
      let hzurl = `${hz[0].url}request=${hz[0].request}&typename=${hz[0].typename}&outputFormat=${hz[0].outputFormat}&srsname=${hz[0].srsname}&`
      this.vectorSourcehz = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: function () {
          return hzurl
        }
      })
      this.vectorhz = new ol.layer.Vector({
        source: this.vectorSourcehz,
        style: this.styleFunction
      })

      this.map.addLayer(this.vectorhz)
      this.drawhz = true
    }
  }

  styleFunction (feature) {
    let id = feature.getId()
    let geometry = feature.getGeometry()
    let styles = null
    if (id.match(/hz/ig)) {
      styles = [
        // linestring
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#ff5144',
            width: 10
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 1)',
            width: 5
          })
        })
      ]
    } else {
      styles = [
        // linestring
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#48aaff',
            width: 10
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 1)',
            width: 5
          })
        })
      ]
    }
    let segmentFunction = function (start, end) {
      let stepLength = this
      let line2 = new ol.geom.LineString([start, end])
      let length = line2.getLength()
      let step2 = length / stepLength
      let dx = end[0] - start[0]
      let dy = end[1] - start[1]
      let rotation = Math.atan2(dy, dx)
      for (let i = 1; i <= step2; i++) {
        let stepFraction = stepLength * i / length
        let coord = line2.getCoordinateAt(stepFraction)
        styles.push(new ol.style.Style({
          geometry: new ol.geom.Point(coord),
          image: new ol.style.Icon({
            src: '../../img/arrow.png',
            anchor: [0.75, 0.5],
            rotateWithView: true,
            rotation: -rotation,
            scale: 0.08
          })
        }))
      }
    }
    let linestring = geometry.getLineString(0)
    // 获得线的长度，然后线长度等分
    let length = linestring.getLength()
    let step = 20
    let stepLength = length / step
    linestring.forEachSegment(segmentFunction, stepLength)

    return styles
  }
}
