import ol from 'openlayers'

export default class OlMapMeasureLayer {
  constructor (workspace, draw) {
    this.workspace = workspace
    this.map = workspace.map
    this.draw = draw
    this.type = null
    this.mode = null
    this.featureId = 200

    this.initMeasureLayer()
    xbus.on('MAP-MEASURE', (msg) => {
      //this.createHelpTooltip()
      if (this.map.getTarget() !== 'monitormap') return
      if (this.draw.interaction) {
        this.map.removeInteraction(this.draw.interaction)
      }
      this.addInteraction(msg.geometry)
    })
  }

  initMeasureLayer () {
    this.layerSource = new ol.source.Vector()
    this.measureLayer = new ol.layer.Vector({
      source: this.layerSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#0099ff',
          width: 3
        })
      })
    })

    let self = this
    this.map.addEventListener('dblclick', function (e) {
      if (self.mode) {
        self.mode = null
        return false
      }
    }, false)
    this.map.addLayer(this.measureLayer)
  }

  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement)
    }
    this.helpTooltipElement = document.createElement('div')
    this.helpTooltipElement.className = 'tooltip-help'
    this.helpTooltipElement.innerHTML = '单击确定起点'
    document.body.onmousemove = (evt) => {
        let position = [evt.clientX,evt.clientY]
        this.helpTooltipElement.style.left = position[0] + 10 + 'px'
        this.helpTooltipElement.style.top = position[1] + 10 + 'px'
    }
    document.body.appendChild(this.helpTooltipElement)
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
      offset: [0, -15],
      positioning: 'bottom-center'
    })
    this.map.addOverlay(this.measureTooltip)
  }
  

    /**
     * 绑定交互绘制工具开始绘制的事件
     * @param {event} evt
     */
  drawstart (evt) {
    let sketch = evt.feature
    let tooltipCoord = evt.coordinate
    // let startLineMsg = '单击确定起点'
    // let contineLineMsg = '<span id="coord"></span></br><span id="tip">单击确定地点，双击结束</span>'
    this.mode = 'drawing'
    
    // this.helpTooltipElement.classList.add('tooltip-help-change')
    // this.helpTooltipElement.innerHTML = contineLineMsg
    // 绑定change事件
    sketch.getGeometry().addEventListener('change', (evt) => {
      let geom = evt.target // 绘制几何要素
      let output
      if (geom instanceof ol.geom.Polygon) {
        output = this.formatArea(geom)
        tooltipCoord = geom.getInteriorPoint().getCoordinates() // 坐标
      } else if (geom instanceof ol.geom.LineString) {
        output = this.formatLength(geom)
        tooltipCoord = geom.getLastCoordinate()
      }
      // let helpTooltip = this.helpTooltipElement.querySelector('#coord')
      // helpTooltip.innerHTML = output

      this.measureTooltipElement.innerHTML = output // 将测量值设置到测量工具提示框中显示
      this.measureTooltip.setPosition(tooltipCoord) // 设置测量工具提示框的显示位置
    })
  }

    /**
     * 绑定交互绘制工具结束绘制的事件
     * @param {Event} evt
     */
  drawend (evt) {
    let deletetipCoord = null
    let sketch = evt.feature
    let geom = sketch.getGeometry()
    // let tipElement = this.helpTooltipElement.querySelector('#tip')

    sketch.setId(this.featureId)
    if (geom instanceof ol.geom.LineString) {
      deletetipCoord = geom.getLastCoordinate()
    } else if (geom instanceof ol.geom.Polygon) {
      deletetipCoord = geom.getInteriorPoint().getCoordinates()
    }
    this.measureTooltipElement.className = 'tooltip tooltip-static' // 设置测量提示框的样式
    this.measureTooltip.setOffset([0, -7])
   
    this.createDeleteBox(deletetipCoord, this.featureId)
    this.map.removeInteraction(this.draw.interaction)
     
    this.measureTooltipElement = null
    this.featureId = this.featureId + 1
    // this.helpTooltipElement.removeChild(tipElement)
    // this.helpTooltipElement.classList.remove('tooltip-help-change')
    // this.helpTooltipElement.classList.add('tooltip-help-end')
    // document.body.onmousemove = null
  }

    /**
     * 加载交互绘制控件函数
     * @param {number} geomtry
     */
  addInteraction (geomtry) {
    let self = this
    let type = (geomtry === 1 ? 'LineString' : 'Polygon')
    this.draw.interaction = new ol.interaction.Draw({
      source: this.layerSource,
      type: type,
      style: new ol.style.Style({
        // fill: new ol.style.Fill({
        //   color: 'rgb(0, 153, 255)'
        // }),
        stroke: new ol.style.Stroke({
          color: '#0099ff',
          // lineDash: [10, 10],
          width: 3
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    })

    this.createMeasureTooltip()
    this.map.addInteraction(this.draw.interaction)
    
    this.draw.interaction.addEventListener('drawstart', function (evt) { self.drawstart(evt) }, false)
    this.draw.interaction.addEventListener('drawend', function (evt) { self.drawend(evt) }, false)

  }



    /**
     *创建删除图标overlay，点击叉号删除对应的要素
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
      this.map.removeOverlay(this.map.getOverlayById(featureId))
      deletebox.parentNode.removeChild(deletebox)
      //document.body.removeChild(this.helpTooltipElement)
    })

    let deleteBox = new ol.Overlay({
      id: 'deleteBox',
      element: deleteBoxElement,
      offset: [15, 20],
      positioning: 'bottom-center'
    })
    deleteBox.setPosition(boxCoord)
    this.map.addOverlay(deleteBox)
  }

    /**
     * 测量长度
     * @param {ol.geom.LineString} line
     * @return {string}
     */
  formatLength (line) {
    let wgs84Sphere = new ol.Sphere(6378137)
    let length = 0
    let coordinates = line.getCoordinates()
    var sourceProj = this.map.getView().getProjection()
    let defaultMapID = xdata.metaStore.defaultMapID
    let scaleData = xdata.metaStore.data.map_gis.get(defaultMapID)
    let scale = scaleData && scaleData.scale ? scaleData.scale : 1
    for (let i = 0, li = coordinates.length - 1; i < li; i++) {
      let c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326')
      let c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326')
      length += wgs84Sphere.haversineDistance(c1, c2)
    }
    length =  Math.round(length * scale) + ' ' + 'm'  // 测量长度
    return length    // 返回线的长度
  }

    /**
     * 测量面积
     * @param {ol.geom.Polygon} polygon
     * @param {string}
     */
  formatArea (polygon) {
    let wgs84Sphere = new ol.Sphere(6378137)
    let area = 0
    let sourceProj = this.map.getView().getProjection()
    let geom = polygon.clone().transform(sourceProj, 'EPSG:4326')
    let coordinates = geom.getLinearRing(0).getCoordinates()
    area = Math.round(Math.abs(wgs84Sphere.geodesicArea(coordinates) * 4)) + ' ' + 'm<sup>2</sup>'
    return area
  }
}
