const DB_NAME = 'YaLocDataInBrowser'
const DB_DEFINE = 'META_DEFINE'
const DB_DATA = 'META_DATA'

export default class OfflineDBStore {
  constructor (gstore) {
    this.gstore = gstore
    this.LocalDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    this.DB = null
    this.storedef = null
    this.storedata = null
    this.isFirstTime = 0
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this
    xbus.on('DB-OPEN', () => {
      self.openDB()
    })
  }

  openDB () {
    if (this.LocalDB) {
      let openRequest = window.indexedDB.open(DB_NAME) // 默认版本号不发生变化
      openRequest.onupgradeneeded = function (evt) { // 第一次打开页面时调用
        let thisDB = evt.target.result
        if (!thisDB.objectStoreNames.contains(DB_DEFINE)) {
          this.storedef = thisDB.createObjectStore(DB_DEFINE, { keyPath: 'id', autoIncrement: true })
        }
        if (!thisDB.objectStoreNames.contains(DB_DATA)) {
          this.storedata = thisDB.createObjectStore(DB_DATA, { keyPath: 'id', autoIncrement: true })
        }
        this.isFirstTime = 1
      }
      openRequest.onerror = function (evt) {
        console.log('Open indexedDB Error')
      }
      openRequest.onsuccess = function (evt) {
        console.log('Open indexedDB Success!')
        console.log(this.storedef)
        console.log(this.storedata)
        let thisDB = evt.target.result
        let msg = {
          FT: this.isFirstTime,
          defStore: this.storedef.name,
          dataStore: this.storedata.name
        }
        this.DB = thisDB
        xbus.trigger('DB-OPEN-RES', msg)
      }
    } else {
      window.alert('您的浏览器不支持indexedDB功能，若想体验indexedDB功能，请更换chrome浏览器')
    }
  }

  initDATA (data, storename) {
    console.log('Adding ' + storename + ' ...')

    let transaction = this.DB.transaction(storename, 'readwrite')

    transaction.oncomplete = function (event) {
      console.log('All done!')
    }
    transaction.onerror = function (evt) {
      console.log('error in transaction')
    }
    let store = transaction.objectStore(storename)
    for (let i = 0; i < data.length; i++) {
      let request = store.add(data[i])
      request.onsuccess = function (evt) {
        console.log('init data' + i)
      }
      request.onerror = function (evt) {
        console.log('data' + i + 'error')
      }
    }
  }
}
