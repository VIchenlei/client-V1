import io from 'socket.io-client' // eslint-disable-line
import {
  EVT,
  CMD
} from './Protocol.js'
import {
  toJson
} from './utils/utils.js'

this.pcFlag = window.isPC

let callbackcount = 0

const url = window.location.host
// const url = 'http://60.220.238.150:8086'
// const url = 'http://local.beijingyongan.com:9000'

const connectionOpts = {
  // "force new connection": true,
  'reconnectionAttempts': 'Infinity', // avoid having user reconnect manually in order to prevent dead clients after a server restart
  'timeout': 10000, // 10s, before connect_error and connect_timeout are emitted.
  'transports': ['websocket']
}
export default class Socket {
  constructor() {
    console.log('Init websocket. The url is: ', url)
    this.socket = io(url, connectionOpts)
    window.xsocket = this.socket

    this.allData = null //暂存resp_all_data数据

    this.registerSocketEventHandlers()
    this.registerGlobalEventHandlers()
  }

  getConnection(timeout) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        console.log('Socket.getConnection: Aready connected.')
        resolve(this.socket)
      } else {
        console.log('Socket.getConnection: Socket do NOT connect.')
      }

      // set our own timeout in case the socket ends some other way than what we are listening for
      let timer = setTimeout(function () {
        timer = null
        error('Socket.getConnection: local timeout.')
      }, timeout)

      // common error handler
      function error(data) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        reject(data)
      }

      // success
      this.socket.on('connect', () => {
        clearTimeout(timer)
        resolve(this.socket)
      })

      // errors
      this.socket.on('connect_error', error)
      this.socket.on('connect_timeout', error)
      this.socket.on('error', error)
      this.socket.on('disconnect', (error) => {
        console.log(error)
        xbus.trigger('COLLECTOR-DISCONNECTED')
      })

      // here reconnect to remote
      this.socket.connect() // 这里是异步
    })
  }

  sendMsg(eventName, msg, cb) {
    let socket = this.socket

    // hxtx没有操作数据库、与采集交互的行为
    if (xdata.userName === 'hxtx') return 
    
    if (eventName === 'CALL') {
      if (xdata.roleID !== 1 && xdata.userName !== 'jkz') return window.hintip.open({
        value: 'nochange',
        tip: `您没有本次权限，请联系管理员！`
      })
    }

    msg['username'] = xdata.userName
    let ret = false
    if (socket && socket.connected) {
      cb && cb instanceof Function ? socket.emit(eventName, msg, cb) : socket.emit(eventName, msg)
      ret = true
    } else {
      console.warn('Socket.js : The socket is disconnected.')
      xbus.trigger('FAILED-FOR-NOCONN', {
        eventName: eventName
      })
    }

    return ret
  }

  registerGlobalEventHandlers() {
    let self = this
    xbus.on('MAP-DOWNLOAD-FILE', (msg) => {
      self.getMapFile(msg.filename)
    })

    xbus.on('REPT-FETCH-DATA', (msg) => {
      self.getRept(msg)
    })

    xbus.on('FADE-READER-DATA', (msg) => {
      self.getFadeReader(msg)
    })


    xbus.on('REPT-FETCH-DATA-COLUMN', (msg) => {
      self.getReptColumn(msg)
    })

    xbus.on('REPT-FETCH-DATA-STAFF', (msg) => {
      self.getStaffData(msg)
    })

    xbus.on('HISTORY-FETCH-DATA', (msg) => {
      // console.log('HISTORY-FETCH-DATA', msg)
      self.getData(msg)
    })

    xbus.on('REPT-FETCH-DATA-UPDATE-TABLE', (msg) => {
      self.getReptToTable(msg)
    })

    xbus.on('REPT-FETCH-FILE', (msg) => {
      self.getReptToFile(msg)
    })

    xbus.on('META-UPDATE-DB', (msg) => {
      self.getMetaResult(msg)
      // self.sendMsg('META', msg.req)
    })

    xbus.on('CALL-REMOTE', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('CALL-CARD-START', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('ALARM-DONE-REQ', (msg) => {
      self.sendMsg(EVT.ALARM, msg)
    })

    xbus.on('RECOVER-ALARM', (msg) => {
      self.sendMsg(EVT.ALARM, msg)
    })

    xbus.on('AFRESH-METADATA', (msg) => {
      self.sendMsg('META', msg)
    })

    xbus.on('HELPME-DONE-REQ', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('HELP-ME-CONFIRM', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('GAS-DONE-REQ', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('DEVICE-TYPE-CHANGE', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('DRIVINGFACE-REQ-DATA', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('LIGHT-CONTROL-REQ', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('REQ_ALL_DATA_START', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('REQ-PERSON-ONCAR', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('SERVER-TIME', () => {
      self.sendMsg(EVT.TIME)
    })

    xbus.on('SHOW-ALARM-PER-DETAIL', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('MAN-CONTROL-UPMINE', (msg) => {
      self.sendMsg(EVT.CALL, msg)
    })

    xbus.on('PULL-DOWN-METADATA', (msg) => {
      self.sendMsg(EVT.META, msg)
    })

    xbus.on('GET-ALL-DATA', (msg) => {
      self.sendMsg(EVT.ALL, msg)
    })

    xbus.on('DELETE-PIC', (msg) => {
      self.sendMsg(EVT.FILE, msg)
    })

    xbus.on('YA-MANAGER', msg => {
      self.sendMsg('MANAGER', msg)
    })

    xbus.on('SEND-MANAGER-MSG', msg => {
      self.sendMsg('MANAGER', msg)
    })

    xbus.on('GET-NET-IP', () => {
      self.sendMsg('NETIP', {})
    })

    xbus.on('PULL-IMPORT-FILE', (msg) => {
      self.sendMsg('PULLMSG', {
        cmd: 'pull-msg',
        data: {
          tablename: msg
        }
      })
    })
  }

  getMetaResult(msg) {
    // let metaKey = `${xdata.userName}-${new Date().getTime()}-${msg.req.data.name}`
    let metaKey = `${xdata.userName}-${++callbackcount}-${msg.req.data.name}`
    msg.req['key'] = metaKey
    msg.req['username'] = xdata.userName
    this.sendMsg('META', msg.req, (res) => {
      let key = res.key
      if (key === metaKey) {
        xbus.trigger('META-UPDATE-DB-RES', res)
      }
    })
  }

  getRept(msg) {
    let queryKey = `${xdata.userName}-${++callbackcount}-${msg.def.name}`
    // console.log('queryKey', queryKey)    
    msg.req['key'] = queryKey
    // msg.req['username'] = xdata.userName
    this.sendMsg('REPT', msg.req, (res) => {
      let key = res.key
      // console.log('serverKey', key)
      if (key === queryKey) {
        let ds = {
          def: msg.def,
          monthTime: msg.monthTime,
          rows: res.data,
          total: res.total,
          pageIndex: res.pageIndex
        }
        // console.log('Got report response. dataset : ', ds)
        xbus.trigger('REPT-SHOW-RESULT', ds)
      }
    })
  }

  getFadeReader (msg) {
    this.sendMsg('FADE', msg.req, (res) => {
      console.log('盲区数据', JSON.stringify(res))
      // if (res.length == 0) {
        // window.hintip.open({
        //   value: 'failure',
        //   tip: '无该分站盲区数据'
        // })
      //   window.xhint.close()
      //   return 
      // }
      let ds = {
        def: msg.def,
        rows: res
      }
      xbus.trigger('FADE-READER-DATA-RESULT', ds)
    })
  }


  getReptColumn(msg) {
    this.sendMsg('REPT', msg.req, (res) => {
      let ds = {
        def: msg.def,
        rows: res.data,
        total: res.total,
        pageIndex: res.pageIndex
      }
      xbus.trigger('REPT-SHOW-RESULT-COLUMN', ds)
    })
  }

  getStaffData(msg) {
    this.sendMsg('REPT', msg.req, (res) => {
      let ds = {
        def: msg.def,
        rows: res.data,
        total: res.total,
        pageIndex: res.pageIndex
      }
      xbus.trigger('REPT-SHOW-RESULT-STAFF', ds)
    })
  }

  getData(msg) {
    this.sendMsg('REPT', msg.req, (res) => {
      // console.log(res)
      // console.log(msg)
      let ds = {
        def: msg.def,
        cmd: res.cmd,
        segmentIndex: msg.req.startSegementIndex,
        segementOffset: msg.req.segementOffset,
        rows: res.data
      }
      xbus.trigger('HISTORY-DATA-RESULT', ds)
    })
  }

  getReptToTable(msg) {
    this.sendMsg('REPT', msg.req, (res) => {
      let ds = {
        def: msg.def,
        rows: res.data,
        total: res.total,
        pageIndex: res.pageIndex
      }
      // console.log('Got report response. dataset : ', ds)
      xbus.trigger('REPT-SHOW-RESULT-TABLE', ds)
    })
  }

  getReptToFile(msg) {
    // msg['username'] = xdata.userName
    this.sendMsg('REPT', msg, (res) => {
      if (res.code !== 0) {
        console.warn('导出文件失败：', res.msg)

        window.xhint.close()
        return
      }
      window.xhint.close()

      switch (res.data.fileType) {
        case 'csv':
        case 'pdf':
        case 'xlsx':
          let self = this
          let link = document.createElement('a')
          let absoluteUrl = self.getAbsoluteUrl(res.data.url)
          link.setAttribute('href', absoluteUrl)
          link.setAttribute('target', '_blank')
          console.log('absoluteUrl', absoluteUrl)
          link.setAttribute('download', res.data.name)
          // link.click()
          window.setTimeout(function () { // 标签还未创建完成或者服务器文件还未生成！
            // console.log('Got report response. dataset : ', ds)
            link.click()
          }, 2000)
          break
        case 'printPDF':
          /*
            let printFrame = document.createElement('iframe')
            printFrame.setAttribute('src', res.data.url)
            // printFrame.setAttribute('href', res.data.url)
            printFrame.setAttribute('style', 'display:none')
            document.getElementsByTagName('body')[0].appendChild(printFrame)
            let printFrameObject = document.getElementsByTagName('iframe')[0]
            printFrameObject.contentWindow.print()
            document.getElementsByTagName('body')[0].removeChild(printFrame)
          */
          // let printLink = this.getAbsoluteUrl(res.data.url)
          let printURL = this.getAbsoluteUrl(res.data.url)
          let printLink = document.createElement('a')
          // printLink.setAttribute('href', this.getAbsoluteUrl(res.data.url))
          // printLink.setAttribute('target', '_blank')
          printLink.setAttribute('onclick', 'window.open("' + printURL + '")')
          // window.open(printLink)
          // printLink.click()
          window.setTimeout(function () {
            printLink.click()
          }, 2000)

          break
      }
      window.xhint.close()
    })
  }

  getAbsoluteUrl(url) {
    let a = document.createElement('a')
    a.href = url
    url = a.href
    return url
  }

  getMapFile(filename) {
    this.sendMsg(EVT.FILE, {
      cmd: CMD.FILE.DOWNLOAD,
      data: {
        name: filename,
        type: 'map'
      }
    })
  }

  getMetadata(name) {
    this.sendMsg(EVT.META, {
      cmd: CMD.META.DATA,
      data: {
        name: name
      }
    })
  }

  getMetadataDef() {
    this.sendMsg(EVT.META, {
      cmd: CMD.META.META_DEF,
      data: {}
    })
  }

  dealAllData(data) {
    if (!this.respAllData) {
      this.respAllData = !this.respAllData
      for (let i = 0; i < data.length; i++) {
        let row = data[i]
        row = JSON.parse(row)

        switch (row.cmd) {
          case 'pos_map':
            xbus.trigger('POS-ALL-DATA', row)
            break
          case 'special_area_up_mine':
            xbus.trigger('RESP-ALL-DATA', row)
            break
          case 'event':
            xbus.trigger('ALARM-UPDATE', row)
            break
          case 'callcardlist':
          case 'call_card_resp':
            xbus.trigger('CALL-CARD-LIST', row.data)
            break
          case 'tunneller_stat':
            xbus.trigger('TUNNELLER-STAT-START', row.data)
            break
          case 'coal_cutting':
            xbus.trigger('COAL-CUTTING-START', row.data)
            break
          case 'leader_arrange':
            xbus.trigger('CURRENT-LEADER-ARRANGE', row.data)
            break
          case 'light_state':
            xbus.trigger('TRAFFIC-LIGHTS-STATE', row.data)
            break
        }
      }
    }
  }

  // sendCall (msg) {
  //   this.socket.emit(EVT.CALL, msg)
  // }
  //
  // sendHelpme (msg) {
  //   this.socket.emit(EVT.HELP, msg)
  // }

  // // for test
  // editPath () {
  //   console.log('send editpath. ')
  //   this.sendCall('editpath', {
  //     pathID: 1,
  //     editType: 0
  //   })
  // }

  updateLastPushTime() {
    xdata.lastUpdate = Date.now()
    xbus.trigger('LAST-UPDATE')
  }

  /**
   * 注册网络消息事件的处理器
   *
   * @method registerSocketEventHandlers
   *
   */
  registerSocketEventHandlers() {
    // Fired upon connecting.
    this.socket.on('connect', () => {
      console.log('Socket connected')
      let ctime = (new Date()).format('hh:mm:ss')

      xbus.trigger('NETWORK-STATUS-CHANGE', {
        connected: true,
        lastChangeTime: ctime
      })
    })

    // Fired upon a disconnection.
    this.socket.on('disconnect', () => {
      console.warn('Socket disconnected by remote.')
      let ctime = (new Date()).format('hh:mm:ss')

      xbus.trigger('NETWORK-STATUS-CHANGE', {
        connected: false,
        lastChangeTime: ctime
      })
    })

    // Fired upon an attempt to reconnect.
    this.socket.on('reconnecting', function (number) {
      console.log('Trying to reconnect to the server... ', number)
    })

    // Fired upon a successful reconnection.
    this.socket.on('reconnect', function (number) {
      console.log('Reconnect succeed : ', number)
      // let maptype = xdata.maptype
      xdata.reconnect = true
      xdata.cardStore.prescards.clear()
      // if (maptype === 'HISTORY') {
      //   xbus.trigger('USER', {
      //     cmd: 'STANDBY',
      //     op: 'enter'
      //   })
      //   console.log('Send change room request: ' + 'enter' + ' standby room.')
      // }
    })

    // Fired upon a connection error
    this.socket.on('error', function (error) {
      console.warn('Connection error : ', error)
    })

    // ---------- biz logic -----------

    this.socket.on(EVT.META, (res) => {
      // this.updateLastPushTime()

      let cmd = res.cmd

      switch (cmd) {
        case CMD.META.META_DEF:
          xbus.trigger('META-DEF', res)
          break
        case CMD.META.CARD_DEF:
          xbus.trigger('CARD-STATE-DEF', res)
          break
        case CMD.META.DATA:
          xbus.trigger('META-DATA', res)
          break
        case CMD.META.UPDATE:
          xbus.trigger('META-UPDATE-DB-RES', res) // deal with in meta-dialog
          break
        case CMD.META.PULL_ALL:
          xbus.trigger('ALL-DATA-HAS-PULL', res)
          break
        default:
          console.warn(`未知的 META 指令：cmd = ${cmd}`)
          break
      }
    })

    this.socket.on(EVT.FILE, (res) => {
      // this.updateLastPushTime()

      let cmd = res.cmd
      let data = toJson(res.data)
      switch (cmd) {
        case 'download':
          console.log('download map file done.', res.code)
          if (res.code === 0) {
            xbus.trigger('MAP-FILE-DOWNLOADED', {
              filename: res.data.name,
              filedata: res.data.data
            })
          } else if (res.code === -1) {
            // let mapPath = xdata.metaStore.data['map'].get(5).path
            let mapPath = xdata.metaStore.data['map']
            if (!mapPath) {
              let div = document.createElement('div')
              document.querySelector('.mapcontainer').append(div)
              div.innerText = '下载地图失败，请刷新页面或联系管理员！'
              div.style.textAlign = 'center'
              div.style.position = 'absolute'
              div.style.top = '40%'
              if (document.body.clientWidth < 800) {
                div.style.left = '12%'
              } else if (document.body.clientWidth > 800) {
                div.style.left = '40%'
              }
            }
          } else {
            console.warn(`获取地图文件${res.data.name}失败。`)
            // xbus.trigger('MAP-SHOW-LIST')
            document.querySelector('.page-head').classList.remove('hide')
            document.querySelector('.page-foot').classList.remove('hide')
          }
          break
        case 'upload_more':
          xbus.trigger('FILE-UPLOAD-MORE', data)
          // dialog.uploadChunk(data)
          break
        case 'upload_done':
          xbus.trigger('FILE-UPLOAD-DONE', data)
          // dialog.uploadDone(data)
          break
        default:
          console.warn(`未知的文件上传指令：cmd = ${cmd}`)
          break
      }
    })

    /**
     * 处理 PUSH 消息。
     * PUSH 消息来自采集服务器，由 WebServer 转发。
     *
     * @method
     *
     * @param  {[type]} res) {                   console.log(JSON.stringify(res))    } [description]
     *
     * @return {[type]}      [description]
     */
    this.socket.on(EVT.PUSH, (ress) => {
      let res = toJson(ress)
      if (!res) {
        console.warn('PUSH null message.')
        return
      }
      let cmd = res.cmd
      let data = res.data // res.data could be string
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (error) {
          console.warn('CAN NOT parse the PUSHed JSON data: ', data)
          return
        }
      }
      if (!xdata.metaStore.firstPull) {
        if (cmd === 'resp_all_data') this.allData = data
        return
      }
      if (cmd === 'pos_map' && xdata.maptype === 'HISTORY') return

      if (this.allData) {
        this.dealAllData(this.allData)
        this.allData = null
      }

      switch (cmd) {
        case 'THREE-RATE-DATA':
          console.log(data)
          break
        case 'counting':
          xbus.trigger('COUNTING-UPDATE', {
            data: data
          })
          break
        case 'event':
          // console.log(data)
          xbus.trigger('ALARM-UPDATE', {
            data: data
          })
          break

        case 'positon_all': // when login, push all the cards under well
          xbus.trigger('CARD-UPDATE-POS', data)
          break
        case 'pos_map':
          xbus.trigger('CARD-UPDATE-POS', data)
          xbus.trigger('COLLECTOR-STATUS-LOGIN')
          this.updateLastPushTime()
          break

        case 'down_mine':
          xbus.trigger('CARD-ADD-CARD', data)
          break
        case 'up_mine':
          console.log('up_mine', data)
          xbus.trigger('CARD-REMOVE-CARD', data)
          break
        case 'coal_cutting':
          xbus.trigger('COAL-CUTTING-START', data)
          break
        case 'tunneller_stat':
          xbus.trigger('TUNNELLER-STAT-START', data)
          break
        case 'special_area_up_mine':
          xbus.trigger('CARD-REMOVE-ICON', data)
          break
        case 'device_state':
          xbus.trigger('DEVICE-UPDATE-STATE', data)
          break
        case 'callcardlist':
        case 'call_card_resp':
          xbus.trigger('CALL-CARD-LIST', data)
          break
        // 呼叫确认
        case 'call_confirm':
          xbus.trigger('CALL-CARD-CONFIRM', data)
          break
        case 'call_card_cancel_resp':
          xbus.trigger('CAll-CARD-REMOVE', data)
          break
        case 'light_ctrl_rsp':
          xbus.trigger('DEVICE-CHANGE-STATE', data)
          break

        case 'count_detail_resp':
          xbus.trigger('ALARM-DETAIL-COUNT', data)
          break

        case 'alarm_done':
          // console.log('Got remote ALARM-DONE. \n', res)
          // xbus.trigger('ALARM-DONE', res)
          xbus.trigger('ALARM-UPDATE', {
            data: Array.isArray(data) ? data : [data]
          })
          break

        case 'helpme_done':
          // console.log('Got remote HELPME-DONE. \n', res)
          xbus.trigger('HELPME-DONE', res)
          break

        case 'gas_done':
          // console.log('Got remote HELPME-DONE. \n', res)
          xbus.trigger('GAS-DONE', res)
          break

        case 'leader_arrange':
          xbus.trigger('CURRENT-LEADER-ARRANGE', data)
          break

        case 'collector_status':
          // console.log('Got remote collector-status. \n', res)
          xbus.trigger('COLLECTOR-STATUS', res)
          this.updateLastPushTime()
          break

        case 'deal_hand_up_res':
          xbus.trigger('DRAG-HANDUP-CARD-RES', data)
          break

        case 'nosignal_staffs':
          xbus.trigger('CARD-NOSIGNAL', data)
          break

        case 'net_ip_resp':
          console.log(data)
          xbus.trigger('NET-RESPONSE', data)
          break

        case 'resp_all_data':
          if (!this.respAllData) {
            this.respAllData = !this.respAllData
            for (let i = 0; i < data.length; i++) {
              let row = data[i]

              switch (row.cmd) {
                case 'pos_map':
                  xbus.trigger('POS-ALL-DATA', row)
                  break
                case 'special_area_up_mine':
                  xbus.trigger('RESP-ALL-DATA', row)
                  break
                case 'event':
                  // console.log(row)
                  xbus.trigger('ALARM-UPDATE', row)
                  break
                case 'callcardlist':
                case 'call_card_resp':
                  xbus.trigger('CALL-CARD-LIST', row.data)
                  break
                case 'tunneller_stat':
                  xbus.trigger('TUNNELLER-STAT-START', row.data)
                  break
                case 'coal_cutting':
                  xbus.trigger('COAL-CUTTING-START', row.data)
                  break
                case 'leader_arrange':
                  xbus.trigger('CURRENT-LEADER-ARRANGE', row.data)
                  break
                case 'light_state':
                  xbus.trigger('TRAFFIC-LIGHTS-STATE', row.data)
                  break
              }
            }
          }
          break
        case 'light_state':
          xbus.trigger('TRAFFIC-LIGHTS-STATE', data)
          break
        case 'time':
          xbus.trigger('SERVER-DRIVER-TIME', res)
          break
        case 'environmental_data':
          xbus.trigger('ENVIRONMENTAL-DATA-START', data)
          break
        case 'person_on_car':
          xbus.trigger('PERSON-ON-CAR', data)
          break
        case 'resp_all_person_on_car':
          xbus.trigger('RESP-PERSON-ONCAR', data)
          break
        case 'vehicle_state':
          xbus.trigger('CHANGE-WORKFACE-VEHICLE', data)
          break
        case CMD.META.DATA:
          xbus.trigger('META-DATA', res)
          break
        case 'alarm_done_resp':
        case 'recover_alarm_resp':
          window.hintip.open({
            value: 'success',
            tip: data
          })
          break
        default:
          // console.log('res--------',res)
          // console.warn(`未知的 PUSH 消息指令：cmd = ${cmd}`)
          break
      }
    })
  }
}
