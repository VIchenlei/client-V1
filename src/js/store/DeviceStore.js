import { toJson, judgeAreaIsneedDisplay } from '../utils/utils.js'
import deviceStateDef from '../def/device_state_def.js'

export default class DeviceStore {
  constructor (gs) {
    this.gs = gs

        // all devices' state
    this.stateDefs = deviceStateDef
    this.states = new Map() // key = device_id + '-' + device_type_id
    this.traffic = new Map()
    this.stateCount = []
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    // xbus.on('DEVICE-UPDATE-STATE', (msg) => {
    //         // debugger
    //   let data = toJson(msg)
    //   let mapCount = data.length
    //   for (let i = 0; i < mapCount; i++) {
    //     let mapData = data[i]
    //     let mapID = parseInt(mapData.map_id, 10)
    //     let devices = mapData.devices
    //     let deviceCount = devices.length
    //     for (let j = 0; j < deviceCount; j++) {
    //       let device = devices[j]
    //       device['mapID'] = mapID // 补充 mapID 到记录中
    //                     // device['time'] = Date.now().format('yyyy-MM-dd hh:mm:ss')
    //       device['time'] = new Date().format('MM-dd hh:mm:ss')
    //       if (!this.deviceHasBeenCount(device.device_id, device.device_type_id)) self.setStateCount(device.device_type_id, device.state)
    //       self.setState(device)
    //       xbus.trigger('MAP-UPDATE-DEVICE-STATE', device)
    //     }
    //   }

    //   xbus.trigger('DEVICE-STATE-UPDATED')
    // })
    xbus.on('DEVICE-UPDATE-STATE', (msg) => {
      this.stateCount = []
      let data = toJson(msg)
      let mapCount = data.length
      for (let i = 0; i < mapCount; i++) {
        let mapData = {}
        if (data[i].devices) {
          let mapDataDevice = data[i].devices[0]
          mapData['device_id'] = mapDataDevice.device_id
          mapData['reader_id'] = mapDataDevice.device_id
          mapData['device_type'] = mapDataDevice.device_type_id
          mapData['device_type_id'] = mapDataDevice.device_type_id
          mapData['reader_type'] = 'reader'
          mapData['state'] = mapDataDevice.state
          mapData['time'] = mapDataDevice.time
        } else {
          mapData['device_id'] = data[i][0]
          mapData['reader_id'] = data[i][0]
          mapData['device_type'] = data[i][1]
          mapData['device_type_id'] = data[i][1]
          if (data[i][1] === 0) {
            mapData['reader_type'] = 'reader'
            mapData['name'] = xdata.metaStore.getNameByID('reader_id', data[i][0])
          }
          mapData['state'] = data[i][2]
          mapData['time'] = new Date(data[i][3]).format('MM-dd hh:mm:ss')
          mapData['map_id'] = parseInt(data[i][4], 10)
          mapData['control'] = data[i][5]
          // if (!this.deviceHasBeenCount(mapData['device_id'], mapData['device_type']))
          if (mapData['device_type'] === 3) {
            self.setStateCount(mapData['device_type'], mapData['state'])
          }
          // self.setStateCount(mapData['device_type'], mapData['state'])
        }
        self.setState(mapData)
        xbus.trigger('MAP-UPDATE-DEVICE-STATE', mapData)
      }
      xbus.trigger('DEVICE-STATE-UPDATED')
    })

    xbus.on('DEVICE-CHANGE-STATE', (msg) => {
      let data = toJson(msg)
      let len = data.length
      let callBack = []
      for (let i = 0; i < len; i++) {
        let callData = data[i]
        callBack['cmd'] = 'lights_ctrl_rsp'
        callBack['task_id'] = callData.task_id
        callBack['user_id'] = callData.user_id
        callBack['device_type'] = 3
        for (let j = 0, l = callData.lights.length; j < l; j++) {
          let callLight = callData.lights[j]
          callBack['lights_id'] = callLight.id
          callBack['lights_ctrl_type'] = callLight.ctrl_type
          callBack['light_state'] = callLight.light_state
        }
        self.setState(callBack)
      }
      xbus.trigger('DEVICE-STATE-UPDATED')
    })
  }

  // 获取选定范围内分站
  getReaderDetail (filterGeo) {
    let readers = xdata.metaStore.data.reader && Array.from(xdata.metaStore.data.reader.values())
    if (!readers) return
    let arrtriFilterReaders = []
    if (filterGeo) {
      arrtriFilterReaders = readers.filter(item => {
        let coord = [item.x, -item.y]
        let isItem = filterGeo.intersectsCoordinate(coord)
        return isItem && item.reader_id
      })
    }
    return arrtriFilterReaders
  }

  setState (state) {
    let stateKey = null
    if (state.cmd === 'lights_ctrl_rsp') {
      stateKey = state.task_id + '-' + state.user_id
      this.traffic.set(stateKey, state)
    } else {
      let reader = xdata.metaStore.data.reader
      stateKey = state.device_id + '-' + state.device_type
      this.states.set(stateKey, state)
    }
  }

  setStateCount (deviceTypeID, stateID) {
    if (this.stateCount.length) {
      let theTypeInCount = true
      for (let i = 0; i < this.stateCount.length; i++) {
        if (deviceTypeID === this.stateCount[i].type) {
          this.finishStateCountDetail(stateID, this.stateCount[i])
          break
        } else {
          theTypeInCount = false
        }
      }
      if (!theTypeInCount) {
        this.stateCount.push(this.generateStateCountObject(deviceTypeID, stateID))
      }
    } else {
      this.stateCount.push(this.generateStateCountObject(deviceTypeID, stateID))
    }
  }
  generateStateCountObject (deviceTypeID, stateID) {
    let stateCountContent = {
      type: '0',
      normalCount: '0',
      unnormalCount: '0',
      sum: '0'
    }
    stateCountContent.type = deviceTypeID
    stateCountContent = this.finishStateCountDetail(stateID, stateCountContent)
    return stateCountContent
  }
  finishStateCountDetail (stateID, stateCountContent) {
    let sum = Number(stateCountContent.sum) + 1
    stateCountContent.sum = sum.toString()

    let count = null

    if (stateID.toString() === '0') {
      count = Number(stateCountContent.unnormalCount) + 1
      stateCountContent.unnormalCount = count.toString()
    } else {
      count = Number(stateCountContent.normalCount) + 1
      stateCountContent.normalCount = count.toString()
    }
    return stateCountContent
  }

  getState (deviceID, deviceTypeID) {
    let deviceState = null, deviceName = null
    let stateKey = deviceID + '-' + deviceTypeID
    let state = this.states.get(stateKey)
    // 如果当前没有设备状态，默认为“正常”
    let readerTypeArr = [0, 1, 6, 7, 8, 9, 10]
    let deviceAlarm = null
    if (readerTypeArr.includes(deviceTypeID)) {
      let device = Array.from(xdata.metaStore.dataInArray.get('reader')).find(item => item.reader_id === Number(deviceID))
      deviceState = device && device.state
      deviceName = device && device.name

      let alarms = xdata.alarmStore.onAlarming && Array.from(xdata.alarmStore.onAlarming.values())
      let currentDeviceAlarm = alarms.filter(item => parseInt(item.obj_id, 10) === parseInt(deviceID, 10) && parseInt(item.obj_type_id, 10) === 4)
      if (currentDeviceAlarm && currentDeviceAlarm.length > 1) {
        currentDeviceAlarm = currentDeviceAlarm.filter(item => item.type_id === 6)
      }
      deviceAlarm = currentDeviceAlarm[0]
    } 
    if (!state) {
      state = {
        'device_id': deviceID,
        'state': deviceState, // 0: normal
        'device_type_id': deviceTypeID,
        'time': new Date().format('MM-dd hh:mm:ss'),
        'name': deviceName
      }
    }
    state['event_type_id'] = deviceAlarm && deviceAlarm.type_id
    state['alarm_time'] = deviceAlarm && new Date(deviceAlarm.cur_time).format('MM-dd hh:mm:ss')

    return state
  }
  deviceHasBeenCount (deviceID, deviceTypeID) {
    let stateKey = deviceID + '-' + deviceTypeID
    let state = this.states.get(stateKey)

    if (state) {
      return true
    } else {
      return false
    }
  }
  getStateDefs () {
    return this.stateDefs.device
  }

  getSearchData (type) {
    let sdata = []
    let objs = xdata.metaStore.data.reader
    objs = objs && Array.from(objs.values())
    if (objs) {
      for (let i = 0, len = objs.length; i < len; i++) {
        let obj = objs[i]
        let id = obj.reader_id
        let name = obj.name
        let needDisplay = judgeAreaIsneedDisplay(obj)
        if (!needDisplay) continue
        let spy = name && xdata.spell.makePy(name)  // 首字母
        let brief = spy ? spy[0] : ''

        sdata.push({
          id: id,
          n: name,
          b: brief,
          t: 3,
          c: id
        })
      }
    } 
    return sdata
  }
  getSearchLandmarkData (type) {
    let sdata = []
    let objs = xdata.metaStore.data.landmark
    objs = objs && Array.from(objs.values())
    if (objs) {
      for (let i = 0, len = objs.length; i < len; i++) {
        let obj = objs[i]
        let id = obj.landmark_id
        let name = obj.name
        let needDisplay = judgeAreaIsneedDisplay(obj)
        if (!needDisplay) continue
        let spy = name && xdata.spell.makePy(name)  // 首字母
        let brief = spy ? spy[0] : ''

        sdata.push({
          id: id,
          n: name,
          b: brief,
          t: 4,
          c: id
        })
      }
    } 
    return sdata
  }
}
