import Socket from '../js/Socket.js'
import {
  EVT,
  CMD
} from '../js/Protocol.js'
import { setCookie, getCookie, delCookie } from '../js/utils/cookie.js'
import {
  saveCredential
} from './Credential'
import graphQuery from '../js/def/graph_query.js'
import {
  getAlarmShow,
  getAccessSql
} from '../js/utils/utils.js'

import '../main/tag/page-main.html'
import '../tags/side-bar.html'
import './tag/modify-pwd.html'
import '../monitor/tag/helpme-list.html'
import '../monitor/tag/gas-list.html'
import '../monitor/tag/alarm-list.html'
import '../monitor/tag/person-cards-alarm.html'

const RELOADPAGE = 2 * 60 * 60 * 1000
export default class UserService {
  constructor(name = 'UNKNOWN') {
    this.name = name
    this.pwd = null
    this.room = 'MONITOR' // 登录后默认是在 MONITOR room

    this.sock = null // Socket object
    this.time = 12 * 60 * 60 * 1000

    this.mainPage = null
    this.helpme = null
    this.gas = null
    this.alarmlist = null

    this.logined = false

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers() {
    let self = this
    this.data = null

    xbus.on('USER', (msg) => {
      switch (msg.cmd) {
        case 'LOGIN':
          self.login(msg.data.user_name, msg.data.user_pwd, msg.data.md5)
          break
        case 'LOGOUT':
          self.logout()
          break
        case 'STANDBY':
          self.standby(msg)
          break
        case 'MODIFY_PWD':
          self.modifyPwd(msg.data)
          break
        default:
          console.warn('未知的 USER 指令：', msg)
      }
    })

    xbus.on('SHOW-MODIFY-PWD', () => {
      this.showModifyPwd()
    })
    // self.credentialsMaturity()
  }

  login(username, userpwd, md5) {
    if (!this.sock) {
      this.sock = new Socket()
    }

    let self = this
    this.sock.getConnection(3000).then((socket) => {
      self.doLogin(username, userpwd, md5)
    }).catch((msg) => {
      console.warn('Get connection error, please try later: ', msg)
      window.xhint.showHint('无法连接到服务器！', '请确认网络可用后，再试一下。')
    })
  }

  doLogin(name, pwd, md5) {
    let reqMsg = {
      cmd: CMD.USER.LOGIN,
      data: {
        user_name: name,
        user_pass: pwd,
        md5: md5
        // mdtdata: xdata.dexieDBStore.mdtdata
      }
    }
    this.pwd = pwd || md5
    // console.debug('<< Send login request : ', reqMsg)
    this.sock.socket.emit(EVT.USER, reqMsg, (data) => {
      this.doLoginRes(data)
    })
    // this.sock.socket.emit(EVT.USER, reqMsg, this.doLoginRes)
  }

  logout() {
    window.transer.pTransfer('p_login')
    this.mainPage && this.mainPage.unmount(true)
    this.helpme && this.helpme.unmount(true)
    this.gas && this.gas.unmount(true)
    this.alarmlist && this.alarmlist.unmount(true)
    this.personcardsalarm && this.personcardsalarm.unmount(true)
    this.mainPage = null
    this.helpme = null
    this.gas = null
    this.alarmlist = null
    this.personcardsalarm = null
    // 重新初始化状态
    window.initApp()

    // inform the server
    let socket = this.sock && this.sock.socket
    if (socket) {
      let reqMsg = {
        cmd: CMD.USER.LOGOUT,
        data: {
          user_name: socket.username
        }
      }
      socket.emit(EVT.USER, reqMsg)

      socket.close()
    }
    window.location.reload()
  }

  reload() {
    window.location.reload()
  }

  doLoginRes(res) {
    // console.debug('>> Got login response : ', res)
    if (this.logined) return
    if (res) {
      if (res.code === 0) {
        this.data = res

        let socket = this.sock.socket
        this.name = res.data.name
        this.role = res.data.roleID
        this.userIP = res.data.ip
        socket.username = res.data.name
        socket.sid = res.data.sid

        saveCredential(this.name, this.pwd)
        setCookie('username', res.data.md5)
        // setCookie('username', this.name)
        let userinfo = {
          name: this.name,
          roleId: this.role,
          deptID: res.data.deptID,
          userIP: this.userIP,
          accessID: res.data.accessID,
          objRange: res.data.objRange,
          userCName: res.data.userCName,
          isCheck: res.data.isCheck
        }

        let isShowAlarm = getAlarmShow(this.role)

        if (res.data.isCheck === 1) xbus.trigger('SAVE-META-DATA-SPECIAL')

        // mount the page-main
        this.mainPage = riot.mount('div#p_main', 'page-main', userinfo)[0]
        this.gas = riot.mount('gas-list', {})[0]
        if (isShowAlarm) {
          this.helpme = riot.mount('helpme-list', {})[0]
          this.alarmlist = riot.mount('alarm-list', userinfo)[0]
        }
        this.personcardsalarm = riot.mount('person-cards-alarm', {})[0]
        window.initMainPageUtils()
        // window.transer.pTransfer('p_main')

        xbus.trigger('USERINFO-UPDATE', userinfo)
        xbus.trigger('COLLECTOR-STATUS-UPDATE')
        window.transer.pTransfer('p_main')
        window.isPC && xbus.trigger('ALARM-LIST-SHOW')

        this.setupAutoLogout()
        this.logined = true

        // this.respAllPersonOnCar(userinfo)
        this.searchCredials()
        this.checkoutUserDo(this.reload, RELOADPAGE)
        // this.searchThreeRate()
      } else {
        let name = getCookie('username')
        let self = this

        // 移动端初始化时，存在cookie，但是cookie无效，则重新加载page-login，并删除cookie
        if (name && !window.isPC) { 
          riot.mount('page-login', {
            user: self
          })
          delCookie('username')
        } else {
          xbus.trigger('SHOW-USER-TIPS', {
            msg: '用户名或密码错误，请确认后重试。'
          })
          console.warn('用户名 或 密码 错误！')
        }
      }
    } else {
      console.warn('LOGIN ： 系统错误！')
    }
  }

  respAllPersonOnCar(userinfo) {
    let msg = {
      cmd: 'req_all_person_on_car',
      data: [userinfo.name, new Date().getTime()]
    }
    xbus.trigger('REQ-PERSON-ONCAR', msg)
  }

  // 切换 standby / monitor 状态，如果处在 standby, 则不接收实时 push 位置数据
  standby(msg) {
    let socket = this.sock.socket
    if (!socket || socket.disconnected) {
      window.transer.pTransfer('p_login')
    }

    socket.emit(EVT.USER, {
      cmd: CMD.USER.STANDBY,
      data: {
        username: socket.username,
        op: msg.op
      }
    }, (data) => {
      this.doStandbyRes(data)
    })
  }

  doStandbyRes(res) {
    if (res) {
      if (res.code === 0) {
        if (res.op === 'enter') {
          this.room = 'STANDBY'
        }
        if (res.op === 'leave') {
          this.room = 'MONITOR'
        } else {
          this.room = 'UNKNOWN'
        }

        xbus.trigger('USER-CHANGE-ROOM', {
          room: this.room
        })
      } else {
        console.warn('STANDBY ： failed！')
      }
    } else {
      console.warn('STANDBY ： 系统错误！')
    }
  }

  searchCredials() {
    let sql = graphQuery['efficiency_overview']
    //资格证告警查询sql
    let str = getAccessSql('credentials-maturity')
    sql.sqlTmpl['credentials-maturity'] = `select 0 AS status, credentials_staff_id,DATE_FORMAT(expire_time, '%Y-%m-%d') as expire_time, s.name, dc.name as documents,dd.name as deptname, dcs.credentials_number, TIMESTAMPDIFF (DAY, CURDATE(), dcs.expire_time) as alarmday from dat_credentials_staff dcs, dat_credentials dc, dat_staff s ,dat_staff_extend dse, dat_dept dd where s.staff_id = dse.staff_id and dse.dept_id = dd.dept_id ${str} and dcs.credentials_id = dc.credentials_id ${this.data.data.objRange === 1 || this.data.data.isCheck === 1 ? 'and dcs.warn_id = 0' : ''} and dcs.staff_id = s.staff_id and TIMESTAMPDIFF (DAY, CURDATE(), dcs.expire_time) <= dc.remind_time`
    let message = {
      cmd: 'query',
      data: {
        name: 'three-credentials',
        sql: sql.sqlTmpl,
        searchTime: sql.searchTime,
        termTime: sql.termTime
      }
    }
    console.log(message.data.sql)
    xbus.trigger('REPT-FETCH-DATA', {
      req: message,
      def: {
        name: 'three-credentials'
      }
    })
  }

  checkoutUserDo(callback, seconds) {
    let status = true
    let timer

    document.body.onmousedown = function () {
      status = true
    }
    document.body.onmouseup = function () {
      countTime()
    }

    function countTime() {
      setInterval(function () {
        if (!status) {
          callback()
          status = true
        }
      }, 1)
      if (timer) {
        clearInterval(timer)
      }
      timer = setInterval(function () {
        status = false
      }, seconds)
    }
    countTime()
  }

  credentialsMaturity() {
    let time = 12 * 60 * 60 * 1000
    window.setInterval(this.searchCredials, time)
  }

  /**
   * 当刷新页面或关闭窗口时，自动退出登录
   */
  setupAutoLogout() {
    window.addEventListener('beforeunload', () => {
      console.log('Logout automatically.')
      xbus.trigger('USER', {
        cmd: 'LOGOUT'
      })
    })
  }

  // doLogoutRes (res) {
  //   if (res) {
  //     if (res.code === 0) {
  //       this.name = null

  //       // window.transer.pTransfer('p_login')
  //     } else {
  //       console.warn(`退出失败！${res.msg}`)
  //     }
  //   } else {
  //     console.warn('LOGOUT ： 系统错误！')
  //   }
  // }

  modifyPwd(msg) {
    this.sock.socket.emit(EVT.USER, {
      cmd: CMD.USER.MODIFY,
      data: {
        username: msg.username,
        oldpwd: msg.oldpwd,
        newpwd: msg.newpwd
      }
    }, (data) => {
      this.doModifyPwdRes(data)
    })
  }

  doModifyPwdRes(data) {
    xbus.trigger('USER-MODIFY-PWD-RES', data)
  }
}
