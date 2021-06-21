import PY from './Py.js'

import MetaStore from './MetaStore.js'
import CardStore from './CardStore.js'
import DeviceStore from './DeviceStore.js'
import PersonOnCarStore from './PersonOnCarStore.js'
import TrafficLightsStore from './TrafficLightsStore.js'

import CallStore from './CallStore.js'
import TrackStore from './TrackStore.js'
import PatrolStore from './patrolStore.js'
import LocateStore from './LocateStore.js'
import HelpmeStore from './HelpmeStore.js'
import GasStore from './GasStore.js'
import AlarmStore from './AlarmStore.js'
import CoalTunneller from './CoalTunneller.js'
import AreaListStore from './AreaListStore.js'
import MapStore from './MapStore.js'
import EnvironmentalStore from './EnvironmentalStore.js'
import DragCardStore from './DragCardStore.js'
import PersonCardsStore from './PersonCardsStore.js'

import StatsStore from './StatsStore.js'
// import OfflineDBStore from './OfflineDBStore.js'
import DexieDBStore from './DexieDBStore.js'
import HistoryStore from '../../player/HistoryStore.js'
/**
 * [DataStore 客户端数据容器]
 */
export default class DataStore {
  constructor () {
    this.userName = null // save the login user name
    this.roleID = null
    this.lastUpdate = null // the last socket.io communication time.
    this.collectorStatus = -1  // 未连接
    this.reconnect = false // 监测重连

    this.metaStore = new MetaStore(this)
    this.deviceStore = new DeviceStore(this)
    this.cardStore = new CardStore(this)

    this.callStore = new CallStore(this)
    this.trackStore = new TrackStore(this)
    this.patrolStore = new PatrolStore(this)
    this.locateStore = new LocateStore(this)
    this.helpmeStore = new HelpmeStore(this)
    this.gasStore = new GasStore(this)
    this.alarmStore = new AlarmStore(this)
    this.coaltunneller = new CoalTunneller(this)
    this.areaListStore = new AreaListStore(this)
    this.mapStore = new MapStore(this)
    this.environmentalStore = new EnvironmentalStore(this)
    this.dragCardStore = new DragCardStore(this)
    this.PersonOnCarStore = new PersonOnCarStore(this)
    this.personCardsStore = new PersonCardsStore(this)
    this.TrafficLightsStore = new TrafficLightsStore(this)

    this.statsStore = new StatsStore(this)
    // this.OfflineDBStore = new OfflineDBStore(this)
    this.dexieDBStore = new DexieDBStore(this)
    this.historyStore = new HistoryStore(this)
    this.spell = PY

    this.init()
  }

  init () {
    xbus.on('USERINFO-UPDATE', (msg) => {
      this.userName = msg.name
      this.roleID = msg.roleId
      this.userDept = msg.deptID + ''  // MUST be string, 0 为所有
      this.userIP = msg.userIP
      this.accessID = msg.accessID
      this.objRange = this.isCheck = msg.isCheck
      // this.isCheck = msg.isCheck
      let accesses = this.accessID ? this.accessID.split(';') : ['0']
      let depts = !accesses.includes('0') ? accesses : ''
      depts = depts ? depts.map(item => Number(item)) : ''
      this.depts = depts
    })

    xbus.on('COLLECTOR-STATUS', (msg) => {
      this.collectorStatus = msg.data.status
      xbus.trigger('COLLECTOR-STATUS-UPDATE')
    })
  }
}
