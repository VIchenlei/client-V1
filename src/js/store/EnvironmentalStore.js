export default class EnvironmentalStore {
    constructor (gstore) {
      this.gstore = gstore
  
      this.environmentalData = new Map() 
      this.registerGlobalEventHandlers()
    }
  
    registerGlobalEventHandlers () {
      let self = this
  
      xbus.on('ENVIRONMENTAL-DATA-START', (msg) => {
        for (let i = 0, len = msg.length; i < len; i++) {
          let row = msg[i]
          let key = row.id
          self.environmentalData.set(key, row.data)
        }
        xbus.trigger('ENVIRONMENTAL-DATA-UPDATE')
      })
    }
  }
  