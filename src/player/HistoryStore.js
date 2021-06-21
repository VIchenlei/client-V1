const SEG_SIZE = 300 * 1000 // 每次拉取指定时间长度的数据： 300s, 5分钟

export default class HistoryStore {
  constructor (gstore) {
    this.gstore = gstore

    this.segmentIndex = []
    this.segment = []
    this.sceneInfo = {}
    this.cards = []
    this.loadIndex = new Map()
    this.trackData = new Map()

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {

  }

  initSegementIndex (startTime, endTime, mapID, cards, currentTime) {
    let duration = new Date(endTime) - new Date(startTime) // ms
    // let n = (duration - (duration % SEG_SIZE)) / SEG_SIZE + (duration % SEG_SIZE ? 1 : 0)
    let n = Math.ceil((duration / SEG_SIZE))

    this.sceneInfo.duration = duration
    this.sceneInfo.startTime = startTime
    this.sceneInfo.endTime = endTime
    this.sceneInfo.segementCount = n
    this.sceneInfo.mapID = mapID
    this.sceneInfo.cards = cards
    this.sceneInfo.cur_time = currentTime

    for (let i = 0; i < n; i++) {
      this.segmentIndex[i] = {
        index: -1, // 初始化为-1
        preloaded: false
      }
    }
  }

  setSegment (i, data) { // i为第i段数据
    if (this.segmentIndex && this.segmentIndex[i]) {
      this.segmentIndex[i].index = this.segment.push(data) - 1
      this.segmentIndex[i].preloaded = true
    }
  }

  clearSegement () {
    this.segmentIndex = this.segmentIndex.slice(0, 0)
    this.segment = this.segment.slice(0, 0)
    this.sceneInfo = {}
    this.cards = []
  }

  clearCardsList () {
    this.cards = []
  }

  getSegementData (timePoint) {
    timePoint = timePoint * 1000
    let timeDistant = timePoint // ms
    let i = Math.floor(timeDistant / SEG_SIZE)
    if (i < this.segmentIndex.length) {
      let index = this.segmentIndex[i].index
      let segment = this.segment[index]
      // if (segment) {
      //   return []
      // }
      // console.log('segment', segment)
      if (segment === undefined || segment.length === 0) {
        return []
      }
      // 在理想条件下，对于track来说，1s必然有1张卡的定位数据，但对于scene来说，1s可能有多张卡的定位数据，故此处先计算上下边界，然后取1个或多个数据，保存到数组中
      let recUpperBoundary = this.checkBoundary(0, segment, timePoint - 1000, 'uppper')
      let recLowBoundary = this.checkBoundary(recUpperBoundary, segment, timePoint, 'low')
      let rows = segment.slice(recUpperBoundary, recLowBoundary)
      return rows
    } else {
      return []
    }
  }

  isPreloaded (index) {
    if (index < this.segmentIndex.length) {
      return this.segmentIndex[index].preloaded
    }
  }

  checkBoundary (UpperBoundary, segment, timePoint, type) {
    let timePointStart = (new Date(this.sceneInfo.startTime)).getTime()
    let timePointCurTime = null
    // let i = null
    for (let i = UpperBoundary, len = segment.length; i < len; i++) {
      timePointCurTime = (new Date(segment[i].cur_time)).getTime()
      let tip = (UpperBoundary === 0 ? timePointStart + timePoint <= timePointCurTime : timePointStart + timePoint < timePointCurTime)
      if (tip) {
        return i
      }
    }
  }

  /*
  binaryChop (segment, timePoint) { // 二分查找
    let start = 0
    let end = segment.length - 1
    let middle = Math.round((end - start) / 2)

    while (end > start) {
      let timePointMiddle = (new Date(segment[middle].cur_time)).getTime()
      let timePointStart = (new Date(segment[0].cur_time)).getTime()
      let timeOffset = (timePointMiddle - timePointStart) - (timePointMiddle - timePointStart) % 1000
      if (timeOffset > timePoint) {
        end = middle
      } else if (timeOffset < timePoint) {
        start = middle
      } else {
        return middle
      }
      middle = Math.round((end - start) / 2)
    }
  }
  */
}
