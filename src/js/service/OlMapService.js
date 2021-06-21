import ol from 'openlayers'
import OlMapWorkspace from '../map/OlMapWorkspace.js'
import {
  DEAFULT_MAP_MATRIXID
} from '../def/map_def.js'
import {
  judgeURL,
  getRows,
  getMessage,
  formartReaderPath,
  showReaderDialog,
  getReaderPathMsg,
  getMapCheckOrNot
} from '../utils/utils.js'
import {
  getPolylineBYPoints,
  drawOLLine
} from '../map/OlMapUtils.js'
import {
  getIdx,
  pathCompare
} from '../../config/utils.js'
// const areas = [28, 29]
const maxZoom = 18
const ROLEID = 1
const spliceLevel = 9
const NOTRANSVEHICLES = [1, 3]
const NOPARKVEHICLES = [2]
const TRANSAREA = 7
const PARKAREA = 5

let modifyData = null
let pathSelect = null
let pathModify = null
// let _features = null
let _msg = null
let _name = null
let isModify = false
export default class OlMapService {
  /**
   * 初始化
   * @param {*} containerName 地图容器 element 的 id
   * @param {*} mapType 地图类型：MONITOR or HISTORY
   */
  constructor(mapType) {
    this.mapType = mapType

    this.mapID = -1
    this.map = null
    this.view = null
    this.workspace = null
    this.reader_id = null
    this.isInnerIP = false // 默认是外网

    /**
     * @description: 添加 保存之后移出拖拽
     */
    // xbus.on('DRAW-READER-UPDATE',()=>{
    //     this.map.removeInteraction(this.appD)
    // })
    /**
     * @description: 拖动分站
     */
    xbus.on('MAP-MOVE-READER', (msg) => {
      let self = this
      //拖拽分站
      var app = {}
      app.Drag = function () {
        ol.interaction.Pointer.call(this, {
          handleDownEvent: app.Drag.prototype.handleDownEvent,
          handleDragEvent: app.Drag.prototype.handleDragEvent,
          handleMoveEvent: app.Drag.prototype.handleMoveEvent,
          handleUpEvent: app.Drag.prototype.handleUpEvent
        })
        this._coordinate = null
        this._cursor = 'pointer'
        this._feature = null
        this._previousCursor = undefined
      }
      ol.inherits(app.Drag, ol.interaction.Pointer)
      app.Drag.prototype.handleDownEvent = function (evt) {
        var map = evt.map
        var feature = map.forEachFeatureAtPixel(evt.pixel,
          function (feature) {
            return feature
          })

        if (feature) {
          var geom = (feature.getGeometry());
          if (geom instanceof ol.geom.MultiPolygon) {
            return
          } else if (geom instanceof ol.geom.LineString) {
            return
          } else {
            this._coordinate = evt.coordinate
            this._feature = feature
          }
        }
        let dataID = feature && feature.get('data-id')
        let id = dataID ? dataID.split('-')[0] : -1
        if (Number(id) === msg.rows[0].field_value) {
          return !!feature
        } else {
          return
        }
      }
      app.Drag.prototype.handleDragEvent = function (evt) {
        var deltaX = evt.coordinate[0] - this._coordinate[0]
        var deltaY = evt.coordinate[1] - this._coordinate[1]
        var geometry = this._feature.getGeometry()
        geometry.translate(deltaX, deltaY)
        this._coordinate[0] = evt.coordinate[0]
        this._coordinate[1] = evt.coordinate[1]
      }
      app.Drag.prototype.handleMoveEvent = function (evt) {
        if (this._cursor) {
          var map = evt.map
          var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
              return feature
            })
          var element = evt.map.getTargetElement()
          if (feature) {
            if (element.style.cursor != this._cursor) {
              this._previousCursor = element.style.cursor
              element.style.cursor = this._cursor
            }
          } else if (this._previousCursor !== undefined) {
            element.style.cursor = this._previousCursor
            this._previousCursor = undefined
          }
        }
      }
      app.Drag.prototype.handleUpEvent = function (evt) {
        //拖动以后触发操作
        var stationnum = this._feature.U.StationNum
        this._coordinate = null
        this._feature = null
        return false
      }
      this.appD = new app.Drag()
      //将交互添加到map中
      this.map.addInteraction(this.appD)
    })

    /**
     * @description: 从配置页面编辑弹出框进入实时页面
     * @param {type} 
     * @return: 
     */
    xbus.on('MAP-READERPATHTEST', (msg) => {
      if (msg === 'close') {
        if (this.draw) this.map.removeInteraction(this.draw)
        pathSelect.setActive(false)
        pathModify.setActive(false)
        modifyData = null
        this.map.removeLayer(this.modifyReaderPathLayer)
        this.map.removeInteraction(pathSelect)
        this.map.removeInteraction(pathModify)
        return
      }
      _msg = msg
      this.layerSource = new ol.source.Vector()
      this.modifyReaderPathLayer = new ol.layer.Vector({
        source: this.layerSource,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 3
          })
        })
      })
      this.map.addLayer(this.modifyReaderPathLayer)
      this.map.addInteraction(pathSelect)
      this.map.addInteraction(pathModify)
      pathSelect.setActive(true)
      pathModify.setActive(true)
      let cardID = msg.cardID
      let path = getPolylineBYPoints(msg.rows),
        className = 'track-whole',
        PatrolPath = 'PatrolPath'
      this.drawOLLine(this.layerSource, path.pointCol)
    })

    /**
     * @description: 新增分站 添加分站覆盖范围
     * @param {type} 
     * @return: 
     */
    xbus.on('MAP-READERPATH', (msg) => {
      if (msg !== 'close' && msg.message.cmd === 'UPDATE' && msg.hasOwnProperty('coord')) {
        let readerMsg = Array.from(xdata.metaStore.data.reader.values()).filter(item => item.reader_id === msg.message.rows[0].field_value)

        msg.message.rows.forEach(e => {
          if (e.field_name === 'x') e.field_value = readerMsg[0].x
          if (e.field_name === 'y') e.field_value = readerMsg[0].y
        })

      }
      if (this.readerPathLayer) this.map.removeLayer(this.readerPathLayer)
      if (this.draw) this.map.removeInteraction(this.draw)
      this.map.removeLayer(this.modifyReaderPathLayer)
      if (msg === 'close') {
        // 点击分站弹出窗取消初始化
        pathSelect.setActive(false)
        pathModify.setActive(false)
        modifyData = null
        isModify = false
        if (this.appD) this.map.removeInteraction(this.appD)
        return
      }
      this.initPathLayer()
      pathSelect.setActive(false)
      pathModify.setActive(false)
      modifyData = null
      isModify = false

      _msg = msg
      _name = 'reader'

      this.draw = new ol.interaction.Draw({
        source: this.layerPathSource,
        type: 'LineString',
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#0099ff',
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
      this.map.addInteraction(this.draw)
      let self = this
      this.draw.addEventListener('drawstart', function (evt) {
        self.drawstart(evt)
      }, false)
      this.draw.addEventListener('drawend', function (evt) {
        self.drawend(evt)
      }, false)
      this.map.addEventListener('dblclick', function (evt) {

      })
    })

    /**
     * @description: 画取分站覆盖范围 选取超过五个点 确认 取消需要执行的函数
     */
    xbus.on('MAP-READER-INITIAL', (isInitial) => {
      isModify = false
      this.map.removeInteraction(pathSelect)
      this.map.removeInteraction(pathModify)
      pathSelect.setActive(false)
      pathModify.setActive(false)
      modifyData = null
      if (isInitial) {
        xbus.trigger('MAP-READERPATH', _msg)
      } else {
        _msg.message.cmd === 'UPDATE' && _msg.hasOwnProperty('coord') ? showReaderDialog(_msg.message, _msg.amessage, _msg.pmessage, _msg.coord) : showReaderDialog(_msg.message, _msg.amessage, _msg.pmessage)
      }
    })
  }

  showDetailOrBriefLabel(feature, type, id) {
    let style = feature.getStyle()
    let text = style ? style.getText() : ''
    // let id = feature.getProperties() && feature.getProperties().id
    let readers = xdata.metaStore.data.reader
    let reader = readers && readers.get(id)
    if (!reader) return 
    let newText = type === 'detail' ? `${id}-${reader.name}` : `${reader.brief_name}`
    text && text.setText(newText)
  }

  loadMap(containerName, mapID, map, row) {
    let ret = null
    let self = this

    let isCheckMap = getMapCheckOrNot(xdata.isCheck)
    if (isCheckMap) {
      map = isCheckMap.map
      row = isCheckMap.row
    }

    if (mapID === this.mapID && this.map) {
      console.log('Same mapID, NO need to load map again. mapID=', mapID)
      return ret
    }

    let container = document.querySelector('#' + containerName)
    if (!container) {
      console.warn('NO map container element in current document: ', containerName)
      return ret
    }
    // 判断是否是内网IP
    this.isInnerIP = judgeURL()
    // if (!this.isInnerIP) this.isInnerIP = judgeURL(window.location.hostname)
    let mapURL = map.tileWmsOpts.url
    map.tileWmsOpts.url = this.isInnerIP && row ? row.inner_url : mapURL

    // let mapDef = maps.get(mapID)
    let mapDef = map
    // let mapDef = xdata.mapStore.maps.get(mapID)
    if (!mapDef) {
      console.warn('NO map definition of the mapID : ', mapID)
      return ret
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
      mapType = mapType ? 'wms' : 'wmts'
    }

    chooseMap = {
      map_type: mapType
    }
    if (mapType === 'wmts') {
      chooseMap.url = tileWmsOpts.url
      chooseMap.layers = tileWmsOpts.params.LAYERS
      chooseMap.matrixId = DEAFULT_MAP_MATRIXID
    }

    if (chooseMap.map_type === 'wms') {
      wmsLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS(tileWmsOpts)
      })
    } else if (chooseMap.map_type === 'wmts') {
      let matrixIds = [],
        resolution = []
      let startResolutions = ol.extent.getHeight(extent) / 256
      for (let i = 0; i <= spliceLevel; i++) {
        matrixIds[i] = chooseMap.matrixId + i
        resolution[i] = startResolutions / Math.pow(2, i)
      }
      let matrixSet = chooseMap.matrixId && chooseMap.matrixId.slice(0, chooseMap.matrixId.indexOf(':'))
      wmsLayer = new ol.layer.Tile({
        source: new ol.source.WMTS({
          url: chooseMap.url,
          layer: chooseMap.layers,
          tileGrid: new ol.tilegrid.WMTS({
            extent: extent,
            resolutions: resolution,
            matrixIds: matrixIds,
            tileSize: [256, 256]
          }),
          matrixSet: matrixSet,
          format: 'image/png',
          projection: 'EPSG:3857'
        })
      })
    } else {
      console.warn('unknow map type!')
    }

    if (containerName === 'monitormap') {
      window.wmsLayer = wmsLayer
    }

    let view = new ol.View(mapDef.viewOpts)

    pathSelect = new ol.interaction.Select()
    pathModify = new ol.interaction.Modify({
      features: pathSelect.getFeatures()
    })
    pathSelect.setActive(false)
    pathModify.setActive(false)
    // 鹰眼
    // let overviewMapControl = new ol.control.OverviewMap({
    //   collapseLabel: '\u00BB',            // 鹰眼展开时功能按钮上的标识
    //   label: '\u00AB',                    // 鹰眼控件折叠时功能按钮标识
    //   collapsed: false,
    //   layers: [wmsLayer]
    //   // 初始为展开显示方式
    // })

    // 盲区车卡拖拽效果
    let app = {}
    app.Drag = function () {
      ol.interaction.Pointer.call(this, {
        handleDownEvent: app.Drag.prototype.handleDownEvent,
        handleDragEvent: app.Drag.prototype.handleDragEvent,
        handleMoveEvent: app.Drag.prototype.handleMoveEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
      })
      this.coordinate_ = null
      this.cursor_ = 'pointer'
      this.feature_ = null
      this.previousCursor_ = undefined
    }
    ol.inherits(app.Drag, ol.interaction.Pointer)

    app.Drag.prototype.handleDownEvent = function (evt) {
      var map = evt.map

      this.feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
          return feature
        })

      if (this.feature) {
        let featuretype = this.feature.getProperties().type
        let subtype = this.feature.getProperties()['data-subtype']
        if (featuretype === 'nosignal' && subtype === 'vehicle') {
          this.coordinate_ = evt.coordinate
          this.feature_ = this.feature
          let cardID = this.feature.get('data-id')
          xdata.dragCardStore.moveCardList.set(cardID, true)
        } else {
          return
        }
      }

      return !!this.feature
    }

    app.Drag.prototype.handleDragEvent = function (evt) {
      this.deltaX = evt.coordinate[0] - this.coordinate_[0]
      this.deltaY = evt.coordinate[1] - this.coordinate_[1]

      var geometry = (this.feature_.getGeometry())
      geometry.translate(this.deltaX, this.deltaY)

      this.coordinate_[0] = evt.coordinate[0]
      this.coordinate_[1] = evt.coordinate[1]
    }

    app.Drag.prototype.handleMoveEvent = function (evt) {
      if (this.cursor_) {
        var element = evt.map.getTargetElement()
        if (this.feature) {
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor
            element.style.cursor = this.cursor_
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_
          this.previousCursor_ = undefined
        }
      }
    }

    app.Drag.prototype.handleUpEvent = function (evt) {
      let uncoverAreas = Array.from(xdata.areaListStore.uncoverAreaList)
      let cardID = this.feature.get('data-id')
      for (let uncoverarea of uncoverAreas) {
        if (uncoverarea && uncoverarea[1].intersectsCoordinate(evt.coordinate)) { // 拖拽到非覆盖区域
          let vehicle = xdata.metaStore.getCardBindObjectInfo(cardID)
          let typeID = vehicle && vehicle.vehicle_type_id
          let type = typeID && xdata.metaStore.data['vehicle_type'].get(typeID)
          let categoryID = type && type.vehicle_category_id
          let category = categoryID && xdata.metaStore.data.vehicle_category.get(categoryID)
          if (categoryID && (NOTRANSVEHICLES.includes(categoryID) && uncoverarea[0] === TRANSAREA) || NOPARKVEHICLES.includes(categoryID) && uncoverarea[0] === PARKAREA) {
            let areaname = xdata.metaStore.data.area.get(uncoverarea[0]) && xdata.metaStore.data.area.get(uncoverarea[0]).name
            let msg = {
              value: 'failure',
              tip: `${category.name}不能拖动到${areaname}中，请重新拖动！`
            }
            window.hintip.open(msg)
            return
          }

          let text = this.feature.getStyle() ? this.feature.getStyle().getText() : ''
          let img = this.feature.getStyle() ? this.feature.getStyle().getImage() : ''
          let angel = xdata.metaStore.data.area.get(uncoverarea[0]).angle
          img && img.setRotation(angel)
          let newText = this.feature.getProperties()['data-number']
          text && text.setText(newText)
          this.feature.set('card-speed', newText)
          this.feature.set('type', 'uncover')

          let oldX = this.feature.get('x')
          let oldY = this.feature.get('y')
          let oldArea = this.feature.get('card_area')
          let newX = Number(evt.coordinate[0].toFixed(2))
          let newY = -Number(evt.coordinate[1].toFixed(2))
          let newArea = uncoverarea[0]

          let sql = `REPLACE into dat_handup_vehicle (card_id,map_id,old_area_id,old_x,old_y,new_area_id,new_x,new_y,user_id) VALUES (${cardID},${mapID},${oldArea},${oldX},${oldY},${newArea},${newX},${newY},'${xdata.userName}')`
          let req = {
            cmd: 'update', // update, CMD.META.UPDATE
            data: {
              op: 'INSERT', // INSERT, UPDATE, DELETE
              name: 'dat_handup_vehicle',
              id: cardID,
              sql: sql
            }
          }
          xbus.trigger('META-UPDATE-DB', {
            req: req
          })
          // xdata.dragCardStore.dragCardList.set(cardID, true)
        }
      }
      // xdata.dragCardStore.moveCardList.set(cardID, true)
      this.coordinate_ = null
      this.feature_ = null
      return false
    }
    let m = {
      layers: [wmsLayer],
      overlays: [], // overlays: [tooltips],
      target: containerName,
      view: view,
      controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
          collapsible: false
        })
      }),
      interactions: ol.interaction.defaults({
        doubleClickZoom: false
      }).extend([pathSelect, pathModify])
    }
    if (xdata.roleID === ROLEID) { // 设置拖拽权限 interactions无法set进去
      m.interactions = ol.interaction.defaults().extend([new app.Drag()])
    }
    let olmap = new ol.Map(m)

    let zoomslider = new ol.control.ZoomSlider()
    let ele = document.createElement('div')
    let img = document.createElement('img')
    img.src = '../img/north.png'
    ele.innerHTML = img
    document.querySelector('.ol-compass').innerText = ''
    let resetNorth = new ol.control.Rotate({
      autoHide: false,
      label: img
    })
    olmap.addControl(zoomslider)
    olmap.addControl(resetNorth)
    // save the default parameters of map
    this.initViewConfig = {
      zoom: view.getZoom(),
      center: view.getCenter(),
      rotation: view.getRotation()
    }

    let moveReaderPointer = new Map()
    // 设置鼠标在特定 feature 上的形状
    olmap.on('pointermove', function (e) {
      let pixel = olmap.getEventPixel(e.originalEvent)
      // let arr = olmap.getFeaturesAtPixel(pixel)
      let hit = olmap.hasFeatureAtPixel(pixel)
      if (hit) {
        olmap.forEachFeatureAtPixel(pixel, (feature) => {
          let dataSubtype = feature.getProperties() && feature.getProperties()['data-subtype']
          if (['virtual_reader', 'reader-v', 'reader'].includes(dataSubtype)) {
            let id = feature.getProperties().id
            self.showDetailOrBriefLabel(feature, 'detail', id)
            moveReaderPointer.set(id, feature)
          }
        })
      } else if (moveReaderPointer.size > 0) {
        let features = Array.from(moveReaderPointer.values())
        features.forEach((feature) => {
          self.showDetailOrBriefLabel(feature, 'brief', feature.getProperties().id)
        })
        moveReaderPointer = new Map()
      }
      olmap.getTargetElement().style.cursor = hit ? 'pointer' : ''
    })

    pathModify.on('modifyend', this.ModifyIconEnd)
    olmap.addEventListener('dblclick', function (evt) {
      if (!_msg) return
      if (_msg && _msg.message.cmd === 'INSERT' && isModify) {
        olmap.addInteraction(pathSelect)
        olmap.addInteraction(pathModify)
        pathSelect.setActive(true)
        pathModify.setActive(true)
      }

      if (!modifyData) return
      let store = xdata.metaStore
      let ptable = {
        def: store.defs['reader_path_tof_n'],
        rows: store.dataInArray.get('reader_path_tof_n'),
        maxid: store.maxIDs['reader_path_tof_n']
      }
      // 过滤已有的 分站覆盖范围
      let path_msg = Array.from(xdata.metaStore.data.reader_path_tof_n.values()).filter(item => item.reader_id === _msg.message.rows[0].field_value)

      let rows = getRows(null, ptable.def, ptable.maxid)
      let msg = getMessage('INSERT', rows, ptable.def, ptable.maxid)
      let pmessage = formartReaderPath(msg, modifyData)
      if (pmessage.length >= 5) {
        this.activePanel = riot.mount('call-leave', {
          name: 'edit-reader',
          currentTag: self
        })[0]
        return
      }
      let _pmsg = []
      if (_msg && (_msg.message.cmd === 'INSERT' || _msg.message.cmd === 'UPDATE')) {
        for (let i = 0; i < pmessage.length; i++) {
          _pmsg.push(getReaderPathMsg(_msg.message, pmessage[i], i, pmessage.length))
        }
        if (_msg.message.cmd === 'UPDATE' && _msg.pmessage.length === 1 && _pmsg.length === 1) {
          for (let i = 0; i < _msg.pmessage[0].rows.length; i++) {
            for (let j = 0; j < _pmsg[0].rows.length; j++) {
              if (_msg.pmessage[0].rows[i].field_name === _pmsg[0].rows[j].field_name && _msg.pmessage[0].rows[i].field_name != 'tof_flag' && _msg.pmessage[0].rows[i].field_value === _pmsg[0].rows[j].field_value) {
                _pmsg[0].rows[j].field_value = _msg.pmessage[0].rows[i].field_value
              }
            }
          }
        }
      }

      // 处理分站覆盖范围数据
      let maxid = store.maxIDs['reader_path_tof_n']
      let maxIDs = store.maxIDs['reader_path_tof_n']
      for (let i = 0; i < _pmsg.length; i++) {
        if (_pmsg.length >= path_msg.length) {
          if (i <= path_msg.length - 1) {
            // 分站覆盖范围属于更新  每次新增先删除数据库该分站的全部路径 cmd应为INSERT
            _pmsg[i].cmd = 'INSERT'
            for (let j = 0; j < _pmsg[i].rows.length; j++) {
              if (_pmsg[i].rows[j].field_name === 'id') _pmsg[i].rows[j].field_value = path_msg[i].id
            }
            _pmsg[i]['fromReaderPath'] = 'map'
          } else if (i > path_msg.length - 1) {
            // 分站覆盖范围属于增加
            _pmsg[i].cmd = 'INSERT'
            // maxid = maxid+1
            for (let j = 0; j < _pmsg[i].rows.length; j++) {
              if (_pmsg[i].rows[j].field_name === 'id') _pmsg[i].rows[j].field_value = ""
            }
          }
        }
      }
      let tofIndex = getIdx(_pmsg[0], 'tof_flag') //获取tof_flag字段下标
      let sIndex = getIdx(_pmsg[0], 'b_x') // 获取开始坐标的字段下标 用于比较拐点左右坐标大小 左负右正 用于tof_flag赋值 -1 -2 1 2
      let eIndex = getIdx(_pmsg[0], 'e_x')
      let pmsgSortList = []
      //分站覆盖范围开始点坐标
      for (let i = 0; i < _pmsg.length; i++) {
        pmsgSortList.push({
          idx: i,
          value: _pmsg[i].rows[sIndex].field_value
        })
      }
      switch (_pmsg.length) {
        case 1:
          _pmsg[0].rows[tofIndex].field_value = 0
          break;
        case 2:
          for (let i = 0; i < pmsgSortList.length; i++) {
            let idx = pmsgSortList[i].idx
            if (i === 0) _pmsg[idx].rows[tofIndex].field_value = 1
            if (i === 1) _pmsg[idx].rows[tofIndex].field_value = -1
          }
          break;
        case 3:
          for (let i = 0; i < pmsgSortList.length; i++) {
            let idx = pmsgSortList[i].idx
            if (i === 0) _pmsg[idx].rows[tofIndex].field_value = 1
            if (i === 1) _pmsg[idx].rows[tofIndex].field_value = -1
            if (i === 2) _pmsg[idx].rows[tofIndex].field_value = -2
          }
          break;
        case 4:
          for (let i = 0; i < pmsgSortList.length; i++) {
            let idx = pmsgSortList[i].idx
            if (i === 0) _pmsg[idx].rows[tofIndex].field_value = 2
            if (i === 1) _pmsg[idx].rows[tofIndex].field_value = 1
            if (i === 2) _pmsg[idx].rows[tofIndex].field_value = -1
            if (i === 3) _pmsg[idx].rows[tofIndex].field_value = -2
          }
          break;
      }
      _msg.message.cmd === 'UPDATE' && _msg.hasOwnProperty('coord') ? showReaderDialog(_msg.message, _msg.amessage, _pmsg, _msg.coord) : showReaderDialog(_msg.message, _msg.amessage, _pmsg)
      //   let coordinate = evt.coordinate
      //   console.log(`双击点的坐标为：${coordinate[0].toFixed(1)},${coordinate[1].toFixed(1)}`)
    })

    // 鼠标滚动
    // container.onmousewheel = function (event) {
    //   if (containerName !== 'monitormap') return
    //   let coordinate = olmap.getEventCoordinate(event)
    //   let areas = xdata.metaStore.workAreaList && Array.from(xdata.metaStore.workAreaList.values())
    //   for (let i = 0; i < areas.length; i++) {
    //     let chooseArea = xdata.areaListStore.arealist.get(Number(areas[i]))
    //     if (chooseArea && chooseArea.intersectsCoordinate(coordinate)) {
    //       let zoom = olmap.getView().getZoom()
    //       let msg = {}
    //       if (zoom > maxZoom) {
    //         wmsLayer.setVisible(false)
    //         msg.isShow = true
    //         msg.area = areas[i]
    //         msg.map = containerName
    //         msg.areaChoosed = chooseArea
    //       } else if (zoom <= maxZoom) {
    //         wmsLayer.setVisible(true)
    //         msg.isShow = false
    //       }
    //       console.log(msg)
    //       xbus.trigger('SHOW-WORK-FACE', msg)
    //     }
    //   }
    // }

    this.workspace && this.workspace.destroy()
    this.workspace = new OlMapWorkspace(olmap, mapID, this.mapType)

    // save the object for later use
    this.mapID = mapID
    this.map = olmap
    this.view = view
    // this.initPathLayer()
    ret = olmap
    return ret
  }

  // 重新设置 Map
  reset() {
    this.resetOverlays()
    this.resetView()
  }

  resetWorkspace() {
    this.workspace = null
  }

  resetCardLayers() {
    if (this.workspace && this.workspace.cardLayer) {
      this.workspace.cardLayer.vehicleLayerSource && this.workspace.cardLayer.vehicleLayerSource.clear()
      this.workspace.cardLayer.staffLayerSource && this.workspace.cardLayer.staffLayerSource.clear()
    }
  }

  resetTrackLayers() {
    if (this.workspace && this.workspace.trackLayer) {
      this.workspace.trackLayer.layerSource && this.workspace.trackLayer.layerSource.clear()
    }
  }

  resetOverlays() {
    this.resetCardLayers()
    this.resetTrackLayers()
    this.map && this.map.getOverlays() && this.map.getOverlays().clear()
  }

  // reset view
  resetView() {
    if (this.view && this.initViewConfig) {
      this.view.setCenter(this.initViewConfig.center)
      this.view.setRotation(this.initViewConfig.rotation)
      this.view.setZoom(this.initViewConfig.zoom)
    }
  }

  ModifyIconEnd(e) {
    // _features = e.features
    let coords = e.features.item(0).getGeometry().getCoordinates()
    // this.features = e.features
    let features = e.features
    this.preFeature = features[0]
    let valid = true
    let segmentFunction = function (start, end) {
      let obj = {
        start_point: {
          x: start[0],
          y: start[1]
        },
        end_point: {
          x: end[0],
          y: end[1]
        }
      }
    }
    this.modifyData = coords.map(item => {
      item[0] = Number(item[0].toFixed(1))
      item[1] = Number(item[1].toFixed(1))
      return item
    })
    modifyData = this.modifyData
  }
  drawOLLine(layerSource, _point) {
    let point = _point
    let linestring = new ol.geom.LineString(point) // 坐标数组

    var lineFeature = new ol.Feature({
      geometry: linestring,
      finished: false
    })

    // 2、生成轨迹
    let startMarker = new ol.Feature({
      geometry: new ol.geom.Point(point[0])
    })
    let endMarker = new ol.Feature({
      geometry: new ol.geom.Point(point[point.length - 1])
    })
    layerSource.addFeature(lineFeature)
    layerSource.addFeature(startMarker)
    layerSource.addFeature(endMarker)
    return {
      lineFeature: lineFeature,
      lineLength: linestring.getLength()
    }
  }
  drawstart(evt) {

  }
  drawend(evt) {
    this.map.addInteraction(pathSelect)
    this.map.addInteraction(pathModify)
    isModify = true

    let deletetipCoord = null
    let sketch = evt.feature
    let geom = sketch.getGeometry()

    deletetipCoord = geom.getLastCoordinate()
    this.coods = this.coordinateList(geom)
    this.map.removeInteraction(this.draw)
  }
  /**
   * @description: 坐标集合
   * @param {type} 
   * @return: 
   */
  coordinateList(line) {
    let wgs84Sphere = new ol.Sphere(6378137)
    let length = 0
    let coords = []
    let coordinates = line.getCoordinates()
    this.modifyData = coordinates.map(item => {
      item[0] = Number(item[0].toFixed(1)),
      item[1] = Number(item[1].toFixed(1))
      return item
    })
    modifyData = this.modifyData
    return modifyData
  }
  initPathLayer() {
    this.layerPathSource = new ol.source.Vector()
    this.readerPathLayer = new ol.layer.Vector({
      source: this.layerPathSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 3
        })
      })
    })
    this.map.addLayer(this.readerPathLayer)
  }

}
