import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'
import { getPolylineBYPoints, drawOLLine } from './OlMapUtils.js'
import {manages} from '../def/manage_def.js'
const POINTIME = 5 * 60 * 1000
export default class OlMapPersonCardsLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)
    this.mapType = workspace.mapType
    this.map = workspace.map
    this.layerList = this.initLayerList()
    this.pointList = this.initPointList()
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this
    xbus.on('DRAW-PERSON-TRACK', (msg) => {
      self.clearLine()
      if (msg.status) {
        this.firstLine = false
        this.secondLine = false
        this.drawTrack(msg.row)
        this.row = msg.row
        this.alarmTrackLayer.setVisible(true)
        this.alarmPointLayer.setVisible(true)
      }
    })

    xbus.on('REPT-SHOW-RESULT', (msg) => {
      if (msg.def.name === 'personCards') {
        let sqlResult = msg.rows
        this.drawLine(sqlResult[`'${this.firstName}'`], 'firstName', this.firstName)
        this.drawLine(sqlResult[`'${this.secondName}'`], 'secondName', this.secondName)
        this.drawPoint(sqlResult[`'${this.firstPointName}'`], 'firstPoint', this.firstPointName)
        this.drawPoint(sqlResult[`'${this.secondPointName}'`], 'secondPoint', this.secondPointName)
        this.firstLine = true
        this.secondLine = true
        if (this.firstLine && this.secondLine) {
          window.xhint.close()
        }
      }
    })

    this.map.addEventListener('click', (evt) => {
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

      if (feature && (feature.getProperties()['data-type'] === 'startMarker' || feature.getProperties()['data-type'] === 'endMarker' || feature.getProperties()['data-type'] === 'alarmPoint')) {
        this.showTips(evt, feature)
      }
    })
  }

  clearLine () {
    this.alarmTrackSource.clear()
    this.alarmPointSource.clear()
  }

  initLayerList (msg) {
    this.alarmTrackSource = new ol.source.Vector()
    this.alarmTrackLayer = new ol.layer.Vector({
      source: this.alarmTrackSource
    })
    this.alarmTrackLayer.setVisible(false)
    this.map.addLayer(this.alarmTrackLayer)

    return this.alarmTrackLayer
  }

  initPointList () {
    this.alarmPointSource = new ol.source.Vector()
    this.alarmPointLayer = new ol.layer.Vector({
      source: this.alarmPointSource
    })
    this.alarmPointLayer.setVisible(false)
    this.map.addLayer(this.alarmPointLayer)

    return this.alarmPointLayer
  }

  drawTrack (msg) {
    window.xhint.show()
    // let eventID = msg.event_id
    let firstCard = msg.first_card
    let secCard = msg.sec_card
    let startTime = new Date(msg.limit_value).format('yyyy-MM-dd hh:mm:ss')
    let endTime = new Date(msg.cur_value).format('yyyy-MM-dd hh:mm:ss')
    let sqlmsg = {}
    this.firstName = `${firstCard}card`
    this.secondName = `${secCard}card`
    this.firstPointName = `${firstCard}point`
    this.secondPointName = `${secCard}point`
    let firstsql = this.getSql(this.firstName, firstCard, startTime, endTime)
    let secsql = this.getSql(this.secondName, secCard, startTime, endTime)
    let firstPointsql = this.getPointsql(this.firstPointName, firstCard, startTime, endTime)
    let secondPointsql = this.getPointsql(this.secondPointName, secCard, startTime, endTime)
    sqlmsg[`'${this.firstName}'`] = firstsql
    sqlmsg[`'${this.secondName}'`] = secsql
    sqlmsg[`'${this.firstPointName}'`] = firstPointsql
    sqlmsg[`'${this.secondPointName}'`] = secondPointsql
    this.getData('personCards', sqlmsg)
  }

  getData (name, sql) {
    let message = {
      cmd: 'query',
      data: {
        name: name,
        sql: sql
      }
    }
    xbus.trigger('REPT-FETCH-DATA', {
      req: message,
      def: {
        name: name
      }
    })
  }

  getSql (name, cardID, startTime, endTime) {
    return `SELECT dse.card_id, begin_time, IFNULL(last_time, now()) as last_time, hl.begin_pt, speed, direction FROM his_location_staff_ hl INNER JOIN dat_staff_extend dse on hl.obj_id = dse.staff_id and dse.card_id = ${cardID} WHERE begin_time >= '${startTime}' AND begin_time <= '${endTime}' ORDER BY begin_time;`
    // this.getData(name, sql)
  }

  getPointsql (name, cardID, startTime, endTime) {
    return `SELECT dse.card_id, begin_time, IFNULL(last_time, now()) as last_time, begin_pt, staff_id, speed, direction FROM his_location_staff_ hl, dat_staff_extend dse WHERE dse.card_id = ${cardID} AND hl.obj_id=dse.staff_id and begin_time >= '${startTime}' AND begin_time <= '${endTime}' order by begin_time;`
    // this.getData(name, sql)
  }

  drawLine (msg, name, idname) {
    let rows = msg
    if (rows && rows.length > 0) {
      let path = getPolylineBYPoints(rows, 'begin_pt')
      drawOLLine(this.alarmTrackSource, idname, path.pointCol, '', name, this.row)
    }
  }

  drawPoint (msg, name, idname) {
    let rows = msg
    if (!rows) return
    for (let i = 0, len = rows.length; i < len; i++) {
      let row = rows[i]
      let coordinate = row.begin_pt && row.begin_pt.split(',')
      this.drawMapPoint(row, Number(coordinate[0]), Number(coordinate[1]), name)
    }
  }

  setFeatureStyle (feature, name) {
    let src = name === 'secondPoint' ? '../img/alarmpoint1.png' : '../img/alarmpoint.png'
    return new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.55, 140], 
        anchorXUnits: 'fraction', 
        anchorYUnits: 'pixels', 
        src: src, 
        scale: 0.15
      }))
    })
  }

  drawMapPoint (row, x, y, name) {
    let alarmPoint = new ol.geom.Point([x, -y])
    let coordinate = row['begin_pt']
    let feature = new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
      name: 'alarmPoint',
      population: 4000,
      rainfall: 500,
      cardID: row.card_id,
      time: row.begin_time,
      x: Number(x),
      y: Number(y),
      'data-type': 'alarmPoint'
    })
    let id = `${row.card_id}-${row.begin_time}`
    feature.setId(id)
    feature.setStyle(this.setFeatureStyle(feature, name))
    feature.setGeometry(alarmPoint)
    this.alarmPointSource.addFeature(feature)
  }

  showTips (evt, feature) {
    let type = feature.getProperties()['data-type']
    let cardID, infoDef, formatedInfo
    if (type === 'alarmPoint') {
      cardID = feature.getProperties()['cardID']
      name = xdata.metaStore.getCardBindObjectInfo(cardID) ? xdata.metaStore.getCardBindObjectInfo(cardID).name : '该卡没有绑定人员'
      let curTime = feature.getProperties()['time']
      infoDef = manages['alarmPoint']
      formatedInfo = {
        card_id: cardID,
        name: name,
        cur_time: curTime,
        x: feature.getProperties()['x'],
        y: feature.getProperties()['y']
      }
    } else {
      cardID = feature.get('id').slice(0, 13)
      name = xdata.metaStore.getCardBindObjectInfo(cardID) ? xdata.metaStore.getCardBindObjectInfo(cardID).name : '该卡没有绑定人员'
      let startTime = feature.getProperties().msg.cur_time
      let endTime = feature.getProperties().msg.cur_value
      infoDef = feature.get('data-type') === 'startMarker' ? manages['personcardstart'] : manages['personcardend']
      formatedInfo = feature.get('data-type') === 'startMarker' ? {
        card_id: cardID,
        name: name,
        start_time: startTime
      } : {
        card_id: cardID,
        name: name,
        end_time: endTime
      }
    }
    let coordinate = evt.coordinate
    let msg = {
      type: 'PERSONCARDS',
      subtype: 'personcards',
      id: cardID,
      event: evt,
      state: {
        def: '',
        rec: ''
      },
      info: {
        def: infoDef,
        rec: formatedInfo
      },
      coordinate: coordinate
    }
    xbus.trigger('MAP-TOOLTIPS-SHOW', msg)
  }
}
