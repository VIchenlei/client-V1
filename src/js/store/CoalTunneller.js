export default class CoalTunneller {
  constructor (gstore) {
    this.gstore = gstore

    this.coal = new Map() // 综采面
    this.tunneller = new Map() // 掘进面
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    xbus.on('COAL-CUTTING-START', (msg) => {
      for (let i = 0, len = msg.length; i < len; i++) {
        let row = msg[i]
        let key = row[0]
        self.coal.set(key, row)
      }
      xbus.trigger('COAL-CUTTING-LIST', msg)
    })

    xbus.on('TUNNELLER-STAT-START', (msg) => {
      for (let i = 0, len = msg.length; i < len; i++) {
        let row = msg[i]
        let key = row[0]
        self.tunneller.set(key, row)
      }
      xbus.trigger('TUNNELLER-STAT-LIST', msg)
    })
  }
}
