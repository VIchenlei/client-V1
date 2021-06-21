import ol from 'openlayers'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import { SYMBOL_TYPE } from './Symbol.js'
import { ZOOM_LEVEL } from '../def/map_def.js'
import {convertSVGPath2Coord,drawSymbol } from './OlMapUtils.js'
import { testMapID } from '../utils/utils.js'

const STOPENTTER = 3
const TASKAREA = 2000
export default class OlMapAreaLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)

    this.areaList = new Map()
    this.map = workspace.map
    this.layersList = this.initLayersList()
    this.layerSource = new ol.source.Vector()
    this.areaLayer = new ol.layer.Vector({
      source: this.layerSource,
      zIndex: 1
    })
    this.isAreasDrawed = false
    this.areaLayer.setVisible(false)
    this.areaSelect = new ol.interaction.Select()
    this.areaModify = new ol.interaction.Modify({
      features: this.areaSelect.getFeatures()
    })
    this.isEditing = false
    this.alarmAreaSource = new ol.source.Vector()
    this.alarmAreaLayer = new ol.layer.Vector({
      source: this.alarmAreaSource,
      zIndex: 1
    })

    this.map.addLayer(this.areaLayer)
    this.map.addLayer(this.alarmAreaLayer)

    this.registerGlobalEventHandlers()
    this.highlight()
  }

  registerGlobalEventHandlers () {
    let self = this
    xbus.on('MAP-SHOW-AREA', (msg) => {
      if(msg.hasOwnProperty('fromPage')){
        if (this.feature) this.feature.setGeometry(null)
        let feature = this.layerSource.getFeatureById('area' + msg.areas)
        if (feature) this.layerSource.removeFeature(feature)
        this.isAreasDrawed = false
      }
      self.showArea(msg)
      window.AreaLayerShow = msg.isVisible
      
    })

    xbus.on('DRAW-AREA-UPDATE', () => {
      this.layerSource.clear()
      this.drawAreas()
      let show = window.AreaLayerShow
      this.areaLayer.setVisible(show)
    })

    xbus.on('MAP-LOAD-SUCESS',()=>{
      this.layerSource.clear()
      this.alarmAreaSource.clear()
      this.mapID = xdata.metaStore.defaultMapID
      this.drawAreas()
      let show = window.AreaLayerShow
      this.areaLayer.setVisible(show)//等待地图加载完毕，获取上次图层状态
    })

    xbus.on('REMOVE-MAP-AREA', (msg) => {
      if (!msg.id) {
        return
      }
      let feature = this.layerSource.getFeatureById('area' + msg.id)
      feature && this.layerSource.removeFeature(feature)
    })

    xbus.on('MAP-AREAEDIT', (msg) => {
      this.areaSelect.setActive(true)
      this.areaModify.setActive(true)
      this.isEditing = true
      this.map.addInteraction(this.areaSelect)
      this.map.addInteraction(this.areaModify)
      this.unpdateAreaId = !msg.id ? null : msg.id
    })

    this.areaModify.on('modifystart', (e) => {
      let id = e.features.getArray()[0].getId()
      let currentId = 'area' + this.unpdateAreaId
      if (id !== currentId) {
        self.areaModify.setActive(false)
        self.map.removeInteraction(self.areaSelect)
      }
    })
  }
  // 初始化区域层
  initLayersList () {
    this.areaSource = new ol.source.Vector()
    this.areaLayer = new ol.layer.Vector({
      source: this.areaSource,
      style: new ol.style.Style({
        zIndex: 3
      })
    })

    this.areaLayer.setVisible(false)
    this.map.addLayer(this.areaLayer)
    this.isareaDrawed = false

    this.registerEventHandler(this.map, this.areaLayer)

    return this.areaLayer
  }

  registerEventHandler (map, layer) {
    if (map == null) return

    this.map.addEventListener('click', (evt) => {
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
      if (feature && feature.getProperties()['areaLabel']) {
        let id = feature && feature.getId()
        let currentId = 'area' + this.unpdateAreaId
        if (id !== currentId) {
          this.areaModify.setActive(false)
          this.map.removeInteraction(this.areaSelect)
        } else {
          this.areaModify.setActive(true)
          this.map.addInteraction(this.areaSelect)
        }
      } else {
        this.areaModify.setActive(false)
        this.map.removeInteraction(this.areaSelect)
      }
      if (feature && feature.getProperties()['areaLabel'] && !this.isEditing) {
        this.showTips(evt, feature)
      }
    })

    this.map.addEventListener('dblclick', (evt) =>{
      if (!this.isEditing) return
      this.isEditing = false
      this.areaSelect.setActive(false)
      this.areaModify.setActive(false)
      this.map.removeInteraction(this.areaSelect)
      this.map.removeInteraction(this.areaModify)
      this.editEnd(evt)
    })
  }

  editEnd (evt) {
    this.feature = this.layerSource.getFeatureById('area' + this.unpdateAreaId)
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
    let rows3 = this.getUpdateRows(table, valueGeom, valuePath)
    xbus.trigger('UPDATE-ROLE-ROWS', {rows: rows3})
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

  showTips (evt, feature) {
    let dataID = feature.getId()
    if (!dataID) return
    dataID = dataID.replace(/[^0-9]/ig,"")

    let area = xdata.metaStore.data.area && xdata.metaStore.data.area.get(Number(dataID))
    let areaState = {
      'area_id': area.area_id,
      'name': area.name,
      'x': area.x,
      'y': area.y,
      'z': area.z
    }
    let areaInfoDef = xdata.metaStore.defs['area']
    let areaInfo = xdata.metaStore.data['area'].get(parseInt(dataID, 10))
    let formatedInfo = xdata.metaStore.formatRecord(areaInfoDef, areaInfo, null)
    let coordinate = evt.coordinate
    let msg = {
      type: 'AREA',
      subtype: 'area',
      id: dataID,
      event: evt,
      info: {
        def: xdata.metaStore.defs['area'],
        rec: formatedInfo
      },
      coordinate: coordinate
    }
    xbus.trigger('MAP-TOOLTIPS-SHOW', msg)
  }


  highlight () {
    let featureOverlay = new ol.layer.Vector({
      source: new ol.source.Vector(),
      map: this.map,
      zIndex: -10
    })
    // let featureOverlay
    // let v = {
    //   source: new ol.source.Vector(),
    //   map: this.map,
    // }
    let highlight
    let self = this

    let displayFeatureInfo = function (pixel) {
      let feature = self.map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature
      })
      let name = feature && feature.getProperties() && feature.getProperties().name
      if (name === 'fadeArea') return
      if (feature !== highlight) {
        if (highlight && name !== 'workArea' && name !== 'belt') {
          featureOverlay.getSource().removeFeature(highlight)
        }
        if (feature && name !== 'workArea' && name !== 'belt') {
          // let id = feature.getId()
          // if (/area/ig.test(id)) {
          //   v.zIndex = 0
          //   v.opacity = 0.2
          // } else {
          //   v.zIndex = 10
          //   v.opacity = 1
          // }
          // featureOverlay = new ol.layer.Vector(v)
          featureOverlay.getSource().addFeature(feature)
        }
        if (name !== 'workArea' && name !== 'belt') {
          highlight = feature
        }
      }
    }

    this.map.on('pointermove', function (evt) {
      if (evt.dragging) {
        return
      }
      var pixel = self.map.getEventPixel(evt.originalEvent)
      displayFeatureInfo(pixel)
    })
  }

  showArea (msg) {
    if (msg.mapType === this.mapType) {
      if (msg.isVisible) {
        if (msg.type && testMapID(msg.mapID, this.mapID)) {
          this.drawAlarmArea(msg)
        } else {
          if (!this.isAreasDrawed) {
            this.drawAreas(msg)
          }
          this.setDiffAreaTypeVisible(msg)
          this.areaLayer.setVisible(true)
        }
      } else {
        if (msg.type && testMapID(msg.mapID, this.mapID)) {
          this.removeAlarmArea(msg)
        } else {
          this.unvisible(msg)
          if (Array.from(this.areaList.values()).length <= 0) this.areaLayer.setVisible(false)
        }
      }
    }
  }

  drawAlarmArea (msg) {
    if (xdata.metaStore.data.area) {
      // let areas = xdata.metaStore.data.area.values()
      let locationareas = msg.areas
      for (let localarea of locationareas) {
        let areaID = localarea
        let isLocalArea = this.alarmAreaSource.getFeatureById('location' + areaID)
        if (isLocalArea) {
          let locatingarea = xdata.locateStore.locateAreas.get(areaID)
          if (locatingarea !== msg.type) {
            let text = isLocalArea.get('areaLabel')
            isLocalArea.setStyle(this.createPolygonStyle(text, msg.type))
          }
        } else {
          let area = xdata.metaStore.data.area.get(areaID)
          let areaLabel = xdata.metaStore.getNameByID('area_id', areaID)
          if (area && area.path) {
            let coordinates = []
            let paths = area.path.split(' ')
            for (let path of paths) {
              let point = path.split(',')
              let x = Number(point[0].substring(1))
              let y = -Number(point[1])
              coordinates.push([x, y])
            }
            let message = {
              areaLabel: areaLabel
            }
            let polygon = new ol.geom.Polygon([coordinates])
            let center = polygon.getInteriorPoint().getCoordinates()
            this.map.getView().animate({
              center: center,
              duration: 1000,
              zoom: ZOOM_LEVEL.SMALL
            })
            let feature = new ol.Feature(polygon)
            feature.setId('location' + areaID)
            feature.setProperties(message)
            this.alarmAreaSource.addFeature(feature)
            feature.setStyle(this.createPolygonStyle(areaLabel, msg['type']))
          }
        }
      }
    }
  }

  removeAlarmArea (msg) {
    let areas = msg.areas
    for (let i = 0, len = areas.length; i < len; i++) {
      let areaID = areas[i]
      this.deleteArea(areaID)
      xdata.locateStore.locateAreas.delete(areaID)
    }
  }

  deleteArea (areaID) {
    let feature = this.alarmAreaSource.getFeatureById('location' + areaID)
    if (feature) {
      this.alarmAreaSource.removeFeature(feature)
    }
  }

  drawFeature (area, featureID, areaType, visibleAreaType) {
    let feature = null
    if (xdata.isCheck === 1 && area.need_display === 0) return
    let areaLabel = xdata.metaStore.getNameByID('area_id', area.area_id)
    if (area.path) {
      let coordinates = convertSVGPath2Coord(area.path)
      let polygon = new ol.geom.Polygon([coordinates])

      polygon.set(featureID, featureID, true)
      feature = new ol.Feature(polygon)
    } else if (area.geom) {
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.readGeometry(area.geom)
      feature = new ol.Feature(wktGeo)
    }
    if (feature) {
      feature.setId(featureID)
      feature.setProperties({areaLabel: areaLabel, areaType: areaType})
      feature.setStyle(this.createPolygonStyle(areaLabel, areaType))
      if (visibleAreaType) {
        if (areaType != visibleAreaType) feature.setStyle(null)
        this.layerSource.addFeature(feature)
      }
    }
  }

  unvisible (msg) {
    let visibleAreaType = this.getVisibleAreaType(msg)
    this.areaList.delete(msg.visiblearea)
    let features = this.layerSource.getFeatures()
    for (let feature of features) {
      let areaType = feature.getProperties().areaType
      if (areaType == visibleAreaType) this.layerSource.removeFeature(feature)
    } 
  }

  getVisibleAreaType (msg) {
    let visibleAreaType = msg && msg.visiblearea
    visibleAreaType = visibleAreaType && visibleAreaType.substr(5)
    visibleAreaType = visibleAreaType && Number(visibleAreaType)
    return visibleAreaType
  }

  setDiffAreaTypeVisible (msg) {
    let visibleAreaType = this.getVisibleAreaType(msg)
    if (xdata.metaStore.data.area) {
      let areas = xdata.metaStore.data.area.values()
      for (let area of areas) {
        if (!testMapID(area.map_id, this.mapID)) continue
        if (xdata.isCheck === 1 && area.need_display === 0) continue
        let featureID = 'area' + area.area_id
        let areaType = area.area_type_id
        let feature = this.layerSource.getFeatureById(featureID)
        this.areaList.set(msg.visiblearea,visibleAreaType)
        let areaList = Array.from(this.areaList.values())
        if (!areaList.includes(areaType)) {
          feature && this.layerSource.removeFeature(feature)
        } else {
          if (!feature) {
            this.drawFeature(area, featureID, areaType, visibleAreaType)
          }
        }
      }
    } 
  }

  drawAreas (msg) {
    this.mapID = msg ? msg.mapID : this.mapID 
    let visibleAreaType = this.getVisibleAreaType(msg)
    if (xdata.metaStore.data.area) {
      let areas = xdata.metaStore.data.area.values()
      for (let area of areas) {
        if (!testMapID(area.map_id, this.mapID)) continue
        if (xdata.isCheck === 1 && area.need_display === 0) continue
        let featureID = 'area' + area.area_id
        let areaType = area.area_type_id
        if (!msg) {
          let areaName = 'area_' + areaType
          visibleAreaType = this.areaList.get(areaName)
        }
        this.drawFeature(area, featureID, areaType, visibleAreaType)
      }
    }
    this.isAreasDrawed = true
    // this.unregisterGlobalEventHandlers()
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
    } else if (type === STOPENTTER) {
      style.stroke.color = [255, 109, 2, 0.7]
      style.fill.color = [255, 109, 2, 0.7]
      style.text.fill = new ol.style.Fill('#6228a4')
    } else if (type === TASKAREA) {
      style.stroke.color = [38, 204, 65, 0.7]
      style.fill.color = [38, 204, 65, 0.7]
      style.text.fill = new ol.style.Fill('#6228a4')
    }

    return new ol.style.Style({
      stroke: new ol.style.Stroke(style.stroke),
      fill: new ol.style.Fill(style.fill),
      text: new ol.style.Text(style.text)
    })
  }

  unregisterGlobalEventHandlers () {
    xbus.off('MAP-SHOW-AREA')
    // xbus.off('DRAW-AREA-UPDATE')
  }
}
