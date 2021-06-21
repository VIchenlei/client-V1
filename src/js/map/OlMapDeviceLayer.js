import {
  drawSymbol,
  getPolylineBYPoints,
  drawOLLine
} from './OlMapUtils.js'
import {
  SYMBOL_TYPE
} from './Symbol.js'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'
import {
  getRows,
  getMessage,
  judgeAreaIsneedDisplay,
  testMapID
} from '../utils/utils.js'
import {
  getInfo,
  getReaderMsg,
  getModifyReaderMsg,
  getReaderCoord,
  getIdx
} from '../../config/utils.js'
const READERCHARGE = 33 // 分站供电告警event_type_id

export default class OlMapDeviceLayer extends OlMapWorkLayer {
  constructor(workspace) {
    super(workspace)
    this.map = workspace.map
    this.mapID = workspace.mapID
    this.showToolTip = true
    // 在地图上面增加图层
    this.layersList = this.initLayersList()
    this.groups = new Map() // 保存 device group 的 DOM 对象，用于后续修改状态，避免 DOM 搜索
    this.reader_groups = new Map()
    this.updateReader = new Map()
    this.allowUpdateReader = true
    this.reader_id = null
    this.alarmReaders = new Map()

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers() {
    let self = this

    xbus.on('MAP-UPDATE-DEVICE-STATE', (device) => {
      let allowUpdateReader = this.updateReader.get('allowUpdateReader')
      if (this.allowUpdateReader == null) this.allowUpdateReader = true
      if (testMapID(device.map_id, self.mapID) && self.mapType === 'MONITOR') {
        let deviceStateKey = device.device_id + '-' + device.device_type
        self.updateStateColor(deviceStateKey, device)
      }
    })

    xbus.on('MAP-CHANGE-TOOLTIPS', (msg) => {
      this.showToolTip = msg.isToolTip
    })

    xbus.on('MAP-SHOW-READER', (msg) => {
      if (msg.mapType === this.mapType) {
        window.DeviceLayerShow = msg.isVisible
        window.isShowReader = msg.isVisible
        if (msg.isVisible) {
          if (!this.isReaderDrawed) {
            self.drawAllDevices(msg)
          }
          if (msg.cards) {
            window.triggerLocating({
              cards: msg.cards,
              type: msg.type,
              symbolType: 'reader'
            })
          }
          this.readerLayer.setVisible(true)
          if (msg.id) {
            self.startLocation(msg.id)
          }
        } else {
          this.readerLayer.setVisible(false)
          self.stopLocation()
        }
      }
    })

    xbus.on('MAP-SHOW-ONEREADER', (msg) => {
      if (msg.mapType === this.mapType) {
        window.DeviceLayerShow = msg.isVisible
        this.isReaderDrawed = false
        if (msg.isVisible) {
          if (!this.isReaderDrawed) {
            self.drawAllDevices(msg)
          }
          this.readerLayer.setVisible(true)
        } else {
          this.readerLayer.setVisible(false)
          self.stopLocation()
        }
      }
    })

    xbus.on('MAP-LOAD-SUCESS', () => {
      this.mapID = xdata.metaStore.defaultMapID
      let show = window.DeviceLayerShow
      this.resetLayer()
      this.readerLayer.setVisible(show) // 等待地图加载完毕，获取上次图层状态

      // 切换默认地图告警分站状态
      const alarmCount = xdata.alarmStore.DistinguishMapAlarm.get(this.mapID) && xdata.alarmStore.DistinguishMapAlarm.get(this.mapID).size    
      if (alarmCount) this.allUpdateReaderState()
    })

    xbus.on('MAP-MOVE-READER', (msg) => {
      this.allowUpdateReader = false
      this.updateReader.set('allowUpdateReader', false)
      this.reader_id = msg.rows[0].field_value
    })

    //保存成功之后 
    xbus.on('TABLE-CONFIG-UPDATE', () => {
      this.allowUpdateReader = true
      this.updateReader.delete('allowUpdateReader')
    })

    xbus.on('DRAW-READER-UPDATE', (msg) => {
      if (msg && msg.isRedraw) {
        this.allowUpdateReader = true
        this.updateReader.delete('allowUpdateReader')
      }
      if (this.allowUpdateReader) {
        this.resetLayer()
        this.reader_id = null
        self.stopLocation()
      }

    })
  }

  resetLayer() {
    this.readerSource.clear()
    this.drawAllDevices()
    this.showToolTip = true
  }

  storeAlarmReaders(deviceKey, eventType) {
    let ret = this.alarmReaders.get(deviceKey)
    if (!ret) {
      let map = new Map()
      this.alarmReaders.set(deviceKey, map)
    }
    ret = this.alarmReaders.get(deviceKey)
    ret.set(eventType, true)
  }

  // 更改全部告警分站状态
  allUpdateReaderState() {
    const warnReaders = xdata.deviceStore.states && Array.from(xdata.deviceStore.states.values())
    for (let i = 0; i < warnReaders.length; i++) {
      const device = warnReaders[i]
      const deviceStateKey = `${device.device_id}-${device.device_type}`
      this.updateStateColor(deviceStateKey, device)
    }
  }

  updateStateColor(deviceKey, device) {
    let group = this.groups.get(deviceKey)
    let eventType = device.event_type
    let alarmReader = this.alarmReaders.get(deviceKey)

    if (device.state === 0) { // 结束告警，需要特殊判断
      alarmReader && alarmReader.delete(eventType)
      let alarmKey = alarmReader && Array.from(alarmReader.keys())
      if (alarmKey && alarmKey[0]) { // 如果还有其他告警，修改告警类型，重新画告警分站图标
        device.event_type = alarmKey[0]
      }
    } else { // 新的告警消息
			alarmReader = this.alarmReaders.get(deviceKey)
			this.storeAlarmReaders(deviceKey, eventType)
      if (eventType !== 6) { // 如果告警类型不是分站通信异常，需要特殊处理
        let isAbnomal = alarmReader && alarmReader.get(6)
        if (isAbnomal) return // 如果已经推送过分站通信异常，则不需要修改分站图标
			}
    }

    if (group) {
      let feature = this.readerSource.getFeatureById(deviceKey)
      if (!feature) return
      this.readerSource.removeFeature(feature)
      device['x'] = group.get('x')
      device['y'] = group.get('y')
      this.drawDeviceOn(this.layersList, device)
    }
  }

  // init the device layers
  initLayersList() {
    this.readerSource = new ol.source.Vector()
    this.readerLayer = new ol.layer.Vector({
      source: this.readerSource,
      style: new ol.style.Style({
        zIndex: 3
      })
    })

    this.readerLayer.setVisible(false)
    this.map.addLayer(this.readerLayer)
    this.isReaderDrawed = false

    this.registerEventHandler(this.map, this.readerLayer)

    return this.readerLayer
  }

  initLayersLandmarkList() {
    this.landmarkSource = new ol.source.Vector()
    this.landmarkLayer = new ol.layer.Vector({
      source: this.landmarkSource,
      style: new ol.style.Style({
        zIndex: 3
      })
    })

    this.landmarkLayer.setVisible(false)
    this.map.addLayer(this.landmarkLayer)
    this.isLandmarkDrawed = false

    this.registerEventHandler(this.map, this.landmarkLayer)

    return this.landmarkLayer
  }

  registerEventHandler(map, layer) {
    if (map == null) return
    let clickTime
    this.map.addEventListener('click', (evt) => {
      clearTimeout(clickTime)
      clickTime = setTimeout(() => {
        let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

        if (feature && feature.getProperties()['data-type'] === 'device') {
          this.showTips(evt, feature)
        }
      }, 250)
    })

    this.map.addEventListener('dblclick', (evt) => {
      clearTimeout(clickTime)
      let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)

      if (feature && feature.getProperties()['data-type'] === 'device') {
        this.getReaderInfo(evt, feature)
      }
    })
  }

  /**
   * [getDevicesOnMap 指定地图的所有 device]
   * @param  {[type]} mapID [地图ID]
   * @return {[type]}       [所有device，按 device 的类别进行分类存储]
   */
  getDevicesOnMap(mapID) {
    let devices = new Map() // Map(deviceTypeName, deviceList)
    let deviceTypes = xdata.metaStore.data.device_type

    if (deviceTypes) {
      let keys = deviceTypes.keys()
      for (let typeID of keys) {
        let deviceList = this.getATypeDeviceOfMap(mapID, typeID)
        devices.set(deviceList.def.name, deviceList)
      }
    }

    return devices
  }

  getATypeDeviceOfMap(mapID, deviceTypeID) {
    let deviceList = {}
    let deviceTypeDef = xdata.metaStore.data.device_type.get(deviceTypeID)

    let deviceTypeName = deviceTypeDef.name
    let devices = xdata.metaStore.data[deviceTypeName]

    let list = []
    if (devices && devices.size > 0) {
      let rows = devices.values()
      for (let device of rows) {
        if (testMapID(device.map_id, mapID) && device.state === 0) {
          list.push(device)
        }
      }
    }

    deviceList = {
      def: deviceTypeDef,
      rows: list
    }

    return deviceList
  }

  drawAllDevices(msg) {
    let allDeviceList = this.getDevicesOnMap(this.mapID)
    let deviceTypeList = allDeviceList.keys()
    let res
    if (msg && msg.hasOwnProperty('reader_msg')) res = msg.reader_msg
    for (let key of deviceTypeList) {
      let deviceList = allDeviceList.get(key)
      let devices = deviceList.rows
      if (msg && msg.hasOwnProperty('reader_msg')) {
        let reader_res
        for (let device of devices) {
          if (device[[key + '_id']] === res.rows[0].field_value) {
            reader_res = device
            let group = this.drawDeviceOn(this.layersList, reader_res)
            let keyName = reader_res[key + '_id'] + '-' + reader_res.device_type_id
            let reader_groups = Array.from(this.reader_groups)
            for (let i = 0; i < reader_groups.length; i++) {
              if (reader_groups[i]) this.reader_groups.delete(reader_groups[i][0])
            }
            this.reader_groups.set(keyName, group)
          }
        }

      } else {
        for (let device of devices) {
          let group = this.drawDeviceOn(this.layersList, device)
          let keyName = device[key + '_id'] + '-' + device.device_type_id
          this.groups.set(keyName, group)
        }
      }
    }

    if (msg && !msg.hasOwnProperty('reader_msg')) this.isReaderDrawed = true
    // this.unregisterGlobalEventHandlers()
  }

  getSymbolTypeDef(symbolType, symbolSubtypeID) {
    if (symbolType === 'device_type') {
      return xdata.metaStore.data[symbolType].get(parseInt(symbolSubtypeID, 10))
    }
  }

  /**
   * [drawDeviceOn 将图标画到画布]
   * @param  {[type]} canvas [description]
   * @param  {[type]} device [description]
   */
  drawDeviceOn(layers, device) {
    let deviceType = this.getSymbolTypeDef('device_type', device.device_type_id)
    let isNeedDisplay = judgeAreaIsneedDisplay(device)
    if (!isNeedDisplay) return

    if (deviceType) {
      let deviceID = device[`${['virtual_reader', 'reader', 'reader-v'].includes(deviceType.name) ? 'reader' : deviceType.name}_id`]

			// let state = xdata.deviceStore.getState(deviceID, device.device_type_id)
			// 获取分站告警状态
			let state = 0
			let eventType = 0
			let isAlarmRenderID = `${deviceID}-${device.device_type_id}`
			let isAlarm = this.alarmReaders.get(isAlarmRenderID)
			if (isAlarm && Array.from(isAlarm.values()).length > 0) {
				state = 1
				eventType = 33
				if (isAlarm.get(6)) eventType = 6
			}

      let deviceStates = xdata.metaStore.data.device_state
      if (!deviceStates) {
        console.warn('系统尚未下载到设备状态定义数据。', device)
      }

      let stateViewDef = deviceStates && deviceStates.get(parseInt(state.state, 10))
      let deviceColor = stateViewDef ? stateViewDef.color : '#000' // 默认颜色为黑色
      let attrs = {
        'data-id': deviceID + '-' + device.device_type_id,
        'id': deviceID,
        'data-type': SYMBOL_TYPE.DEVICE,
        'data-subtype': deviceType.name,
        x: device.x,
        y: device.y,
        class: 'icon-device state-connected',
        style: `fill: ${deviceColor}`, // set the state color
        state: state,
        event_type: eventType
      }
      return drawSymbol(attrs, this.readerSource, this.map)
    }
  }

  showTips(evt, feature) {
    let dataID = feature.get('data-id')
    let id = dataID ? dataID.split('-')[0] : -1
    if (id < 0) {
      return
    }

    let subtype = ['virtual_reader', 'reader', 'reader-v'].includes(feature.get('data-subtype')) ? 'reader' : feature.get('data-subtype')
    let deviceInfoDef = xdata.metaStore.defs[subtype]
    let deviceInfo = xdata.metaStore.data[subtype].get(parseInt(id, 10))
    let formatedInfo = xdata.metaStore.formatRecord(deviceInfoDef, deviceInfo, null)

    let deviceStateDef = xdata.deviceStore.getStateDefs()
    let deviceState = xdata.deviceStore.getState(id, deviceInfo.device_type_id)

    let coordinate = evt.coordinate

    let msg = {
      type: 'DEVICE',
      subtype: subtype,
      id: id,
      event: evt,
      state: {
        def: deviceStateDef,
        rec: deviceState
      },
      info: {
        def: deviceInfoDef,
        rec: formatedInfo
      },
      coordinate: coordinate
    }
    // console.log(msg)
    if (this.showToolTip) {
      xbus.trigger('MAP-TOOLTIPS-SHOW', msg)
    }
  }

  startLocation(ids) {
    let msg = {
      cards: ids,
      symbolType: 'reader'
    }
    window.cardStartLocating(msg)
  }

  stopLocation() {
    let keys = Array.from(xdata.locateStore.localReader.keys())
    if (keys.length > 0) {
      window.cardStopLocating({
        cards: keys
      })
    }
  }

  /**
   * @description: 显示分站编辑窗口
   * @param {type} 
   * @return: 
   */
  showReaderDialog(msg, amsg, pmsg, coordinate) {
    if (this.readerDialog) {
      this.readerDialog.unmount(true)
    }
    this.readerDialog = riot.mount('reader-dialog', {
      message: msg,
      amessage: amsg,
      pmessage: pmsg,
      coord: coordinate
    })[0]
  }

  /**
   * @description: 拖动分站之后 双击分站图标获取该分站相关信息
   * @param {type} 
   * @return: 
   */
  getReaderInfo(evt, feature) {
    let dataID = feature.get('data-id')
    let id = dataID ? dataID.split('-')[0] : -1
    if (id < 0 || id != this.reader_id) {
      return
    }

    let subtype = ['reader', 'virtual_reader', 'reader-v'].includes(feature.get('data-subtype')) ? 'reader' : feature.get('data-subtype')
    let deviceInfoDef = xdata.metaStore.defs[subtype]
    let deviceInfo = xdata.metaStore.data[subtype].get(parseInt(id, 10))
    let formatedInfo = xdata.metaStore.formatRecord(deviceInfoDef, deviceInfo, null)

    let deviceStateDef = xdata.deviceStore.getStateDefs()
    let deviceState = xdata.deviceStore.getState(id, deviceInfo.device_type_id)

    let coordinate = evt.coordinate
    // console.log(coordinate)
    let msg = {
      type: 'DEVICE',
      subtype: subtype,
      id: id,
      event: evt,
      state: {
        def: deviceStateDef,
        rec: deviceState
      },
      info: {
        def: deviceInfoDef,
        rec: formatedInfo
      },
      coordinate: coordinate
    }

    let store = xdata.metaStore
    let table = {
      def: store.defs[subtype],
      rows: store.dataInArray.get(subtype),
      maxid: store.maxIDs[subtype]
    }

    if (subtype === 'reader') {
      let atable = {
        def: store.defs['antenna'],
        rows: store.dataInArray.get('antenna'),
        maxid: store.maxIDs['antenna']
      }
      let ptable = {
        def: store.defs['reader_path_tof_n'],
        rows: store.dataInArray.get('reader_path_tof_n'),
        maxid: store.maxIDs['reader_path_tof_n']
      }
      let message = this.getRInfo(table, id)
      let rows = message.rows

      message.rows = rows
      let value = message.rows[0].field_value
      let key = message.key
      let amessage = getInfo(atable, value, message.cmd, key)
      let pmessage = getInfo(ptable, value, message.cmd, key)
      if (amessage.length === 0) { //编辑  之前未配置天线  给予默认的天线展示
        let amsg1 = getReaderMsg(atable.def, atable.maxid)
        let amsg2 = getReaderMsg(atable.def, atable.maxid + 1)
        amessage.push(getModifyReaderMsg(message, amsg1, 1))
        amessage.push(getModifyReaderMsg(message, amsg2, 2))
        let rindex_x = getIdx(message, 'x') //分站的x坐标下标
        let rindex_y = getIdx(message, 'y')
        let aindex_x = getIdx(amessage[0], 'x') //天线的x坐标下标
        let aindex_y = getIdx(amessage[0], 'y')
        let values = getReaderCoord(message.rows[rindex_x].field_value, message.rows[rindex_y].field_value, 2, 0) //默认的天线坐标
        amessage.forEach(e => {
          e.rows[aindex_x].field_value = values.x
          e.rows[aindex_y].field_value = values.y
        })
      } else if (amessage.length === 1) {
        let amsg1 = getReaderMsg(atable.def, atable.maxid)
        amessage.push(getModifyReaderMsg(message, amsg1, 2))
        let idx = getIdx(amessage[0], 'idx')
        let rindex_x = getIdx(message, 'x') //分站的x坐标下标
        let rindex_y = getIdx(message, 'y')
        let aindex_x = getIdx(amessage[0], 'x') //天线的x坐标下标
        let aindex_y = getIdx(amessage[0], 'y')
        let values = getReaderCoord(message.rows[rindex_x].field_value, message.rows[rindex_y].field_value, 2, 0) //默认的天线坐标
        amessage[1].rows[aindex_x].field_value = values.x
        amessage[1].rows[aindex_y].field_value = values.y
        amessage[0].rows[idx].field_value = 1
        amessage[1].rows[idx].field_value = 2
      }
      if (message.cmd === 'UPDATE') { // 拖动分站之后修改天线坐标为以分站坐标为中心点，角度0时的默认天线坐标
        let values = getReaderCoord(coordinate[0], -coordinate[1], 2, 0)
        let aindex_x = getIdx(amessage[0], 'x') //天线的x坐标下标
        let aindex_y = getIdx(amessage[0], 'y')
        amessage.forEach(e => {
          e.rows[aindex_x].field_value = values.x
          e.rows[aindex_y].field_value = values.y
        })
      }
      this.showReaderDialog(message, amessage, pmessage, coordinate)
    }
  }
  /**
   * @description: 获取该分站信息 传入为固定格式的数据
   * @param {type} 
   * @return: 
   */
  getRInfo(msg, id) {
    let _rows = msg.rows.filter(item => item.reader_id === Number(id))
    for (let i = 0; i < _rows.length; i++) {
      let eitem = {}
      eitem['row'] = _rows[i]
      let rows = getRows(eitem, msg.def, msg.maxid)
      let _msg = getMessage('UPDATE', rows, msg.def, msg.maxid)
      return _msg
    }
  }
  /**
   * @description: 分站覆盖范围处理画线所需要的数据格式 
   */
  formartFn(rows_two) {
    let rows = []
    for (let i = 0; i < rows_two.length; i++) {
      let subset = {}
      let lsubset = {}
      let e = rows_two[i].rows
      for (let j = 0; j < e.length; j++) {
        if (e[j].field_name === 'reader_id') {
          subset.reader_id = e[j].field_value
        }
        if (e[j].field_name === 'b_x') {
          subset.x = e[j].field_value
        }
        if (e[j].field_name === 'b_y') {
          subset.y = e[j].field_value
        }
        if (i === rows_two.length - 1) {
          if (e[j].field_name === 'reader_id') {
            lsubset.reader_id = e[j].field_value
          }
          if (e[j].field_name === 'e_x') {
            lsubset.x = e[j].field_value
          }
          if (e[j].field_name === 'e_y') {
            lsubset.y = e[j].field_value
          }
        }

      }
      rows.push(subset)
      if (i === rows_two.length - 1) rows.push(lsubset)
    }
    let id = xdata.metaStore.defaultMapID
    let msg = {
      mapID: id,
      rows: rows
    }
    return msg
  }
}
