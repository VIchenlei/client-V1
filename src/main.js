import {
  EventMixin
} from './js/Mixins.js'
// import '../node_modules/material-components-web/dist/material-components-web.css'
// import '../node_modules/material-components-web/dist/material-components-web.js'

// common --------------------
import './sass/base.sass'
import '../node_modules/material-components-web/dist/material-components-web.css'

// import './tags/dialog.html'

import './config/sass/check-tree.sass'

import './sass/blank-message.sass'
import './tags/blank-message.html'

import './sass/xhint.sass'
import './tags/xhint.html'

import './tags/hintip.html'
import './sass/hintip.sass'

import './tags/popup-list.html'
import './sass/popup-list.sass'

import './tags/input-popup-list.html'

import './tags/fuzzy-search2.html'
import './sass/fuzzy-search.sass'

import './monitor/tag/card-tips.html'

import './sass/icon-badge.sass'

import './config/sass/canvas.sass'
import './config/sass/role.sass'
import './sass/formctrl.sass'

import './sass/bg.sass'
// import './sass/effect.sass'

import './sass/sidebar.sass'

import './sass/dialog.sass'
import './sass/file-dialog.sass'

import './sass/table.sass'

import './report/sass/report.sass'
import './report/sass/sp-rate.sass'
import './sass/tab.sass'

import './manage/sass/configer-table.sass'
import './manage/sass/echarts-work.sass'

import './sass/group-list.sass'

import './sass/ol.css'
import './sass/animate.css'
import './sass/hint.min.css'

import './sass/maintenance-detail.sass'
import './sass/popuplabel-content.sass'

import './sass/transport-bars.sass'

import './manage/sass/oilwear-record.sass'
import './sass/parts-record.sass'
import './sass/meta-table.sass'

import './sass/home-page.sass'
import './manage/sass/basic-message.sass'
import './report/sass/query-whole.sass'

import './sass/pagination.sass'
import './tags/pagination.html'

import './tags/public-table.html'

import './sass/map.sass'
import './sass/symbols.sass'
import './sass/text-filed.sass'
import './sass/loading.sass'

import './sass/brief.sass'

// login --------------------

import './tags/svgicon.html'
import './tags/dialog-head.html'

// login --------------------
import './login/sass/page-login.sass'
import './tags/text-filed.html'
import './login/tag/page-login.html'

// main --------------------
import './main/sass/page.sass'
import './main/sass/page-main.sass'
import './main/sass/animation.sass'

// header --------------------
import './header/sass/header.sass'
import './header/tag/page-head.html'

// footer --------------------
import './footer/sass/footer.sass'

import './footer/tag/page-foot.html'
import './footer/tag/onduty-leader.html'
import './footer/tag/network-status.html'
import './footer/tag/last-update.html'

import './monitor/tag/monitor-state.html'

// monitor --------------------
import './monitor/sass/toolbar.sass'
import './monitor/sass/tooltips.sass'
import './monitor/sass/patroltips.sass'
import './monitor/sass/cardtips.sass'
import './monitor/sass/map-topbar.sass'
import './monitor/sass/map-tools.sass'
import './monitor/sass/map-sidebar.sass'
import './monitor/sass/call-leave.sass'
import './monitor/sass/call-person.sass'
import './monitor/sass/call.sass'
import './monitor/sass/hand-upmine.sass'
import './monitor/sass/alarm-list.sass'
import './monitor/sass/camera-area.sass'
import './monitor/sass/staff-curve.sass'
// import './monitor/sass/alarm.sass'
// import './monitor/sass/alarm-panel.sass'
// import './monitor/sass/alarm-list.sass'
import './monitor/sass/helpme.sass'
import './monitor/sass/gas.sass'
import './monitor/sass/over-view.sass'
import './monitor/sass/legend.sass'
import './monitor/sass/td-vehicle.sass'
import './monitor/sass/three-rate.sass'

import './monitor/tag/sp-monitor.html'
import './monitor/tag/helpme-list.html'
import './monitor/tag/gas-list.html'
// import './monitor/tag/alarm-list.html'
import './monitor/tag/detail-dialog.html'
import './monitor/tag/fade-area-tips.html'
import './tags/meta-select.html'
import './tags/text-select.html'
import './monitor/tag/alarm-list.html'
import './monitor/tag/person-cards-alarm.html'
import './monitor/tag/camera-area.html'

import HelpmeService from './js/service/HelpmeService.js'
import GasService from './js/service/GasService.js'

// player --------------------
import './player/sass/track.sass'
import './player/sass/history-map.sass'
import './player/sass/player-control.sass'

import './player/tag/sp-history.html'

// config --------------------
import './config/sass/meta-dialog.sass'
import './config/sass/reader-dialog.sass'
import './config/tag/sp-config.html'
import './config/sass/sp-config.sass'

// report --------------------
import './report/tag/sp-report.html'

// manage --------------------
import './manage/tag/sp-manage.html'

// user --------------------
import './user/sass/user-profile.sass'
import './user/sass/modi-pwd.sass'

import './user/tag/modify-pwd-dialog.html'

import UserService from './user/UserService.js'

// 3dgis --------------------------
// import './3dgis/sass/3dgis.sass'

// common logic --------------------

import AreaPrinter from './js/utils/AreaPrinter.js'
import {
  isPC,
  compare,
  fontDataChange
} from './js/utils/utils.js'
import Draggable from './js/utils/Draggable.js' // be global variable ?
import Transer from './js/Transer.js'
import DataStore from './js/store/DataStore.js'
import { getCookie } from './js/utils/cookie.js'

// tag definitions

// used for all other custom tags
import './tags/grip.html'
import './tags/input-select.html'
import './tags/icon-input.html'
import './tags/select-input.html'
import './report/tag/sp-rate.html'


// import './tags/map-stat.html'

// 分页时，每页的记录数
window.isPC = isPC()
window.compare = compare()

function initBaseServices() {
  window.transer = new Transer('p_login') // eslint-disable-line
  window.xbus = riot.observable() // TODO: 全局变量，后续优化，
  window.xdata = new DataStore() // global, TODO : 优化
}
// window.initBaseServices = initBaseServices

function initBizService() {
  let helpmeService = new HelpmeService() // eslint-disable-line
  let gasService = new GasService()
}

function initTools() {
  window.setDraggable = (msg) => {
    Draggable(msg.target, msg.handle)
  }

  // set dialog draggable
  window.setDialogDraggable = (root) => {
    let dragHandle = root.querySelector('.dlg-head')
    let dragTarget = root.querySelector('.dlg-window')
    Draggable(dragTarget, dragHandle)
  }

  // 打印页面的某个区域
  window.printArea = (msg) => {
    // new AreaPrinter(msg.tag_id, msg.title, msg.labels, msg.names, msg.rows, msg.types, msg.def, msg.blockedIndex).print()
    new AreaPrinter(msg.title, msg.content).print()
  }
}

function judgeIsLogin(user) {
  let username = getCookie('username')
  // 移动端判断cookie是否有效
  if (username && !window.isPC) {
    xbus.trigger('USER', {
      cmd: 'LOGIN',
      data: {
        md5: username
      }
    })
  } else {
    riot.mount('page-login', {
      user: user
    })
  }
}

// init the login page
function initLoginPage() {
  let user = new UserService()

  xbus.trigger('OPEN-LOCAL-DB')
  judgeIsLogin(user)
}

function stopZoom() {
  // 禁止滚轮缩放
  var zoom = function (e) {
    var e = e || window.event
    if (e.wheelDelta && event.ctrlKey) {
      event.returnValue = false
    } else if (e.detail) {
      event.returnValue = false
    }
  }
  if (document.addEventListener) {
    document.addEventListener('DOMMouseScroll', zoom, false)
  }
  window.onmousewheel = document.onmousewheel = zoom

  // 禁止键盘缩放
  document.addEventListener('DOMContentLoaded', function (event) {
    // chrome 浏览器直接加上下面这个样式就行了
    document.body.style.zoom = 'reset';
    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey === true || event.metaKey === true) &&
        (event.which === 61 || event.which === 107 ||
          event.which === 173 || event.which === 109 ||
          event.which === 187 || event.which === 189)) {
        event.preventDefault();
      }
    }, false)
    document.addEventListener('mousewheel DOMMouseScroll', function (event) {
      if (event.ctrlKey === true || event.metaKey) {
        event.preventDefault();
      }
    }, false)
  }, false)
}

// function hideAll () {
//   let oBody = document.querySelector('body')
//   let hide = function () {
//     xbus.trigger('HIDE-ALL-POPUP')
//   }
//   oBody.addEventListener('click', hide)
// }

// init the main page's utils
window.initMainPageUtils = () => {
  initBizService()
  // hideAll()

  // init
  // riot.mount('helpme-list', {})
  // riot.mount('alarm-list', {})

  window.cardtips = riot.mount('card-tips', {})[0]

  // 详情对话框，全局对象
  window.tagDetailDialog = null
  window.showDetailDialog = (msg) => {
    if (!window.tagDetailDialog) {
      window.tagDetailDialog = riot.mount('detail-dialog')[0]
    }

    let dialog = window.tagDetailDialog
    if (dialog) {
      dialog.updateData(msg)
    }
  }
}

riot.mixin('EventMixin', EventMixin)

window.initApp = () => {
  initBaseServices()
  initTools()
  initLoginPage()
  fontDataChange()
  // stopZoom()
}

window.xhint = riot.mount('xhint', {})[0]
window.hintip = riot.mount('hintip', {})[0]
window.initApp()
