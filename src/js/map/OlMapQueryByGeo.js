import ol from 'openlayers'
import { OD, ST } from '../def/odef.js'
// import * as jsts from 'jsts'

export default class OlMapQueryByGeo {
  constructor (workspace, cardlayer, draw) {
    // super(workspace)
    this.workspace = workspace
    this.cardLayer = cardlayer
    this.map = workspace.map
    this.draw = draw
    this.type = null
    this.tool = null
    this.featureId = 100

    this.initQueryLayer()
    xbus.on('MAP-SEARCH-GEO', (msg) => {
      if (this.map.getTarget() !== 'monitormap') return
      if (this.draw.interaction) {
        this.map.removeInteraction(this.draw.interaction)
      }
      this.addInteraction(msg.geotype)
      this.type = msg.type
      this.tool = msg.tool
    })
    this.registerEventHandler(this.map, this.queryLayer)
  }

  initQueryLayer () {
    this.layerSource = new ol.source.Vector()
    this.queryLayer = new ol.layer.Vector({
      source: this.layerSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      })
    })
    this.map.addLayer(this.queryLayer)
  }

  registerEventHandler (map, layer) {
    if (this.map == null) {
      return
    }

    this.map.addEventListener('click', (evt) => {
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
      if (feature) {
        let dataType = feature.getProperties()['data-type']
        let type = feature.getProperties()['type']
        let subTypeID = feature.getProperties()['subTypeID']
        let statType = feature.getProperties()['statType']
        let filterGeo = feature.getProperties()['filterGeo']
        if (dataType === 'countStaffVehicle') {
          let msg = {
            type: type,
            subTypeID: subTypeID,
            statType: statType,
            filterGeo: filterGeo,
            gotoReader: true
          }
          window.showDetailDialog(msg)
        }
      } else {
        xbus.trigger('HIDE-ALL-POPUP')
      }
    })
  }


    /**
     * 创建测量工具提示框
     */
  createMeasureTooltip () {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement)
    }
    this.measureTooltipElement = document.createElement('div')
    this.measureTooltipElement.className = 'tooltip tooltip-measure'
    this.measureTooltip = new ol.Overlay({
      id: this.featureId,
      element: this.measureTooltipElement,
      offset: [0, -10],
      positioning: 'bottom-center'
    })
    this.map.addOverlay(this.measureTooltip)
  }

  /**
   * 加载交互绘制控件函数
   */
  addInteraction (geotype) {
    if (geotype === 'Box') {
      this.draw.interaction = new ol.interaction.Draw({
        source: this.layerSource,
        type: 'Circle',
        geometryFunction: ol.interaction.Draw.createBox()
      })
    } else {
      this.draw.interaction = new ol.interaction.Draw({
        source: this.layerSource,
        type: geotype
      })
    }
    this.createMeasureTooltip()
    this.map.addInteraction(this.draw.interaction)
    this.draw.interaction.addEventListener('drawstart',(evt) => {
      let sketch = evt.feature
      sketch.getGeometry().addEventListener('change', (evt) => {
        let geom = evt.target // 绘制几何要素
        if (geom instanceof ol.geom.Circle) {
          let tooltipCoord = geom.getLastCoordinate()
          this.measureTooltipElement.innerHTML = parseInt(geom.getRadius()*1000)/1000// 将测量值设置到测量工具提示框中显示
          this.measureTooltip.setPosition(tooltipCoord) // 设置测量工具提示框的显示位置
        }       
      })
    })

    this.draw.interaction.addEventListener('drawend', (evt) => {
      let feature = evt.feature
      feature.setId(this.featureId)
      let filterGeo = feature.getGeometry()
      let boxCoord = ol.extent.getCenter(filterGeo.getExtent())
      let rows = xdata.cardStore.getDetail(this.type, ST.SUM, '', filterGeo)
      // let readers = xdata.deviceStore.getReaderDetail(filterGeo)

      let name = this.type === 1 ? '人' : '车'
      this.totle = rows.length + name
      let type = this.type
      let centerPoly = new ol.geom.Point(boxCoord)
      // let feature = new ol.Feature(polygon)
      let featureCountCircle = new ol.Feature(centerPoly)
      featureCountCircle.setId('featureCount' + this.featureId)
      let msg = {
        'data-type': 'countStaffVehicle',
        'totle': this.totle,
        'subTypeID': type,
        'statType': ST.SUM,
        'filterGeo': filterGeo,
        'type': 'card'
      }

      featureCountCircle.setProperties(msg)
      this.layerSource.addFeature(featureCountCircle)
      featureCountCircle.setStyle(this.createCountStyle(featureCountCircle))
      let msg2 = {
        'type': 'card',
        'data-type': 'countStaffVehicle',
        'subTypeID': type,
        'statType': ST.SUM,
        'filterGeo': filterGeo
      }
      feature.setProperties(msg2)
      // window.showDetailDialog(msg)
      this.measureTooltipElement.className = 'tooltip tooltip-static' // 设置测量提示框的样式
      this.measureTooltip.setOffset([0, -7])
      this.createDeleteBox(boxCoord, this.featureId)
      this.featureId = this.featureId + 1
      this.map.removeInteraction(this.draw.interaction)
      // this.tool.classList.toggle("hide")

      this.tool.classList.remove('active')
      this.tool.removeAttribute('flag')
    })
  }

  /*

   */
  createCountStyle (feature) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 1)'
        }),
        radius: 35,
        stroke: ol.style.Stroke(
          {
            color: '#000000',
            width: 2
          }
        )
      }),
      text: new ol.style.Text({
        text: feature.get('totle'),
        font: '25px',
        fill: new ol.style.Fill({
          color: '#000000'
        })
      })
    })
  }
  /**
   *创建删除图标overlay，点击叉号删除对应的lineString要素、对应要素的measureTooltip
   *和overlay本身
   *@param {ol.Coordinate} boxCoord
   *@param {number} Fid
   *@return
   */
  createDeleteBox (boxCoord, Fid) {
    let deleteBoxElement = document.createElement('div')
    deleteBoxElement.className = 'deletebox deletebox-static'
    deleteBoxElement.innerHTML = 'x'
    deleteBoxElement.setAttribute('featureId', Fid)
    deleteBoxElement.addEventListener('click', (evt) => {
      let deletebox = evt.target
      let featureId = deletebox.getAttribute('featureId')
      this.layerSource.removeFeature(this.layerSource.getFeatureById(featureId))
      this.layerSource.removeFeature(this.layerSource.getFeatureById('featureCount' + featureId))
      this.map.removeOverlay(this.map.getOverlayById(featureId))
      deletebox.parentNode.removeChild(deletebox)
    })
    let deleteBox = new ol.Overlay({
      id: 'deleteBox',
      element: deleteBoxElement,
      offset: [45, 12],
      positioning: 'bottom-center'
    })
    deleteBox.setPosition(boxCoord)
    this.map.addOverlay(deleteBox)
  }
}
