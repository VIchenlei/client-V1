import ol from 'openlayers'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import { convertSVGPath2Coord, initInteractions, getRows } from './OlMapUtils.js'
import {getMessage, composeUpdateDBReq, clone} from '../utils/utils'
import '../../config/tag/meta-dialog.html'

export default class OlMapFill extends OlMapWorkLayer {
  constructor (workspace, draw) {
    super (workspace)
    this.map = workspace.map
    this.draw = draw
    this.modify = null
    this.snap = null
    this.source = null
    this.path = null
    this.fillSelect = new ol.interaction.Select()
    this.fillModify = new ol.interaction.Modify({
      features: this.fillSelect.getFeatures()
    })
    this.isEditing = false
    this.fillSource = new ol.source.Vector()
    this.fillLayer = new ol.layer.Vector({
      source: this.fillSource,
      zIndex: 12
    })
    this.map.addLayer(this.fillLayer)

    this.isDrawed = false

    this.init()
    let self = this
    xbus.on('GRAW-GOAF-ON-MAP', msg => {
      this.drawGoaf(msg)
    })

    xbus.on('DELETE-GOAF-ON-MAP', msg => {
      this.deleteGoaf(msg)
    })

    xbus.on('GOAF-INIT', msg => {
      if (this.editFeature) this.editFeature.setGeometry(null)
      let feature = this.fillSource.getFeatureById('goaf' + msg.goaf)
      if (feature) this.fillSource.removeFeature(feature)
      let goaf = xdata.metaStore.data.goaf && xdata.metaStore.data.goaf.get(msg.goaf)
      this.drawGoaf(goaf, 'path')
    })

    xbus.on('MAP-DRAW-GOAF', (msg) => {
      if (this.map.getTarget() !== 'monitormap') return
      this.source = new ol.source.Vector()
      if (this.draw.interaction) {
        this.map.removeInteraction(this.draw.interaction)
      }
      initInteractions(this.map, this.draw, this.snap, this.modify, this.addInteractions, this)
    })

    xbus.on('MAP-GOAFEDIT', (msg) => {
      this.fillSelect.setActive(true)
      this.fillModify.setActive(true)
      this.isEditing = true
      this.map.addInteraction(this.fillSelect)
      this.map.addInteraction(this.fillModify)
      this.updateGoafId = !msg.id ? null : msg.id
    })

    xbus.on('DRAW-ALL-GOAF', () => {
      if (this.isDrawed) return
      this.init()
    })

    this.registerEventHandler()
  }

  registerEventHandler () {
    if (!this.map) return 
    this.map.addEventListener('click', (evt) => {
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
      if (feature && feature.getProperties()['data_subtype'] === 'goaf') {
        let id = feature && feature.getId()
        let currentId = 'goaf' + this.updateGoafId
        if (id !== currentId) {
          this.fillModify.setActive(false)
          this.map.removeInteraction(this.fillSelect)
        } else {
          this.fillModify.setActive(true)
          this.map.addInteraction(this.fillSelect)
        }
      } else {
        this.fillModify.setActive(false)
        this.map.removeInteraction(this.fillSelect)
      }
      
      if (feature && feature.getProperties()['data_subtype'] === 'goaf' && !this.isEditing) {
        this.showTips(evt, feature)
      }
    })

    this.map.addEventListener('dblclick', (evt) =>{
      if (!this.isEditing) return
      this.isEditing = false
      this.fillSelect.setActive(false)
      this.fillModify.setActive(false)
      this.map.removeInteraction(this.fillSelect)
      this.map.removeInteraction(this.fillModify)
      this.editEnd(evt)
    })
  }

  editEnd (evt) {
    this.editFeature = this.fillSource.getFeatureById('goaf' + this.updateGoafId)
    let wkt = new ol.format.WKT()
    let wktGeo = wkt.writeGeometry(this.editFeature.getGeometry())
    let path = wktGeo.slice(9, -2).split(',').map((item, index)=>{
      item = item.split(' ').join(',')
      return item
    })
    path = path.join(';')
    this.path = path
    let store = xdata.metaStore
    let name = 'goaf'
    let table = {
      def: store.defs[name],
      rows: store.dataInArray.get(name),
      maxid: store.maxIDs[name]
    }
    let rows = this.getUpdateRows(table, null, {path: path})
    xbus.trigger('UPDATE-META-ROWS', {rows: rows})
  }


  showTips (evt, feature) {
    let dataID = feature.get('data_id')
    if (!dataID && dataID !== 0) return
    let goafs = xdata.metaStore.data.goaf
    let goaf = goafs.get(parseInt(dataID, 10))
    let goafDef = xdata.metaStore.defs['goaf']
    let goafDefCopy = clone(goafDef)
    if (xdata.isCheck === 1) {
      let fields = goafDefCopy.fields
      fields.names.pop()
      fields.labels.pop()
      fields.types.pop()
    }
    let coordinate = evt.coordinate
    let formatedInfo = xdata.metaStore.formatRecord(goafDef, goaf, null)
    let msg = {
      type: 'DEVICE',
      subtype: feature.get('data_subtype'),
      id: dataID,
      event: evt,
      state: {
        def: goafDefCopy,
        rec: goaf
      },
      info: {
        def: goafDefCopy,
        rec: formatedInfo
      },
      coordinate: coordinate
    }
    xbus.trigger('MAP-TOOLTIPS-SHOW', msg)
  }

  showMetaDialog (msg) {
    if (this.metaDialog) {
      this.metaDialog.unmount(true)
    }
    this.metaDialog = riot.mount('meta-dialog', { message: msg })[0]
  }

  addInteractions (interaction) {
    interaction.addEventListener('drawend', (evt) => {
      this.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(this.feature.getGeometry())
      let path = wktGeo.slice(9, -2).split(',').map((item, index)=>{
        item = item.split(' ').join(',')
        return item
      })
      path = path.join(';')
      this.path = path
      let store = xdata.metaStore
      let name = 'goaf'
      let table = {
        def: store.defs[name],
        rows: store.dataInArray.get(name),
        maxid: store.maxIDs[name]
      }
      let rows = getRows(table, null, {path: path})
      let msg = getMessage('INSERT', rows, table.def, table.maxid)
      this.showMetaDialog(msg)
      this.map.removeInteraction(interaction)
    })
  }

  getUpdateRows (table, valueGeom, valuePath) {
    let updateValues = xdata.metaStore.data.goaf.get(this.updateGoafId)
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

  getPatten (canvas, context) {
    let pixelRatio = 1
    canvas.width = 8 * pixelRatio
    canvas.height = 8 * pixelRatio
    // white background
    context.fillStyle = 'rgba(255, 255, 255, 0.1)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // outer circle
    context.strokeStyle = 'rgba(192, 192, 192, 0.5)'
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(300, 300)
    context.stroke()
    return context.createPattern(canvas, 'repeat')
  }
 
  createFillStyle (canvas, context) {
    let patten = this.getPatten(canvas, context)
    let style = new ol.style.Style({
      stroke: new ol.style.Stroke({ width: 1, color: [192, 192, 192] }),
      fill: new ol.style.Fill({
        color: patten
      })
    })
    return style
  }

  drawGoaf (msg, pname) {
    if (!msg) return
    let needDisplay = parseInt(msg.need_display, 10)
    if (xdata.isCheck === 1 && needDisplay === 0) return

    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    let goafID = `goaf${msg.goaf_id}`
    let path = pname ? msg.path : this.path
    let fill = convertSVGPath2Coord(path, ';', 'notsubstring', 'noreverse')

    let polygon = new ol.geom.Polygon([fill])
    let feature = new ol.Feature(polygon)
    let attributies = {
      data_subtype: 'goaf',
      data_id: msg.goaf_id
    }
    feature.setId(goafID)
    feature.setProperties(attributies)
    this.fillSource.addFeature(feature)
    feature.setStyle(this.createFillStyle(canvas, context))
  }

  deleteGoaf (id) {
    let goafFeatureID = `goaf${id}`
    let feature = this.fillSource.getFeatureById(goafFeatureID)
    feature && this.fillSource.removeFeature(feature)
  }

  init () {
    let goafs = xdata.metaStore.data.goaf
    if (!goafs) return 
    for (let goaf of goafs.values()) {
      this.drawGoaf(goaf, 'path')
    }
    this.isDrawed = true
  }
}