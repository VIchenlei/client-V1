// TODO: 为了未来能扩展，比如增加除 reader 和 card 外的其他 CALL 对象，需要更改消息定义。
// targets: [{type: card/reader/..., id: xx, subtype: xxx, ...}]

/**
CREATE TABLE `his_call` (
 `call_id` int(11) NOT NULL AUTO_INCREMENT,
 `user_id` varchar(32) COLLATE utf8_bin NOT NULL,
 `call_time_out` int(11) NOT NULL DEFAULT 5,
 `call_type_id` int(11) NOT NULL DEFAULT 0,
 `stations` varchar(256) COLLATE utf8_bin DEFAULT NULL,
 `cards` varchar(256) COLLATE utf8_bin DEFAULT NULL,
 `call_start_time` datetime DEFAULT NULL,
 `call_stop_time` datetime DEFAULT NULL,
 `call_stop_by` char(16) COLLATE utf8_bin DEFAULT NULL,
 PRIMARY KEY (`call_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_bin
 */

import { delay } from '../utils/utils.js'

const CALL_TIME_OUT = 5  // 默认的 call 超时，单位 ： 分钟

// const CS_CALLING = 0
export default class CallStore {
  constructor (gstore) {
    this.gstore = gstore // global store

    this.callInstructs = new Map()
    this.callcardList = new Map()
    this.selfcallCardList = new Map()

    this.callingCards = new Map()
    this.callingStations = new Map()
    this.states = new Map()

    this.stats = { // 各种CALL状态的统计
      calling: 0,
      timeout: 0,
      canceled: 0
    }

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    xbus.on('CALL-CARD-LIST', (msg) => {
      // let message = JSON.parse(msg)
      // console.log('采集推送的呼叫msg',msg)
      msg = msg.filter(item => {
          if(item[1] != 0){
            let state = xdata.metaStore.needDisplay(item[1])
            return state
          }else{
            return true
          }
      })

      msg = msg.filter(item => {
        if(item[1] != 0){
          let state = xdata.metaStore.filterDept(item[1])
          return state
        }else{
          return true
        }
      })


      self.callcardList.clear()
      let mySelf = xdata.userName
      for (let i = 0, len = msg.length; i < len; i++) {
        let row = msg[i]
        let key = row[2] ? row[0] + '-' + row[2] : row[0] + '-' + row[1]
        let obj = row[2] ? row[2] : xdata.metaStore.getCardBindObjectInfo(row[1])
        let isFilter = true
        let isDisplay = true
        if (row[1] != 0) {
          isFilter = xdata.metaStore.needDisplay(row[1])
          isDisplay = xdata.metaStore.filterDept(row[1])
        }
        if (isFilter && isDisplay) {
          obj = obj && obj.name ? obj.name : row[1]
          row.push(obj)
          // if (row[2]) {
          //   row.push(row[2] + '分站')
          // } else {
          //   obj = obj && obj.name ? obj.name : row[1]
          //   row.push(obj)
          // }
          this.states.set(key, row)
          if (row[0] === mySelf && row[5] === 2) {
            self.callcardList.set(key, row)
            row.push('myself')
          } else {
            row.push('')
          }
        }
      }
      xbus.trigger('SHOW-CALL-LIST', (msg))
    })

    xbus.on('START-CALL-REMOTE', (msg) => {
      self.startCall(msg)
      xbus.trigger('BADGE-UPDATE', {name: 'call_indicator', content: this.stats.calling})
    })

    xbus.on('STOP-CALL-REMOTE', (msg) => {
      self.stopCall(msg.callID, 'CANCELED', this.gstore.userName)
      xbus.trigger('BADGE-UPDATE', {name: 'call_indicator', content: this.stats.calling})
    })

    xbus.on('CAll-CARD-REMOVE', (data) => {
      // console.log(data)
      if (data.cards) {
        if (parseInt(data.cards[0].cardid, 10) === 0) {
          self.states.clear()
          self.selfcallCardList.clear()
        } else {
          let cards = data.cards
          let username = data.user_name
          for (let i = 0; i < cards.length; i++) {
            let card = cards[i].cardid
            let key = `${username}-${card}`
            self.states.delete(key)
            self.selfcallCardList.delete(key)
          }
        }
      } else {
        let readers = data.stations
        let userName = data.user_name
        for (let i = 0; i < readers.length; i++) {
          let reader = readers[i].stationid
          let key = `${userName}-${reader}`
          self.states.delete(key)
          self.selfcallCardList.delete(key)
        }
      }
      xbus.trigger('SHOW-CALL-LIST')
    })

    xbus.on('CALL-CARD-CONFIRM', data => {
      if (!data) return
      let datas = this.states && Array.from(this.states.values())
      let cardID = data.card_id
      let isInCallList = datas.find(item => item[1] === cardID)
      if (isInCallList) { // 非全员呼叫
        datas.forEach(item => {
          if (item[1] === cardID) {
            !item[8] && item.push(1)
          }
        })
      } else { // 全员呼叫
        let time = new Date(data.confirm_time).getTime()
        let msg = ['', cardID, , time, , , , , 1]
        this.states.set(`admin-${cardID}`, msg)
      }
      xbus.trigger('SHOW-CALL-LIST')
    })
  }

  startCall (msg) {
    let userName = xdata.userName
    let cmd = 'call_card_start'

    let time = Date.now()
    let callTime = new Date(time).format('yyyy-MM-dd hh:mm:ss')

    let callID = msg.callID
    let cards = msg && msg.cards
    let stations = msg && msg.stations

    let data = {
      'call_type_id': callID,
      'call_time_out': CALL_TIME_OUT, // 呼叫时长，单位分钟
      'call_level_id': 0, // 呼叫类型： 0-一般呼叫，1-紧急呼叫
      'user_name': userName,
      'call_time': callTime,
      'stations': stations,
      'cards': cards
    }

    let instruct = {
      cmd: cmd,
      data: data
    }

    this.doCall(instruct)

    this.addCallingCards(cards)
    this.addCallingStations(stations)
  }

  addCallingCards (cards) {
    cards && cards.forEach(card => {
      this.callingCards.set(card.cardid, card)
    })
  }

  removeCallingCards (cards) {
    cards && cards.forEach(card => {
      this.callingCards.delete(card.cardid)
    })
  }

  addCallingStations (stations) {
    stations && stations.forEach(station => {
      this.callingStations.set(stations.cardid, station)
    })
  }

  removeCallingStations (stations) {
    stations && stations.forEach(station => {
      this.callingStations.delete(station.cardid)
    })
  }

  doCall (instruct) {
    xbus.trigger('CALL-REMOTE', instruct)

    // let instructKey = instruct.data.user_name + '-' + instruct.data.call_time
    instruct.data.state = 'CALLING'
    this.callInstructs.set(instruct.data.call_id, instruct)

    // // 以超时时间为 key，保存指令
    // let ms = parseInt(instruct.call_time_out, 10) * 60 * 1000
    // let timeout = new Date(instruct.call_time).getTime() + ms
    // this.calling.set(timeout, instruct)
    // this.setCallTimeout(ms)

    let ms = parseInt(instruct.data.call_time_out, 10) * 60 * 1000
    delay(ms).then(() => {
      // console.log('Call canceled for timeout.')
      if (instruct.data.state === 'CALLING') {
        this.stopCall(instruct, 'TIMEOUT', 'SYSTEM')
        xbus.trigger('CALL-TIMEOUT', instruct)
        xbus.trigger('BADGE-UPDATE', {name: 'call_indicator', content: this.stats.calling})
      }
    })

    this.stats.calling++
  }

  stopCall (callID, state, by) {
    // let instructKey = instruct.data.user_name + '-' + instruct.data.call_time

    let callInstruct = this.callInstructs.get(callID) // saved instruct
    if (callInstruct && callInstruct.data.state === 'CALLING') {
      let time = new Date().format('yyyy-MM-dd hh:mm:ss')
      callInstruct.data.state = state   // 终止原因：到时终止？ 人为取消？
      callInstruct.data.stopBy = this.gstore.userName
      callInstruct.data.stopAt = time

      this.stats.calling--
      switch (state) {
        case 'TIMEOUT':
          this.stats.timeout++
          break
        case 'CANCELED':
          this.stats.canceled++
          break
      }

      let msg = {
        cmd: 'call_card_cancel',
        data: {
          'call_type_id': callID,
          'user_name': this.gstore.userName,
          'call_time': time,
          'stations': callInstruct.data.stations,
          'cards': callInstruct.data.cards
        }
      }
      xbus.trigger('CALL-REMOTE', msg)

      this.addCallingCards(callInstruct.data.cards)
      this.addCallingStations(callInstruct.data.stations)
    }
  }

  // TODO 查询一个 card 当前是不是正在被 CALL： state === CALLING
  isCalling (callID) {
    let instruct = this.callInstructs.get(callID)
    return instruct && instruct.data.state === 'CALLING'
  }
}
