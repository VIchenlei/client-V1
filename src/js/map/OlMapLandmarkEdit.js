
import { drawSymbol } from './OlMapUtils.js'
import { SYMBOL_TYPE } from './Symbol.js'
import { OD, ST } from '../def/odef.js'
import landmarkStateDef from '../def/landmark_state_def'
import '../../config/tag/meta-dialog.html'
import '../../config/tag/reader-dialog.html'
import ol from 'openlayers'
import {getMessage, getRows, judgeAreaIsneedDisplay, testMapID, getPointshortPath, formartReaderPath, clone, getReaderPathMsg } from '../utils/utils.js'
import { getReaderCoord, getIdx } from '../../config/utils'
// import * as jsts from 'jsts'

export default class OlMapLandmarkEdit {
  constructor (workspace, draw) {
    // super(workspace)
    this.workspace = workspace
    this.map = workspace.map
    this.draw = draw
    this.modify = null
    this.snap = null
    this.EditLayer = null
    this.source = null
    let self = this
    // 在地图上面增加图层
    this.layersList = this.initLayersList()
    this.groups = new Map()

    xbus.on('MAP-SHOW-LANDMARKER', (msg) => {
      if (this.map.getTarget() !== 'monitormap') return
      window.isShowLandMarker = msg.isVisible
      if (msg.isVisible) {
        window.MarkLayerShow = msg.isVisible
        if (!this.isLandmarkerLayer) {
          self.drawAllLandmarker()
        }
        if(msg.cards){
          window.triggerLocating({
            cards: msg.cards,
            type: msg.type,
            symbolType: 'landmark'
          })
        }
        this.landmarkerLayer.setVisible(true)
        if (msg.id) {
          self.startLandmarkLocation(msg.id)
        }
      } else {
        this.landmarkerLayer.setVisible(false)  
        self.stopLocation()
        window.MarkLayerShow = false
      }
    })

    xbus.on('DRAW-LANDMARKER-UPDATE', () => {
      this.resetLayer()
    })
    
    this.tool = null
    xbus.on('MAP-LandmarkEdit', (msg) => {  
      // 根据传入的图层名来初始化编辑图层
      // this.EditLayer= this.getLayerByName(this.workspace,msg.layername)
      // this.source= this.EditLayer.areaLayer.getSource()
      if (this.map.getTarget() !== 'monitormap') return
      // if (this.draw.interaction) {
      //   this.map.removeInteraction(this.draw.interaction)
      // }
      this.source = new ol.source.Vector()
      this.tool = msg.tool.getAttribute('name')
      this.initInteractions()
      //this.tool = msg.tool
    })

    //新建分站
    xbus.on('MAP-readerEdit', (msg) => {  
      // 根据传入的图层名来初始化编辑图层
      // this.EditLayer= this.getLayerByName(this.workspace,msg.layername)
      // this.source= this.EditLayer.areaLayer.getSource()
      if (this.map.getTarget() !== 'monitormap') return
      // if (this.draw.interaction) {
      //   this.map.removeInteraction(this.draw.interaction)
      // }
      this.source = new ol.source.Vector()
      this.tool = msg.tool.getAttribute('name')
      this.initInteractions()    
      //this.tool = msg.tool
    })


    // 配置页面跳转实时界面新增分站 跳转之后画取状态
    xbus.on('DRAW-STATE', (name) => {  
        this.source = new ol.source.Vector()
        this.tool = name
        this.initInteractions()    
      })
    xbus.on('MAP-READERPATH', (msg) => {
        if (this.draw) {
            this.map.removeInteraction(this.draw.interaction)
        }
    })
    xbus.on('MAP-LOAD-SUCESS',()=>{
      this.mapID = xdata.metaStore.defaultMapID
      let show = window.MarkLayerShow
      this.landmarkerSource.clear()
      this.drawAllLandmarker()
      this.landmarkerLayer.setVisible(show)//等待地图加载完毕，获取上次图层状态
    })

    xbus.on('DRAW-MAP-LANDMARK', (msg) => {
      let message = {
        'landmark_id': Number(msg.res.data.id),
        'name': msg.name,
        'x': Number(msg.x),
        'y': Number(msg.y)
      }
      let feature = this.landmarkerSource.getFeatureById(Number(msg.res.data.id))
      if (feature) {
        this.landmarkerSource.removeFeature(feature)
      }
      //if (msg.res.data.op !== 'DELETE' && message.landmark_id) {//新增地标重绘后不见了图层
        //let group = this.drawLandmarkerOn(message) 
      //}
      this.isLandmarkerLayer = false
    })
  }

  resetLayer () {    
    this.landmarkerSource && this.landmarkerSource.clear()
    this.drawAllLandmarker()
  }

  startLandmarkLocation (ids) {
    let msg = {
      cards: ids,
      symbolType: 'landmark'
    }
    window.cardStartLocating(msg) //进入定位状态
  }

  creareLandmarker (text, type) {
    return new ol.style.Style({
      image: new ol.style.Icon({
        src: '../../img/landmarker.png',
        scale: 0.05
      })
    })
  }
  initLayersList () {
    this.landmarkerSource = new ol.source.Vector()
    this.landmarkerLayer = new ol.layer.Vector({
      source: this.landmarkerSource,
      style: new ol.style.Style({
        zIndex: 3
      })
    })

    this.landmarkerLayer.setVisible(false)
    this.map.addLayer(this.landmarkerLayer)
    this.isLandmarkerLayer = false
    this.registerEventHandler(this.map, this.landmarkerLayer)

    return this.landmarkerLayer
  }

  drawAllLandmarker () {
    let landmarks = xdata.metaStore.data.landmark && Array.from(xdata.metaStore.data.landmark.values())
    this.mapID = xdata.metaStore.defaultMapID 
    if (!landmarks) return
    for (let landmark of landmarks) {
      if (testMapID(landmark.map_id, this.mapID)) {
        let isNeedDisplay = judgeAreaIsneedDisplay(landmark)
        if (!isNeedDisplay) continue
        let group = this.drawLandmarkerOn(landmark)
      }
    }
    this.isLandmarkerLayer = true
  }

  drawLandmarkerOn (landmark) {
    let landmarkID = landmark.landmark_id
    let attrs = {
      'data-id': landmarkID,
      'data-number': landmark.name,
      'data-subtype': SYMBOL_TYPE.LANDMARKER,
      'data-type': SYMBOL_TYPE.LANDMARKER,
      x: landmark.x,
      y: landmark.y,
      class: 'icon-device state-connected',
      geom: landmark.geom
    }

    return drawSymbol(attrs, this.landmarkerSource, this.map)
  }

  registerEventHandler (map, layer) {
    if (map == null) return

    this.map.addEventListener('click', (evt) => {
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
      if (feature && feature.getProperties()['data-subtype'] === 'landmark') {
        this.showTips(evt, feature)
      }
    })
  }

  showTips (evt, feature) {
    let dataID = feature.get('data-id')
    if (!dataID) return

    let landmark = xdata.metaStore.data.landmark && xdata.metaStore.data.landmark.get(Number(dataID))
    let landmarkState = {
      'landmark_id': landmark.landmark_id,
      'name': landmark.name,
      'x': landmark.x,
      'y': landmark.y,
      'z': landmark.z
    }
    let landmarkInfoDef = xdata.metaStore.defs['landmark']
    let landmarkInfo = xdata.metaStore.data['landmark'].get(parseInt(dataID, 10))
    let formatedInfo = xdata.metaStore.formatRecord(landmarkInfoDef, landmarkInfo, null)
    let coordinate = evt.coordinate
    let msg = {
      type: 'DEVICE',
      subtype: feature.get('data-subtype'),
      id: dataID,
      event: evt,
      state: {
        def: landmarkStateDef['landmark'],
        rec: landmarkState
      },
      info: {
        def: xdata.metaStore.defs['landmark'],
        rec: formatedInfo
      },
      coordinate: coordinate
    }
    xbus.trigger('MAP-TOOLTIPS-SHOW', msg)
  }

  /**
  * 加载交互绘制控件函数
  */
  initInteractions () {
    if (this.draw) {
      this.map.removeInteraction(this.draw.interaction)
    }
    if (this.snap) {
      this.map.removeInteraction(this.snap)
    }
    if (this.modify) {
      this.map.removeInteraction(this.modify)
    }
    this.addInteractions()
  }
  /**
  * 加载交互绘制控件函数
  */
  addInteractions () {
    this.draw.interaction = new ol.interaction.Draw({
      source: this.source,
      type: /** @type {ol.geom.GeometryType} */ ('Point')
    })
    this.map.addInteraction(this.draw.interaction)
    // this.snap = new ol.interaction.Snap({ source: this.source })
    // this.map.addInteraction(this.snap)
    let self = this
    this.draw.interaction.addEventListener('drawend', (evt) => {
      this.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(this.feature.getGeometry())

      let name2 = 'landmark'
      if(this.tool === 'edit_forbid_bstation'){
        name2 = 'reader'
      }
      let store = xdata.metaStore
      let table = {
        def: store.defs[name2],
        rows: store.dataInArray.get(name2),
        maxid: store.maxIDs[name2]
      }

      let atable1
      let atable2
      let ptable
      let amsg = []
      let pmsg = []

      let geom = "'" + wktGeo + "'"
      let valueGeom = { geom: geom }
      let values = null
      let rows2 = this.getRows(table, values, valueGeom, wktGeo)
      let msg3 = getMessage('INSERT', rows2, table.def, table.maxid)
      if(name2 === 'reader'){
        atable1 = {
            def: store.defs['antenna'],
            rows: store.dataInArray.get('antenna'),
            maxid: store.maxIDs['antenna']
        }
        atable2 = {
            def: store.defs['antenna'],
            rows: store.dataInArray.get('antenna'),
            maxid: store.maxIDs['antenna']+1
        }
        ptable = {
            def: store.defs['reader_path_tof_n'],
            rows: store.dataInArray.get('reader_path_tof_n'),
            maxid: store.maxIDs['reader_path_tof_n']
        }
        let amsg1 = this.getReaderMsg(atable1.def,atable1.maxid)
        let amsg2 = this.getReaderMsg(atable2.def,atable2.maxid)
        amsg.push(this.getModifyReaderMsg(msg3,amsg1,1))
        amsg.push(this.getModifyReaderMsg(msg3,amsg2,2))
        pmsg = this.getReaderPathOfMsg(msg3, ptable.def,ptable.maxid)
        let rindex_x = getIdx(msg3,'x')  //分站的x坐标下标
        let rindex_y = getIdx(msg3,'y')
        let aindex_x = getIdx(amsg[0],'x') //天线的x坐标下标
        let aindex_y = getIdx(amsg[0],'y')
        let values = getReaderCoord(msg3.rows[rindex_x].field_value, msg3.rows[rindex_y].field_value, 1, 0)  //默认的天线坐标
        amsg.forEach(e => {
            e.rows[aindex_x].field_value = values.x
            e.rows[aindex_y].field_value = values.y
        })
      }
      name2 === 'reader' ? this.showReaderDialog(msg3,amsg,pmsg) : this.showMetaDialog(msg3)
      this.map.removeInteraction(this.draw.interaction)
    })
  }
  /**
  * 根据图层名称获取图层
  */
  getLayerByName (workspace, layername) {
    if (layername == 'areaLayer') {
      this.EditLayer = workspace.areaLayer
    }
    return this.EditLayer
  }

  showMetaDialog (msg) {
    // window.metaDialog.show(msg)
    if (this.metaDialog) {
      this.metaDialog.unmount(true)
    }
    this.metaDialog = riot.mount('meta-dialog', { message: msg })[0]
    // this.registerGlobalEventHandlers()
  }
    /**
     * @description: 点击新增分站 在地图上选点分站位置弹窗分站录入框
     * @param {type} 
     * @return: 
    */
    showReaderDialog(msg,amsg,pmsg) {
        if (this.readerDialog) {
            this.readerDialog.unmount(true)
        }
        this.readerDialog = riot.mount('reader-dialog', { message: msg,amessage: amsg, pmessage: pmsg })[0]
    }

  getRows (table, values, valueGeom, wktGeo) {
    values = values ? values.row : null

    let rows = []
    let length = table.def.fields.names.length
    let coords = valueGeom.geom.split('POINT')[1].split('(')[1].split(')')[0].split(' ')
    for (let i = 0; i < length; i++) {
      let v = values ? values[table.def.fields.names[i]] : ''
      if (!values && i == table.def.keyIndex) {
        // 新增记录，id 为 最大id+1
        v = table.maxid ? table.maxid + 1 : 0
      }

      if (table.def.fields.names[i] === 'geom' && valueGeom) {
        v = valueGeom[table.def.fields.names[i]]
      }
      if (table.def.fields.names[i] === 'name') {
        if(this.tool === 'edit_forbid_bstation'){
          v = '新添加分站'
        } else {
          v = '新添加地标'
        }        
      }
      if (table.def.fields.names[i] === 'x') {
        v = Number(Number(coords[0]).toFixed(0))
      }
      if (table.def.fields.names[i] === 'y') {
        v = Number(Number(coords[1]).toFixed(0))
      }
      if (table.def.fields.names[i] === 'z') {
        v = 0
      }

      let row = {
        field_name: table.def.fields.names[i],
        field_value: v,
        field_type: table.def.fields.types[i],
        field_label: table.def.fields.labels[i],
        field_enableNull: table.def.fields.enableNull[i]
      }

      rows.push(row)
    }

    return rows
  }

  composeUpdateDBReq (db_op, keyValue, sqlstring) {
    return {
      cmd: 'update', // update, CMD.META.UPDATE
      data: {
        op: db_op, // INSERT, UPDATE, DELETE
        // id: this.tableKeyName,  // BUG???
        name: 'his_event_data',
        id: keyValue,
        sql: sqlstring
      }
    }
  }

  stopLocation () {
    let keys = Array.from(xdata.locateStore.locateLandmark.keys())
    if (keys.length > 0) {
      window.cardStopLocating({ cards: keys })
    }
  }
  getReaderMsg (def,maxid){
    let rows = getRows(null, def, maxid)
    let msg = getMessage('INSERT', rows, def, maxid)
    return msg
  }

  getReaderPathOfMsg (readerMsg, def, maxid) {
    let pathGather = clone(Array.from(xdata.metaStore.data.road_segment.values()))
    let readerRow = readerMsg.rows
    let readPoint = {
        x: Number(readerRow[6].field_value),
        y: Number(readerRow[7].field_value)
    }
    let shortPath = getPointshortPath(readPoint, pathGather, 4)
    let pathMsg = []
    let indexArr = [2, 1, -1, -2]
    for (let i = 0; i < shortPath.length; i++) {
      let path = shortPath[i]
      let modifyData = [[path.bpoint.x, -path.bpoint.y], [path.epoint.x, -path.epoint.y]]
      let ptable = {
          def: xdata.metaStore.defs['reader_path_tof_n'],
          rows: xdata.metaStore.dataInArray.get('reader_path_tof_n'),
          maxid: xdata.metaStore.maxIDs['reader_path_tof_n']
      }
      let rows = getRows(null, ptable.def, ptable.maxid)
      let msg = getMessage('INSERT', rows, ptable.def, ptable.maxid)
      let pmessage = formartReaderPath(msg, modifyData)
      if (!pmessage[0]) return
      pmessage = getReaderPathMsg(readerMsg,pmessage[0])
      pmessage.rows[2].field_value = indexArr[i]
      pathMsg.push(pmessage)
    }
    return pathMsg
  }


  getModifyReaderMsg (msg,amsg,index) {
    let rows1 = msg.rows
    let rows2 = amsg.rows
    for (let i = 0; i < rows1.length; i++) {
        for (let j = 0; j < rows2.length; j++) {
            if(rows1[i].field_name === rows2[j].field_name && rows2[j].field_name === 'reader_id'){
                rows2[j].field_value = rows1[i].field_value
            } 
            if(rows1[i].field_name === rows2[j].field_name && rows2[j].field_name === 'x'){
                rows2[j].field_value = rows1[i].field_value
            } 
            if(rows1[i].field_name === rows2[j].field_name && rows2[j].field_name === 'y'){
                rows2[j].field_value = rows1[i].field_value
            } 
            if(rows2[j].field_name === 'idx'){
                rows2[j].field_value = index
            }
        }
    }
    return amsg

  }
}
