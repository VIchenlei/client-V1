import { CARD } from '../js/def/state.js'
import SceneData from './SceneData.js'

const INIT_SPEED = 60
const TICK_LENGTH = 1000  // 一个 tick 的时间长度，单位 ms
let card = ['', 2, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0] // 卡实时记录模板

export default class Ticker {
  constructor (player, map, ctrl) {
    // this.Track()
    this.player = player
    this.map = player.map
    this.ctrl = player.ctrl

    // 定时器
    this.timer = -1

    // this.isDataLoaded = false

    this.data = null
    this.previewCursor = null
    this.trackTime = null
    this.SceneData = new SceneData(this)
    this.speed = INIT_SPEED

    this.startTime = -1  // 轨迹开始时间，单位：ms
    this.endTime = -1    // 轨迹结束时间，单位：ms

    this.tick = -1  // 每秒一个 tick，启动时设置 tick = 0，elapsedTime = tick
    this.totalTick = 0  // 轨迹总秒数（本系统定义每秒一个 tick），即：(endTime - startTime) / 1000
  }

  initTrack (opts) {

    this.mapID = opts.mapID || 5 // eg: 1, 2, ...
    this.mapType = opts.type || 'HISTORY'   // MONITOR, HISTORY, ...
    this.playCmd = opts.cmd === 'HistoryScene' ? 'scene' : 'track'
    this.data = opts.rows || null

    this.startTime = opts.startTime || 0  // 单位：ms
    this.endTime = opts.endTime || 0      // 单位：ms
    this.realDuration = this.getRealDuration(this.data) / 1000 || 0  // 单位：秒
    this.totalTick = ((new Date(opts.endTime)).getTime() - (new Date(opts.startTime)).getTime()) / 1000 || 0

    this.gotoStartPoint()
    this.drawCardIcon()
  }

  drawCardIcon () {
    if (this.data && this.data.length > 0) {
      let rec = this.buildCardMoveRec(this.data[0], this.data[this.data.length - 1], 'FIRST')
      this.map.drawCardIcon(rec)
    }
  }

  // 轨迹播放起始点
  gotoStartPoint () {
    this.isPlaying = false
    this.speed = this.speed ? this.speed : INIT_SPEED

    this.updateTick(0)
    this.previewCursor = this.getFirstCursor(this.data)
  }

  getSceneDataByTick () {
    this.SceneData.checkSegement(this.tick * 1000, 'jump', 'scene', 1)
    let row = this.SceneData.getSegementData(this.tick)
    // console.log('row', row)
    for (let i = 0,len = row.length; i < len; i++) {
      let rec = this.buildCardMoveRec(row[i])
      this.map.jumpCard(rec, 'jump')
    }
    // let rows = this.getSegementData(this.elapsedTime)
    if (row.length !== 0) {
      let cards = xdata.historyStore.cards
      this.deleteCards(cards)
    }
  }

  gotoHere (percent, type) {
    this.stopTimer()

    let tick = Math.ceil(this.totalTick * percent)
    this.updateTick(tick)

    this.ctrl.jumpTo(tick)

    if (this.playCmd === 'scene') {
      this.getSceneDataByTick()
      if (this.data.length === 0) { // 没有数据时，清空地图
        this.map.cardLayer.vehicleLayerSource.clear()
        this.map.cardLayer.staffLayerSource.clear()
      }
    } else {
      let cursor = this.getCursor(this.data, { index: 0, isMoved: false }, this.trackTime, type)
      if (cursor && cursor.isMoved) {
        this.previewCursor = cursor

        let row = this.data[cursor.index]
        let rec = this.buildCardMoveRec(row)
        this.map.jumpCard(rec, 'jump')
        this.map.updateTrackTime(this.trackTime)
      }
    }
  }

  deleteCards (cards) {
    let msg = {
      cards: cards,
      mapID: this.mapID
    }
    msg && this.map.cardLayer.deleteCardsInHisPlayer(msg)
    xdata.historyStore.clearCardsList()
  }

  // 根据记录，构造起始游标
  getFirstCursor (data) {
    let cursor = null
    if (this.data && this.data.length > 0) {
      cursor = { index: 0, isMoved: true }
    }
    return cursor
  }

  /**
   *  依据数据库记录 row，构造 card 移动记录
  */
  buildCardMoveRec (row, lastRow, state) {
    if (!row) {
      return null
    }
    let rec = [...card]// 不定参数，es6语法

    rec[CARD.card_id] = row.card_id
    rec[CARD.x] = row.x
    rec[CARD.y] = row.y
    rec[CARD.map_id] = row.map_id
    rec[CARD.area_id] = row.area_id
    rec[CARD.state_biz] = 0
    rec[CARD.object_id] = this.getLabel(row.card_id)
    rec[CARD.mark_id] = row.landmark_id
    rec[CARD.mark_direction] = row.direction_mapper_id
    rec[CARD.mark_distance] = row.landmark_dist
    rec[CARD.speed] = (row.speed).toFixed(0)
    rec[CARD.rec_time] = new Date(row.cur_time).getTime()
    rec[CARD.set_move] = 0
    rec[CARD.end_time] = new Date(row.end_time).getTime()
    if (state) {
      this.downTime = new Date(row.cur_time).getTime()
    }
    rec[CARD.down_time] = this.downTime
    if (lastRow) {
      let lastTime = new Date(lastRow.cur_time).getTime()
      let duration = lastTime - rec[CARD.down_time]
      this.workTime = duration
    }
    rec[CARD.work_time] = this.workTime
    // console.log(rec)
    xbus.trigger('HIS-POSITION-DATA', { data: rec })// 每次移动时更新card-tips数据

    return rec
  }

  setSpeed (speed) {
    if(speed === 70){
      this.speed = this.totalTick/60
    }else{
      this.speed = speed
    }
  }

  /**
   * 获取车牌，有车牌就显示车牌，没有就显示卡号
   */
  getLabel (cardID) {
    let obj = xdata.metaStore.getCardBindObjectInfo(cardID)
    let label = obj && obj.name ? obj.name : cardID
    label = obj && obj.group_id === 1 ? obj.name : label
    return label
  }

  getRealDuration (data) {
    let duration = -1
    if (data && data.length > 0) {
      let start = data[0].cur_time
      let end = data[data.length - 1].cur_time

      duration = new Date(end) - new Date(start)  // ms
    }

    return duration
  }

  // 更新 this.tick 和 this.trackTime
  updateTick (tick) {
    this.tick = tick
    this.trackTime = new Date(this.startTime).getTime() + this.tick * 1000
    this.map.updateTrackTime(this.trackTime)
  }

  // ---------------- control operation begin

  // tick 逻辑
  // doTick () {
  //   self.updateTick(self.tick + self.speed)

  //   if (self.tick >= self.totalTick) {
  //     self.tick = self.totalTick
  //     self.stopTimer()
  //   }

  //   self.tickMap()
  //   self.ctrl.doTick(self.tick)
  // }

    // update the map by tick
  tickMap () {
    if (this.playCmd === 'scene') {
      // TODO: put the checkSegment into requestIdleCallback
      this.SceneData.checkSegement(this.tick, 'play', this.playCmd, 0)

      let rows = this.SceneData.getSegementData(this.tick)
      if (rows.length > 0) {
        // this.moveCards(rows)
        xbus.trigger('CARD-MOVE', (rows))
      }
    } else {
      let cursor = this.getCursor(this.data, this.previewCursor, this.trackTime)
      if (cursor && cursor.isMoved) {
        this.previewCursor = cursor

        let row = this.data[cursor.index]
        let rec = this.buildCardMoveRec(row)

        this.map.doTick(rec)
      }
    }
  }

  // 启动播放  timer
  startTimer () {
    // 确保上一个播放器被终止
    if (this.timer >= 0) {
      this.stopTimer()
    }

    let self = this
    this.timer = window.setInterval(() => {
      self.updateTick(self.tick + self.speed)
      if (self.tick >= self.totalTick) {
        self.tick = self.totalTick
        self.stopTimer()
      }

      self.tickMap()
      self.preLoadSceneData()
      self.ctrl.doTick(self.tick)
    }, TICK_LENGTH)

    this.isPlaying = true
  }

  // 仅停止播放 timer，状态都保留
  stopTimer () {
    if (this.timer >= 0) {
      window.clearInterval(this.timer)
      this.timer = -1
      this.isPlaying = false
    }
  }

  preLoadSceneData () { // 场景初始化五分钟没有数据时，继续加载
    let data = this.SceneData.getSegementData(this.tick)
    if (this.playCmd === 'scene' && !data || data.length === 0) {
      this.getSceneDataByTick()
    }
  }

  // 切换 播放、暂停 状态
  togglePlay () {
    // if (this.data && this.data.length > 0) {
    this.isPlaying = !this.isPlaying
    this.isPlaying ? this.startPlay() : this.pausePlay()
  // }
  }

  // 从上次停止的位置开始播放，有可能是首次播放
  startPlay () {
    this.startTimer()
  }

  // 停止播放，并重置播放器状态至初始值
  pausePlay () {
    this.stopTimer()
  }

  // 停止播放，并重置播放器状态至初始值
  stopPlay () {
    this.stopTimer()

    this.gotoStartPoint()
    this.ctrl.initTrack()
    this.map.initTrack()

    if (this.playCmd === 'scene') {
      let cards = xdata.historyStore.cards
      this.deleteCards(cards)
    } else {
      if (this.data && this.data[0]) {
        let row = this.data[0]
        let lastRow = this.data[this.data.length - 1]
        let rec = this.buildCardMoveRec(row, lastRow, 'FIRST')
        this.map.jumpCard(rec, 'stop')
      }
    }

    this.timer = -1
    this.tick = -1
  }
  // ---------------- control operation end

  /**
   * 根据当前 tick 的截止时间，获得当前 tick 周期内的截止游标（index）
   * 播放器时间轴上一个 tick 为 1s，轨迹上的周期为 this.speed * 1s
   * @param {*} rows  轨迹数据，数组
   * @param {*} preCursor  上一条已经走过了的游标
   * @param {*} tick  当前 tick 的结束时间，单位： ms
   */
  getCursor (rows, preCursor, deadline, type) {
    if (!rows) {
      return null
    }

    let count = rows.length
    let i = preCursor.index + 1
    let turnKey = false
    for (; i < count; i++) {
      let row = rows[i]

      let nodeTime = new Date(row.cur_time).getTime()  // ms
      if (nodeTime > deadline) {
        break
      }
    }

    let index = 0
    if (i === count) {  // 到最后一条了。
      index = count - 1
    } else {
      index = i - 1 // when break, index i do NOT included
    }

    let isMoved = true  // 默认在本次 tick 中移动了。
    if (index === preCursor.index) {
      isMoved = false
    }

    return {
      index: index,
      isMoved: isMoved
    }
  }
}
