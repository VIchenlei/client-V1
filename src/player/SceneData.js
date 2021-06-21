const SEG_SIZE = 300 * 1000 // 一个数据单元的长度

export default class SceneData {
  constructor () {
    console.log('init SceneData')
  }

    // ------------------ fetch data start

  getHisTime (time) {
    let date = new Date(time)

    let month = date.getMonth() + 1
    let day = date.getDate()
    let year = date.getFullYear()
    var dd = date.getDate()
    var hours = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()
    var minutes = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()
    var seconds = date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds()

    dd = year + '/' + month + '/' + dd + ' ' + hours + ':' + minutes + ':' + seconds
    this.VehicleCur_time = dd
    return this.VehicleCur_time
  }

  checkSegement (time, controlCmd, type, n) {
    let segmentIndex = xdata.historyStore.segmentIndex

    if (segmentIndex.length === 0) {
      return
    }

    let segment = xdata.historyStore.segment
    let startTime = (new Date(xdata.historyStore.sceneInfo.startTime)).getTime()
    let duration = xdata.historyStore.sceneInfo.duration

    let timeOffset = time
    let index = Math.floor(timeOffset / SEG_SIZE)
    let tipsForSegement = [false, false]

    if (controlCmd === 'jump') {
      tipsForSegement[0] = xdata.historyStore.isPreloaded(index)
      tipsForSegement[1] = index + 1 >= xdata.historyStore.segmentIndex.length ? null : xdata.historyStore.isPreloaded(index + 1)
      if (tipsForSegement[0] === false) {
        if (tipsForSegement[1] === false) {
          this.pullSegement(index, controlCmd, type, n)
        } else {
          this.pullSegement(index, controlCmd, type, 0)
        }
      } else {
        if (tipsForSegement[1] === false) {
          this.pullSegement(index + 1, controlCmd, type, 0)
        } else {

        }
      }
    } else if (controlCmd === 'play') {
      if (index + 2 >= xdata.historyStore.segmentIndex.length) {

      } else if (xdata.historyStore.isPreloaded(index + 2)) {

      } else {
        this.pullSegement(index + 2, controlCmd, type, n)
      }
    }
  }

  getSegementData (time) {
    return xdata.historyStore.getSegementData(time)
  }

  pullSegement (index, controlCmd, type, n) {
    this.isDataLoaded = false

    let b = xdata.historyStore.sceneInfo
    let msg = {
      cmd: 'historyData',
      type: type,
      mapID: b.mapID,
      cards: b.cards,
      startTime: b.startTime, // this.startTime,
      endTime: b.endTime, // this.endTime,
      startSegementIndex: index,
      segementCount: b.segementCount,
      cur_time: b.cur_time,
      segementOffset: n
    }

    xbus.trigger('HISTORY-FETCH-DATA', {
      req: msg,
      def: {
        name: type === 'scene' ? 'HistoryScene' : 'HistoryTrack'
      }
    })
  }
}
