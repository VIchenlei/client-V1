export default class StatsStore {
  constructor (gstore) {
    this.gstore = gstore
    // this.stats = {total: 0, vehicle: 0, staff: 0} // init value : 0
    this.perStats = new Map()

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    xbus.on('COUNTING-UPDATE', (msg) => {
      self.perStats = msg.data

      // debugger
      // self.stats = msg.stat

      xbus.trigger('COUNTING-UPDATED') // inform to refresh the counting UI
    })

    // xbus.on('ALARM-DETAIL-COUNT', (msg) => {
    //   console.log(msg)
    // })
  }

  getStats () {
    return this.stats
  }

  getDataOfMap (mapID, type) {  // type : areas or depts
    let ret = null
    let maps = this.stats.maps
    for (let i = 0, length = maps.length; i < length; i++) {
      if (maps[i].id === mapID) {
        ret = maps[i][type]
        break
      }
    }

    return ret
  }
}
