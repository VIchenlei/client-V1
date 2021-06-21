
import { OD, ST } from '../def/odef.js'
// import '../../config/tag/meta-dialog.html'
import '../../config/tag/role-dialog.html'
import {initInteractions} from './OlMapUtils.js'
import {getMessage, composeUpdateDBReq} from '../utils/utils'
import ol from 'openlayers'
// import * as jsts from 'jsts'

export default class OlMapLayerEdit {
  constructor (workspace, draw) {
    // super(workspace)
    this.workspace = workspace
    this.map = workspace.map
    this.draw = draw
    this.modify = null
    this.snap = null
    this.EditLayer = null
    this.source = null
    this.tool = null
    this.isforbidArea = false
    xbus.on('MAP-LayerEdit', (msg) => {
      // 根据传入的图层名来初始化编辑图层
      if (this.map.getTarget() !== 'monitormap') return
      this.EditLayer = this.getLayerByName(this.workspace, msg.layername)
      this.sourceArea = this.EditLayer.areaLayer.getSource()
      this.source = new ol.source.Vector()
      this.tool = msg.tool
      if (this.draw.interaction) {
        this.map.removeInteraction(this.draw.interaction)
      }
      this.isforbidArea = msg.iconname === 'edit_forbid_area' ? true : false
      this.isUpdate = msg.type === 'update' ? true : false
      this.unpdateAreaId = !msg.id ? null : msg.id
      initInteractions(this.map, this.draw, this.snap, this.modify, this.addInteractions, this)
    })

    // xbus.on('META-DATA-UPDATE', (msg) => {
    //   // if (msg.def.name === this.name) {
    //   //   this.hasdata = msg && msg.def && msg.rows && msg.rows.length > 0

    //   //   this.rows = msg.rows
    //     this.maxid = msg.maxid
    //     // if (this.hasdata) {
    //     //   this.initPagination(this.pageIndex)
    //     //   this.subRows = this.copySubRows(this.rows, this.pageIndex)
    //     // }
    //     // this.update()
    // })
  }
  createPolygonStyle (text, type) {
    // default style
    let style = {
      stroke: { width: 1, color: [255, 203, 165] },
      fill: { color: [255, 203, 165, 0.4] },
      text: { text: text, font: '12px', scale: 1.2, fill: new ol.style.Fill({color: '#009fff'}) }
    }

    if (type === 'ALARM') {
      style.stroke.color = [255, 0, 0]
      style.fill.color = [255, 0, 0, 0.4]
      style.text.fill = new ol.style.Fill('red')
    } else if (type === 'location') {
      style.stroke.color = [244, 251, 90, 0.7]
      style.fill.color = [244, 251, 90, 0.7]
      style.text.fill = new ol.style.Fill('#6228a4')
    }

    return new ol.style.Style({
      stroke: new ol.style.Stroke(style.stroke),
      fill: new ol.style.Fill(style.fill),
      text: new ol.style.Text(style.text)
    })
  }

   /**
   * 加载交互绘制控件函数
   */
  addInteractions (interaction) {
    interaction.addEventListener('drawend', (evt) => {
      this.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(this.feature.getGeometry())
      let name2 = 'area'
      let store = xdata.metaStore

      let table = {
        def: store.defs[name2],
        rows: store.dataInArray.get(name2),
        maxid: store.maxIDs[name2]
      }
      let path = wktGeo.slice(9,-2).split(',').map((item,index)=>{
        item = item.split(' ').map((it,index) =>{
          if(index === 1){
            it = Number(it) > 0 ? '-'+ Number(it) : Math.abs(Number(it))
          }
          it = Number(it).toFixed(1)
          return it
        }).join(' ')
        if (index === 0) {
          item = "M" + item.replace(/[ ]/g,",")
        } else {
          item = "L" + item.replace(/[ ]/g,",")
        }
        return item
      })

      path = path.join(" ")
      let geom = "'" + wktGeo + "'"
      let valueGeom = {geom: geom}
      let values = null
      let valuePath = {path: path}
      //table 所有的区域数据 values null valueGeom地标值valuePath地标路径
      let rows2 = this.getRows(table, values, valueGeom, valuePath)
      let rows3 = this.getUpdateRows(table, valueGeom, valuePath)
      let msg3
      if(this.isUpdate){
        msg3 = {
          cmd: "UPDATE",
          key: "area_id",
          maxid: table.maxid,
          name: "area",
          rows: rows3,
          table: "dat_area",
          title: "区域",
          fromPage: 'monitor'
        }   
      } else {
        msg3 = getMessage('INSERT', rows2, table.def, table.maxid)
      }
      this.showMetaDialog(msg3)
      // if(this.metaDialog.cmdSuccess){
      //     this.sourceArea.addFeature(feature)
      // }
      this.map.removeInteraction(interaction)
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
    // msg.cmd INSERT
    if (this.metaDialog) {
      this.metaDialog.unmount(true)
    }  
    if (this.isforbidArea) {
      this.doInsert(msg)
    }else{
      this.metaDialog = riot.mount('role-dialog', { message: msg })[0]
    }
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    xbus.on('META-UPDATE-DB-RES', (res) => {
      let textvaule = ''
      if (res.code == 0) {
        if (res.data.name === 'area' && this.isforbidArea){
          if (res.code == 0) {
            textvaule = '添加禁区成功'
            if(this.feature){
              this.feature.setId('area' + this.metaforbid.areaid)
              this.feature.setProperties({areaLabel: this.metaforbid.name})
              this.feature.setStyle(this.createPolygonStyle(this.metaforbid.name))
              this.sourceArea.addFeature(this.feature)
            }
          } else {
            textvaule = '添加禁区失败'
          }

          let msg = {
            value: res.code === 0 ? 'success' : 'failure',
            tip: textvaule
          }
          window.hintip.open(msg)
        }

        if (this.feature && !this.isforbidArea && this.metaDialog.refs['name']) {
          let areaName = this.metaDialog.refs['name'].value
          let areaid = this.metaDialog.refs['area_id'].value
          this.feature.setId('area' + areaid)
          this.feature.setProperties({areaLabel: areaName})
          this.feature.setStyle(this.createPolygonStyle(areaName))
          this.sourceArea.addFeature(this.feature)
        } else {
          this.feature = null
        }
      }
      
    })
  }

  // unregisterGlobalEventHandlers(){
  //     xbus.off('META-UPDATE-DB-RES')
  // }
  doInsert(msg){
    let path = msg.rows.filter(item => item.field_name === 'path')[0].field_value
    let areaID = msg.rows.filter(item => item.field_name === 'area_id')[0].field_value
    // let sql = `INSERT into dat_area (area_id,name,area_type_id,map_id,over_count_person,over_count_vehicle,over_time_person,over_time_vehicle,over_speed_vehicle,path,angle,geom,is_work_area) VALUES(${areaID},"禁区",3,5,0,0,0,0,0,"${path}","0",null,0)`
    let sql = `INSERT INTO dat_area (area_id, name, area_type_id, business_type, map_id, over_count_person, over_count_vehicle, over_time_person, over_speed_vehicle, path, angle, is_work_area) VALUES(${areaID}, "禁区", 3, 192, 5, 0, 0, 0, 0, "${path}", "0", 0)`
    let req = composeUpdateDBReq('INSERT', msg.name, areaID, sql)
    this.metaforbid = {
      name: '禁区',
      areaid: areaID
    }
    // console.log(req)
    xbus.trigger('META-UPDATE-DB', {
      req: req
    })
  }

  getRows (table, values, valueGeom, valuePath) {
    values = values ? values.row : null

    let rows = []
    let length = table.def.fields.names.length

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
        v = '新添加区域'
      }
      if (table.def.fields.names[i] === 'path' && valuePath) {
        v = valuePath[table.def.fields.names[i]]
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

  getUpdateRows (table, valueGeom, valuePath) {
    let updateValues = xdata.metaStore.data.area.get(this.unpdateAreaId)
    let rows = []
    let length = table.def.fields.names.length
    for (let i = 0; i < length; i++) {
      let v = updateValues ? updateValues[table.def.fields.names[i]] : ''
      if (table.def.fields.names[i] === 'geom' && valueGeom) {
        v = valueGeom[table.def.fields.names[i]]
      }
      if (table.def.fields.names[i] === 'path' && valuePath) {
        v = valuePath[table.def.fields.names[i]]
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
  
  // composeUpdateDBReq (db_op, keyValue, sqlstring) {
  //   return {
  //     cmd: 'update', // update, CMD.META.UPDATE
  //     data: {
  //       op: db_op, // INSERT, UPDATE, DELETE
  //         // id: this.tableKeyName,  // BUG???
  //       name: 'his_event_data',
  //       id: keyValue,
  //       sql: sqlstring
  //     }
  //   }
  // }
}
