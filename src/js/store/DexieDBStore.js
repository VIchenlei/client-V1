import Dexie from 'dexie'
import specialTable from '../def/special_tablekey_def.js'
const DB_NAME = 'YaLocDataInBrowserDB'

export default class DexieDBStore {
  constructor(gstore) {
    this.gstore = gstore
    this.db = null
    this.data = new Map() // 拉取元数据表
    this.dbstore = false
    this.mdtdata = null
    this.forceUpdateMetadata = false // 是否为强制更新数据
    this.forceData = new Map() // 强制更新元数据列表
    this.version = 1

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers() {
    let self = this
    xbus.on('DB-OPEN', (res) => {
      let name = res.name
      let rows = res.rows
      self.openDB(name, rows)
    })

    xbus.on('OPEN-LOCAL-DB', () => {
      self.openLocalDb()
    })

    xbus.on('META-UPDATE-DB-RES', (res) => {
      if (xdata.metaStore.data[res.data.name]) {
        if (res.code === 0) {
          let storename = `dat_${res.data.name}`
          let key = res.data.id
          if (res.data.op === 'DELETE') {
            key && this.deleteAssignData(storename, key)
          }
          let timename = res.mdtdata.timename
          let time = res.mdtdata.time
          this.name && this.db[this.name].update(storename, {
            timename: time
          })
        }
      }
    })

    xbus.on('ALL-DATA-HAS-PULL', (res) => {
      if (res.code === 0) {
        this.forceUpdateMetadata = false
      }
    })
  }

  async openLocalDb() {
    this.db = new Dexie(DB_NAME)
    try {
      this.db && await this.db.open()
    } catch (error) {
      return console.warn('No data is stored yet!')
    }
    this.version = this.db.verno
    let data = await this.db.table('mdt_update').toArray()
    for (let i = 0, len = data.length; i < len; i++) {
      let tableGroup = data[i],
        tableName = tableGroup.tableName
      await xdata.metaStore.saveData(tableName)
    }
    xdata.metaStore.handleTable()
    // console.log('xdata.metaStore', xdata.metaStore)
  }

  async getArray(name, storename) {
    let self = this
    let arr = self.db[name] && await self.db[name].toArray()
    if (arr && arr.length <= 0) { // 只有objectStore，但是没有对应基础表数据
      self.initDB(name) // 拉取所有数据
    }
  }

  // name: dat_xxx    defname: xxx
  async openDB(datname, rows) {
    // 强制更新 ？ 删除本地indexDB ：关闭数据库
    if (this.forceUpdateMetadata) {
      await this.db.delete()
      this.version = 1
      this.forceUpdateMetadata = false
      this.storeForceData = true
    } else {
      this.db.isOpen() && this.db.close()
    }

    let self = this
    this.name = datname
    this.rows = rows
    this.db = new Dexie(DB_NAME)
    // let storenames = rows
    let msg = {}
    msg[datname] = 'tableName'
    let version = parseInt(this.version, 10)
    version = version ? parseInt(version, 10) : 1

    if (!rows) return

    for (let i = 0, len = rows.length; i < len; i++) { // objectStore
      let storename = rows[i]
      let name = storename.tableName
      let key = null
      if (!this.db[name]) {
        let defname = name.slice(4)
        let def = xdata.metaStore.defs[defname]
        if (def) {
          key = def.fields.names[def.keyIndex]
        } else {
          key = specialTable[defname] || `${name.slice(4)}_id`
        }
        if (name === 'dat_reader_path_tof_n') {
          key = '++tof'
        }
      }
      msg[name] = key
    }

    this.db.version(version).stores(msg)
    this.db.version(version + 1).stores(msg)
    await this.db.open()
    let data = await this.db.table('mdt_update').toArray()
    if (this.db.isOpen()) {
      let msg = {
        cmd: 'pull_down_metadata',
        data: {
          mdtdata: data,
          objRange: xdata.objRange
        }
      }
      xbus.trigger('PULL-DOWN-METADATA', msg)
    }

    for (let i = 0, len = rows.length; i < len; i++) {
      let storename = rows[i]
      let name = storename.tableName
      self.getArray(name, storename)
    }
    self.dbstore = true
    self.storeDATA(self.name, self.rows) // 每次更新indexDB中dat_mdt_update表
    xdata.metaStore.handleTable()
  }

  initDB(name) {
    let len = name.length,
      defName = name.slice(4, len),
      defData = xdata.metaStore.defs[defName]
    let sqlStr = defData && defData.fields.names
    sqlStr = sqlStr || '*'
    let sql = `select ${sqlStr} from ${name}`
    let sqlname = name
    this.data.set(sqlname, true)
    this.inquireDB(sqlname, sql)
  }

  inquireDB(name, sql) {
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

  storeDATA(name, value, upmethod) {
    let self = this
    let storename
    try {
      storename = this.db[name] || this.db.table(name)
    } catch (error) {
      console.warn(`Table ${name} not exist`)
    }

    if (storename) {
      this.db.transaction('rw', storename, async () => {
        if (value) {
          // if(storename.name === 'dat_coalface'){
          //   value.map(item =>{
          //     item.name = xdata.metaStore.data.work_face.get(item.coalface_id).name
          //     return item
          //   })
          // }else if(storename.name === 'dat_drivingface'){
          //   value.map(item =>{
          //     item.name = xdata.metaStore.data.work_face.get(item.drivingface_id).name
          //     return item
          //   })
          // }
          // 全量更新，先删除，再put ？实时页面是否存在问题
          await storename.clear()
          // if (upmethod == 'DELETE') {
          //   await storename.clear()
          // }
          for (let i = 0; i < value.length; i++) {
            let id = await storename.put(value[i])
            // console.log(`added ${storename.name} with id ${id}`)
          }
          // xdata.metaStore.saveData(name)
        } else {
          await storename.clear()
        }
      }).then(async () => {
        console.log(`added ${storename.name}`)
        await xdata.metaStore.saveData(name, value)
        xdata.metaStore.handleTable(name.slice(4), value)
        // if (self.storeForceData) {
        //   self.forceData.set(name, true)
        //   xbus.trigger('PROGRESS-BAR')
        // }
        // if (self.forceData.size >= this.rows.length) {
        //   self.storeForceData = false
        // }
      }).catch(e => {
        console.warn(`更新元数据${name}失败`)
      })
    }
  }

  progressBar(name) {
    let self = this
    if (self.storeForceData) {
      self.forceData.set(name, true)
      xbus.trigger('PROGRESS-BAR')
    }
    if (self.forceData.size >= this.rows.length) {
      self.storeForceData = false
    }
  }

  async deleteAssignData(storename, key) {
    this.db[storename] && await this.db[storename].delete(key)
    let name = storename.slice(4)
    xdata.metaStore.data[name] && xdata.metaStore.data[name].delete(key)
    if (/staff/g.test(storename) || /vehicle/g.test(storename)) {
      let sname = /staff/g.test(storename) ? 'staffs' : 'vehicles'
      xdata.metaStore[sname].delete(key)
    }
    // await xdata.metaStore.saveData(storename) // 等待删除之后，更新metaStore
    // xdata.metaStore.handleTable(storename.slice(4))
  }
}
