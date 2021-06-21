const STATUS_ALARM_START = 0
const STATUS_ALARM_CANCEL = 100
const UNCOVER = 1000

import { getAlarmShow, judgeAreaIsneedDisplay} from '../utils/utils.js'

export default class AlarmStore {
  constructor (gstore) {
    this.gstore = gstore
    this.defaultAlarmLevel = 5

    this.alarmList = new Map()
    this.onAlarming = new Map()
    this.alarm = new Map()
    this.DistinguishMapAlarm = new Map()
    this.personCardsMapAlarm = new Map()
    this.alarmTrack = new Map()
    this.cateAlarm = new Map() // 资格证告警，不区分地图

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this
    xbus.on('REPT-SHOW-RESULT', (ds) => {
      let isShowAlarm = getAlarmShow(xdata.roleID)
      if (!isShowAlarm) return
      if (ds.def.name === 'three-credentials') {
        let rows = ds.rows && ds.rows['credentials-maturity']
        if (rows) {
          for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i]
            self.cateAlarm.set(row.credentials_staff_id, row)
            self.onAlarming.set(row.credentials_staff_id, row)
          }
          let data = Array.from(self.cateAlarm.values())
          xbus.trigger('ALARM-LIST-CHANGED', data)
        }
      }
    })

    xbus.on('ALARM-UPDATE', (msg) => {
      let isShowAlarm = getAlarmShow(xdata.roleID)
      if (!isShowAlarm) return
      let alarmType = parseInt(xdata.metaStore.alarm.get('alarm'), 10)
      let defaultMap = parseInt(xdata.metaStore.defaultMapID, 10)
      if (alarmType === 4) {
        return
      }

      let rows = msg.data

      let count = rows.length
      let eventType = xdata.metaStore.data.event_type
      let eventLeave = xdata.metaStore.data.event_level

      for (let i = 0; i < count; i++) {
        let isShow = 0
        let row = rows[i]
        let key = row.event_id

        if (row.area_id) {
          let alarmIsNeedDisplay = judgeAreaIsneedDisplay(row)
          if (!alarmIsNeedDisplay) continue
        }

        if (row.credentials_staff_id) {
          this.doHandleCredentials(row)
          continue
        }

        let ishand = row['ishand']
        if (ishand) {
          self.onAlarming.delete(key, row)
          this.deleteDiffMap(row, this.DistinguishMapAlarm)
          this.dolocation(row, type, 'dislocation')
        } else {
          let type = parseInt(row.type_id, 10)
          let objType = parseInt(row.obj_type_id, 10)
          
          let disTypeId = parseInt(row.dis_type_id, 10)
          let getIsShow = eventType && eventType.get(type) && eventType.get(type).is_show
          let isFilter = true
          let isDisplay = true
          let isByCollect = true

          isShow = getIsShow ? getIsShow : isShow
          if (disTypeId == 1) { // 内部可见
            isByCollect = xdata.objRange === 1 ? true : false
          } else if (disTypeId == 2) { // 外部可见
            isByCollect = xdata.objRange === 0 ? true : false
          }
          if (objType == 9) {
            isFilter = xdata.metaStore.filterDept(row.obj_id)
            isDisplay = xdata.metaStore.needDisplay(row.obj_id) 
          }

          if(isByCollect && isFilter && isDisplay && (isShow === 0 || row.status === STATUS_ALARM_CANCEL)) {
            if (type === 24) {
              this.doHelpme(row)
            } else if (type === 34 || type === 35) {
              this.doGas(row)
            } else if (type === 31) {
              if (xdata.roleID === 1) this.doPersonCards(row)
            } else {
              let levelID = eventType && eventType.get(type) && eventLeave.get(eventType.get(type).event_level_id) && eventLeave.get(eventType.get(type).event_level_id).event_level_id
              if (levelID !== alarmType && alarmType !== 5) {
                return
              }
              // this.saveAlarmBytypeID(row)
              if (row.status === STATUS_ALARM_CANCEL) {
                self.onAlarming.delete(key, row)
                this.deleteDiffMap(row, this.DistinguishMapAlarm)
                this.dolocation(row, type, 'dislocation')
              } else {
                let levelName = eventLeave && eventType.get(type) && eventLeave.get(eventType.get(type).event_level_id).name
                row['color'] = this.getcolorLevel(levelName)
                row['id'] = key // add an id to helpme record
                row['state'] = 'ALARMING' // add the msg's state
                self.onAlarming.set(key, row)
                this.saveDiffMap(row, this.DistinguishMapAlarm)
              }
              if (type === 28 || type === 30) {
                xbus.trigger('DRIVINGFACE-WARN-UPDATE', {typeid: type})
              }
              if (type === 6 || type === 33) {
                this.changeReaderState(row, type)
              }
            }
            // 暂时屏蔽
            // if (type === 38 || type === 19 || type === 20) {
            //   if(row.status === 0){
            //     let msg1 = {
            //       cards: [row.obj_id],
            //       type: 'ALARM'
            //     }
            //     window.cardStartLocating(msg1)
            //   } 
            // }
          }
        }
      }

      let data = this.DistinguishMapAlarm.get(defaultMap) ? Array.from(this.DistinguishMapAlarm.get(defaultMap).values()) : []
      let cateAlarm = this.cateAlarm && Array.from(this.cateAlarm.values())
      data = cateAlarm && cateAlarm.length > 0 ? data.concat(cateAlarm) : data
      xbus.trigger('ALARM-LIST-CHANGED', data)
      xbus.trigger('THREE-ALARM-TOP-SHOW')
    })
  }

  doHandleCredentials (row) {
    let status = row.status
    if (status === STATUS_ALARM_CANCEL) {
      this.cateAlarm.delete(row.credentials_staff_id)
      this.onAlarming.delete(row.credentials_staff_id)
    } else if (status === STATUS_ALARM_START) {
      this.cateAlarm.set(row.credentials_staff_id, row)
      this.onAlarming.set(row.credentials_staff_id, row)
    }
    xbus.trigger('ALARM-LIST-CHANGED')
  }

  changeReaderState (row, type) {
    const deviceTypeID = xdata.metaStore.data.reader.get(Number(row['obj_id'])).device_type_id
    let msg = {
      device_id: Number(row['obj_id']),
      reader_id: Number(row['obj_id']),
      device_type: deviceTypeID,
      device_type_id: deviceTypeID,
      reader_type: 'reader',
      name: xdata.metaStore.getNameByID('reader_id', Number(row['obj_id'])),
      state: row['status'] === 0 ? 1 : 0,
      time: new Date(row['cur_time']).format('MM-dd hh:mm:ss'),
      map_id: row['map_id'],
      control: 0,
      event_type: type
    }
    xdata.deviceStore.setState(msg)
    xbus.trigger('MAP-UPDATE-DEVICE-STATE', msg)
  }

  getcolorLevel (levelName) {
    switch (levelName) {
      case '非常紧急':
        return 'red'
      case '紧急':
        return 'yellow'
      case '一般紧急':
        return 'gray'
      case '一般':
        return 'white'
      default:
        return 'white'
    }
  }

  dolocation (row, type, locname) {
    let localCard = []  // 卡定位
    let localArea = []  // 区域定位
    let disLocation = []  // 取消卡定位
    let disLocalArea = []  // 取消区域定位
    if (type === 3 || type === 4 || type === 15 || type === 16) {
      locname === 'location' ? localArea.push(row.area_id) : disLocalArea.push(row.area_id)
      // 存到区域定位Map里
      locname === 'location' ? xdata.locateStore.locateAreas.set(row.area_id, 'alarm') : xdata.locateStore.locateAreas.delete(row.area_id)
    } else if ((type !== 1 && type < 5) || (type > 10 && type !== 27)) {
      let inUncoverArea = xdata.cardStore.isInUncoverArea(row.obj_id)
      if (inUncoverArea) { // 判断是否在非覆盖区域
        locname === 'location' ? localArea.push(row.area_id) : disLocalArea.push(row.area_id)
        locname === 'location' ? xdata.locateStore.locateAreas.set(row.area_id, 'alarm') : xdata.locateStore.locateAreas.delete(row.area_id)
      } else {
        locname === 'location' ? localCard.push(row.obj_id) : disLocation.push(row.obj_id)
      }
    }

    if (localArea.length > 0) {
      let message = {
        type: 'ALARM',
        mapType: 'MONITOR',
        isVisible: true,
        mapID: 5,
        areas: localArea
      }
      // xbus.trigger('MAP-SHOW-AREA', message)
    }
    if (disLocalArea.length > 0) {
      let message = {
        type: 'ALARM',
        mapType: 'MONITOR',
        isVisible: false,
        mapID: 5,
        areas: disLocalArea
      }
      // xbus.trigger('MAP-SHOW-AREA', message)
    }

    if (localCard.length > 0) {
      let msg = {
        cards: localCard,  // [cardid, ...]
        type: 'ALARM'     // ALARM, ...; default is null, means simple locating
      }
      // xbus.trigger('CARD-LOCATING-START', msg)
      // window.cardStartLocating(msg)
    }
    if (disLocation.length > 0) {
      let message = {
        cards: disLocation,
        type: 'ALARM'
      }
      window.cardStopLocating && window.cardStopLocating(message)
    }
  }

  saveDiffMap (data, map) { // 按地图存储告警信息
    let mapID = data.map_id
    let eventID = data.event_id
    let rec = map.get(mapID)
    if (!rec) {
      rec = new Map()
      map.set(mapID, rec)
    }
    rec.set(eventID, data)
  }

  deleteDiffMap (data, map) { // 按地图删除告警信息
    let mapID = data.map_id
    let eventID = data.event_id
    let rec = map.get(mapID)
    if (rec) {
      rec.delete(eventID, data)
    }
  }

  saveAlarmBytypeID (data) { // 保存最新的eventid告警状态，按事件类型存储
    let typeid = data.type_id
    let rec = this.alarm.get(typeid)

    if (!rec) {
      rec = new Map()
      this.alarm.set(typeid, rec)
    }

    if (!rec.get(data.event_id)) {
      rec.set(data.event_id, data)
    }
  }

  doHelpme (row) {
    xbus.trigger('HELPME-REQ', row)
  }

  doGas (row) {
    xbus.trigger('GAS-REQ', row)
  }

  getMsg (row) {
    let objIDs = row.obj_id.split('&')
    row['first_card'] = objIDs[0]
    row['sec_card'] = objIDs[1]
    let firstObj = xdata.metaStore.getCardBindObjectInfo(objIDs[0])
    let secObj = xdata.metaStore.getCardBindObjectInfo(objIDs[1])
    row['first_name'] = firstObj ? firstObj.name : '该卡未注册'
    row['sec_name'] = secObj ? secObj.name : '该卡未注册'
    row['first_dept'] = firstObj ? firstObj.dept_id : ''
    row['sec_dept'] = secObj ? secObj.dept_id : ''
    return row
  }

  doPersonCards (row) {
    row = this.getMsg(row)
    let key = row.event_id
    let status = parseInt(row.status, 10)
    if (status === STATUS_ALARM_START) {
      this.saveDiffMap(row, this.personCardsMapAlarm)
    } else if (status === STATUS_ALARM_CANCEL) {
      this.deleteDiffMap(row, this.personCardsMapAlarm)
      if (this.alarmTrack.get(key)) {
        xbus.trigger('DRAW-PERSON-TRACK', {status: false})
      }
    }
  }
}
