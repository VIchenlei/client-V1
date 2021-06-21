const ALARMICON = 'KJ-A00'
import specialTable from '../def/special_tablekey_def'
import fuzzySearch from '../def/fuzzy_search.js'
import queryData from '../def/query_data.js'
import numberTurnText from '../../config/js/number_turn_text.js'
import md5 from 'js-md5'
import { ZOOM_LEVEL } from '../def/map_def.js'

const sqlQuery = ['leader_arrange', 'dat_vehicle_state', 'his_maintenance', 'dat_vehicle_drive', 'his_patrol_data', 'rt_person_forbid_down_mine']
/**
 * 如果是字符串，则转为 JSON 对象，否则保持不变
 *
 * @method toJson
 *
 * @param  {[type]} data [description]
 *
 * @return {[type]}      [description]
 */
function toJson(data) {
  if (typeof data === 'object') {
    return data
  }

  let ret = null
  if (data && (typeof data === 'string')) {
    try {
      ret = JSON.parse(data)
    } catch (error) {
      console.warn('Can NOT parse the input data to be JSON : ', data)
    }
  } else {
    console.warn('The input data\'s type is NOT string : ', data)
  }

  return ret
}

function isPC() {
  let userAgentInfo = navigator.userAgent
  let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  let flag = true
  for (let v = 0, len = Agents.length; v < len; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

/**
 *  name: 按照哪个字段来排序
 *  type: 是否中文排序，是中文排序传参，不是不用传参
 *  reverse: 是否逆序
 *  */
function compare(name, type, reverse, minor) {
  return function (o, p) {
    var a, b
    if (typeof o === 'object' && typeof p === 'object' && o && p) {
      a = o[name]
      b = p[name]
      if (a === b) {
        return minor ? minor(o, p) : 0;
      }
      if (typeof a === typeof b) {
        if (type) { // 中文排序
          if (reverse) {
            return b.localeCompare(a, 'zh-Hans-CN')
          } else {
            return a.localeCompare(b, 'zh-Hans-CN')
          }
        } else {
          if (reverse) {
            return a > b ? -1 : 1
          } else {
            return a < b ? -1 : 1
          }
        }
      }
      if (reverse) {
        return typeof a > typeof b ? -1 : 1
      } else {
        return typeof a < typeof b ? -1 : 1
      }
    }
  }
}

/**
 * [delay 使用 setTimeout() 实现的基于 promise 的 delay()]
 * @param  {[type]} ms [延迟的毫秒数]
 * @return {[type]}    [description]
 * usage: delay(ms).then(fn)
 */
function delay(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms)
  })
}

/**
 * [clone 深度克隆对象]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function paddingLeft(i) {
  let ret = '' + i
  if (i < 10) {
    ret = '0' + i
  }

  return ret
}

function needDisplay(cardID) { // 按卡号过滤卡，不需要显示返回false,需要显示返回true
  if (!cardID) {
    return console.warn('该条数据无卡号！')
  }
  let rules = xdata.metaStore.dataInArray.get('rules')
  if (!rules) {
    return true
  }
  let objRange = xdata.objRange
  for (let i = 0, len = rules.length; i < len; i++) {
    if (rules[i] === 'filtercard') {
      rules = rules[i].status
    }
  }

  let card = cardID.slice(0, 3),
    obj = null

  if (card === '001') {
    obj = xdata.metaStore.dataInArray.get('staff').filter(item => item.card_id === cardID)
  } else {
    obj = xdata.metaStore.dataInArray.get('vehicle').filter(item => item.card_id === cardID)
  }

  if (rules && objRange === 1 && obj && obj[0] && obj[0].need_display === 0) { // 规则生效时 rules,0为生效，如果该卡不需要显示，则返回false
    return false
  } else {
    return true
  }
}

/** [按工号过滤卡]
 *  [过滤人车是否需要显示]
 * @param {*} number 人员为工号即staff_id,车辆为vehicle_id
 *  此card_id仅是判断是车辆还是人员
 */
function displayByJobNumber(number, cardID) { // cardID为当前卡号
  let rules = xdata.metaStore.dataInArray.get('rules')
  let objRange = xdata.objRange
  for (let i = 0, len = rules.length; i < len; i++) {
    if (rules[i] === 'filtercard') {
      rules = rules[i].status
    }
  }

  let card = cardID.slice(0, 3),
    obj = null

  if (card === '001') {
    obj = xdata.metaStore.dataInArray.get('staff').filter(item => item.staff_id === number)
  } else {
    obj = xdata.metaStore.dataInArray.get('vehicle').filter(item => item.vehicle_id === number)
  }

  if (rules && objRange === 1 && obj && obj[0] && obj[0].need_display === 0) { // 规则生效时 rules,0为生效，如果该卡不需要显示，则返回false
    return false
  } else {
    return true
  }
}

// 将毫秒数格式化为 hh:mm:ss 格式
function formatElapsedTime(ms) {
  if (ms <= 0) {
    return '00:00:00'
  }

  const h = 60 * 60 * 1000
  const m = 60 * 1000
  const s = 1000

  let hh = Math.floor(ms / h)
  let mm = Math.floor(ms % h / m)
  let ss = Math.floor(ms % h % m / s)

  let shh = paddingLeft(hh)
  let smm = paddingLeft(mm)
  let sss = paddingLeft(ss)

  return shh + ':' + smm + ':' + sss
}

/**
 * [handleEvent 优雅的绑定、解绑 DOM对象 的事件监听]
 * @param  {[type]}  eventName    [事件名称]
 * @param  {[type]}  onElement    [DOM对象]
 * @param  {[type]}  withCallback [事件处理函数]
 * @param  {[type]}  useCapture   [是否在捕获阶段处理事件？]
 * @param  {Boolean} thisArg      [this值]
 * @return {[type]}               [事件句柄]
 */
function handleEvent(eventName, {
  onElement,
  withCallback,
  useCapture = false
} = {}, thisArg) {
  const element = onElement || document.documentElement

  function handler(event) {
    if (typeof withCallback === 'function') {
      withCallback.call(thisArg, event)
    }
  }

  handler.destroy = function () {
    return element.removeEventListener(eventName, handler, useCapture)
  }

  element.addEventListener(eventName, handler, useCapture)
  return handler
}

/**
 * [adjustFontSize Auto adjust font size : adjustFontSize(document, window) ]
 * sample: http://121.40.99.17/global/rem-phone.html
 * @param  {[type]} doc [description]
 * @param  {[type]} win [description]
 * @return {[type]}     [description]
 */
function adjustFontSize(doc, win) {
  let docEl = doc.documentElement
  let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'

  function recalc() {
    var clientWidth = docEl.clientWidth
    if (!clientWidth) {
      return
    }
    docEl.style.fontSize = 20 * (clientWidth / 320) + 'px'
  }

  if (!doc.addEventListener) {
    return
  }

  win.addEventListener(resizeEvt, recalc, false)
  doc.addEventListener('DOMContentLoaded', recalc, false)
}

function isValidID(id) {
  return typeof (id) === 'number' && parseInt(id, 10) >= 0
}

// // Anytime you need
// const handleClick = handleEvent('click', {
//   onElement: element,
//   withCallback: (event) => {
//     console.log('Tada!')
//   }
// })
//
// // And anytime you want to remove it
// handleClick.destroy()

// /**
//  * [根据记录的定义和值，生成一个数据表]
//  * @param  {[type]} tableDef  [description]
//  * @param  {[type]} recordValue [description]
//  * @return {[type]}      [description]
//  */
// let convertToTable = (tableDef, recordValue) => {
//   let table = []
//
//   let fls = tableDef.fields
//   let count = fls.names.length
//
//   for (let i = 0; i < count; i++) {
//     let name = fls.names[ i ]
//     let label = fls.labels[ i ]
//     let value = recordValue[ name ]
//     let field = {
//       name: name,
//       value: value,
//       label: label
//     }
//
//     table.push(field)
//   }
//
//   return table
// }

/**
 * usage:
 * let x = new Date()
 * x.format('yyyy-MM-dd hh:mm:ss')
 *
 * @method format
 *
 * @param  {[type]} format [description]
 *
 * @return {[type]}        [description]
 */
Date.prototype.format = function (format) { // eslint-disable-line
  let o = {
    'M+': this.getMonth() + 1, // month
    'd+': this.getDate(), // day
    'h+': this.getHours(), // hour
    'm+': this.getMinutes(), // minute
    's+': this.getSeconds(), // second
    'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
    'S': this.getMilliseconds() // millisecond
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item)
}

// compose the table's schema in array'
function getRows(values, def, maxid) {
  values = values ? values.row : null
  let rows = []
  let length = def.fields.names.length

  for (let i = 0; i < length; i++) {
    let v = values ? values[def.fields.names[i]] : ''
    if (!values && i == def.keyIndex && def.name !== "user") { // 新增记录，id 为 最大id+1
      v = maxid ? maxid + 1 : 0
    } else if (def.fields.types[i] === 'DATE') {
      v = v ? new Date(v).format('yyyy-MM-dd') : ''
    }
    let enableNull = def.fields.enableNull
    enableNull = enableNull && enableNull[i]
    let row = {
      field_name: def.fields.names[i],
      field_value: v,
      field_type: def.fields.types[i],
      field_label: def.fields.labels[i],
      field_enableNull: enableNull
    }

    rows.push(row)
  }

  return rows
}

function getMessage(cmd, rows, def, maxid) {
  return {
    cmd: cmd,
    name: def.name,
    table: def.table,
    title: def.label,
    key: def.fields.names[parseInt(def.keyIndex)], // key field name
    maxid: maxid,
    rows: rows
  }
}

// 删除前后空格
function trim(str) {
  return str.replace(/^(\s|\xA0)+|(\s|\xA0)+$/g, '')
}

function composeUpdateDBReq(dbOp, name, keyValue, sqlstring) {
  return {
    cmd: 'update', // update, CMD.META.UPDATE
    data: {
      op: dbOp, // INSERT, UPDATE, DELETE
      name: name,
      id: keyValue,
      sql: sqlstring
    }
  }
}

/**
 * 拖拽效果
 * @param {*事件} evt
 * @param {*拖拽对象} obj
 */
function doDrag(evt, obj) {
  let disX = evt.clientX - obj.offsetLeft
  let disY = evt.clientY - obj.offsetTop
  obj.style.cursor = 'move'
  obj.onmousemove = function (e) {
    let left = e.clientX - disX
    let top = e.clientY - disY
    obj.style.left = left + 'px'
    obj.style.top = top + 'px'
  }
  obj.onmouseup = function (e) {
    obj.style.cursor = 'default'
    this.onmousemove = null
    this.onmouseup = null
  }
}

// between yyyy-MM-01 00:00:00 and yyyy-(MM+1)-01 00:00:00
function getMonth(nMonth, type) { // nMonth: yyyy-MM
  let y = nMonth ? nMonth.split('-')[0] : new Date().getFullYear()
  let m = nMonth ? nMonth.split('-')[1] : new Date().getMonth() + 1
  let shift = xdata.metaStore.data.shift && xdata.metaStore.data.shift.get(1)
  let shiftime = shift ? shift.start_time : '23:59:59'
  // 月初
  // let sMonth = nMonth ? `${nMonth}-01 00:00:00` : `${new Date(new Date().getTime()).format('yyyy-MM')}-01 00:00:00` 
  let sMonth = type ? `${new Date(new Date(y, Number(m) - 1, 0).getTime()).format('yyyy-MM-dd')} ${shiftime}` : `${new Date(new Date(y, Number(m) - 1, 1).getTime()).format('yyyy-MM-dd')} 00:00:00`
  // 月底
  let lMonth = `${new Date(new Date(y, m, 0).getTime()).format('yyyy-MM-dd')} 23:59:59`
  return `between '${sMonth}' and '${lMonth}'`
}

function getDeptID(row) {
  const CM = 1
  let workfaceType = Number(row.workface_type)
  let workfaces = workfaceType === CM ? xdata.metaStore.data.coalface_vehicle : xdata.metaStore.data.drivingface_vehicle
  let workfaceID = workfaces && workfaces.get(row.workface_id)
  let vehicleID = workfaceID && workfaceID.vehicle_id
  let vehicles = xdata.metaStore.vehicles
  let vehicle = vehicles && vehicleID && vehicles.get(vehicleID)
  // let vehicleID = vehicle && vehicle.vehicle_id
  // vehicle = xdata.metaStore.data.vehicle_extend && xdata.metaStore.data.vehicle_extend.get(vehicleID)
  let deptID = vehicle && vehicle.dept_id
  return deptID
}

function isNullArr(obj) {
  let isNull = obj.every(item => !item)
  return isNull
}

// 对象排序
function objKeySort(obj, referObj) {
  let newObj = {}
  let values = []
  for (let i = 0; i < referObj.length; i++) {
    let objValue = (obj[referObj[i]] || obj[referObj[i]] === 0) ? obj[referObj[i]] : null
    values.push(objValue)
    newObj[referObj[i]] = objValue;
  }
  let isNull = isNullArr(values)
  return isNull ? null : newObj;
}

function initPagination(rows, pageindex) {
  let total = rows ? rows.length : 0
  let totalPage = Math.ceil(total / PAGE_SIZE)
  let pageIndex = 0
  if (pageindex) {
    if (pageindex === totalPage) {
      pageIndex = pageindex - 1
    } else {
      pageIndex = pageindex
    }
  } else {
    pageIndex = 0
  }
  return {
    'total': total,
    'totalPage': totalPage,
    'pageIndex': pageIndex
  }
}

function getMenus(roleID) {
  let roles = xdata.metaStore.data.role
  let roleRank = roles && roles.get(roleID)
  let roleRankID = roleRank && roleRank.role_rank_id
  if (roleRankID === 2) {
    let menus = roleRank.menus
    menus = menus.split(';')
    return {
      checkedMenu: menus,
      roleRankID: roleRankID
    }
  }
  return {
    roleRankID: roleRankID
  }
}

function getMon(num) {
  let stime = ''
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()
  let year2 = year
  // if (month === 0) { // 如果是1月份，则取上一年的12月份
  //   year2 = parseInt(year2) - 1
  //   month = 12
  // }
  if (month < 9) {
    month = '0' + (month + 1)
  }

  stime = '"' + year2 + '-' + month + '"'
  return stime
}

function dealMonth(chooseTime) {
  let time = chooseTime ? chooseTime : getMon()
  let month_data = xdata.metaStore.data.month && Array.from(xdata.metaStore.data.month.values())
  let month_start = month_data && month_data[0].start_time
  let month_end = month_data && month_data[0].end_time
  let choose_year = new Date(time).getFullYear()
  let endYear = choose_year
  let choose_month = new Date(time).getMonth() + 1
  let endMonth = choose_month
  let month_num = new Date(choose_year, choose_month, 0).getDate()
  month_start = month_start >= month_num ? month_num : month_start
  month_end = month_end >= month_num ? month_num : month_end
  if (month_start >= month_end) {
    if (choose_month === 12) {
      endMonth = 1
      end_year = choose_year + 1
    } else {
      endMonth = choose_month + 1
    }
  }
  let choose_start = new Date(time).format('yyyy-MM') + '-' + month_start
  let choose_end = endYear + '-' + endMonth + '-' + month_end
  return `"${choose_start}" and "${choose_end}"`
}

function getAlarmShow(roleID) {
  if (roleID === 100) return false
  if (roleID !== 2) return true
  let menuRes = getMenus(roleID)
  let checkedMenu = menuRes.checkedMenu
  if (checkedMenu && checkedMenu.includes(ALARMICON)) return true
  return false
}

function copySubRows(rows, pageIndex) {
  let start = pageIndex * PAGE_SIZE
  let end = (pageIndex + 1) * PAGE_SIZE
  return rows && rows.slice(start, end)
}

function computeDays(searchYear, searchMonth) {
  let month1 = [1, 3, 5, 7, 8, 10, 12] // 31天的月份
  let month2 = [4, 6, 9, 11] // 30天的月份
  let month_data = xdata.metaStore.data.month && Array.from(xdata.metaStore.data.month.values())
  let month_start = month_data && month_data[0].start_time
  let month_end = month_data && month_data[0].end_time
  let daysArr = []
  let days = 0
  let len = 0
  if (month1.includes(Number(searchMonth))) {
    len = 31
  } else if (month2.includes(Number(searchMonth))) {
    len = 30
  } else {
    len = (searchYear[0] % 4 == 0 && searchYear[0] % 100 !== 0 || searchYear[0] % 400 == 0) ? 29 : 28
  }

  if (month_start < month_end) {
    if (month_end > len) {
      days = len - month_start + 1
    } else {
      days = month_end - month_start + 1
    }
  } else {
    days = len + 1 - month_start + month_end
  }
  for (let j = month_start; j < (days + month_start); j++) {
    if (j > len) {
      daysArr.push(j % len)
    } else {
      daysArr.push(j)
    }
  }
  return {
    days: days,
    daysArr: daysArr,
    month_start: month_start,
    month_end: month_end
  }
}

// deal echart rows in rept-table
function createChart(rows, name) {
  let arr = []
  for (let i = 0, len = rows.length; i < len; i++) {
    let row = rows[i]
    let totle = null
    if (name === 'REPT_vehicle_type_day' || name === 'REPT_vehicle_type_month') {
      totle = row['total']
    } else if (name === 'REPT_vehicle_type_month_detail') {
      totle = 90
    }
    let use = (row['chuche'] / totle).toFixed(2) * 100 + '%'
    let malfunction = (row['guzhang'] / totle).toFixed(2) * 100 + '%'
    let maintain = (row['weixiu'] / totle).toFixed(2) * 100 + '%'
    let upkeep = (row['baoyang'] / totle).toFixed(2) * 100 + '%'
    let leisure = ((totle - row['chuche'] - row['guzhang'] - row['weixiu'] - row['baoyang']) / totle).toFixed(2) * 100 + '%'
    row['use'] = use == '0%' ? '' : use
    row['malfunction'] = malfunction == '0%' ? '' : malfunction
    row['maintain'] = maintain == '0%' ? '' : maintain
    row['upkeep'] = upkeep == '0%' ? '' : upkeep
    row['leisure'] = leisure == '0%' ? '' : leisure
  }
  return rows
}

//根据时间判断班次
function getShiftByTime(rows) {
  let datas = null
  let timeArea = Array.from(xdata.metaStore.data.shift.values())
  datas = rows && rows.map(item => {
    if (item.start_time && item.shift_name) {
      timeArea.forEach(i => {
        if (i.offset != 0) {
          if ((new Date(item.start_time).format('hh:mm:ss') >= i.start_time && new Date(item.start_time).format('hh:mm:ss') <= new Date('23:59:59').format('hh:mm:ss')) ||
            (new Date(item.start_time).format('hh:mm:ss') <= i.end_time && new Date(item.start_time).format('hh:mm:ss') >= new Date('00:00:00'))) {
            item.shift_name = i.short_name
          }
        } else {
          if (new Date(item.start_time).format('hh:mm:ss') >= i.start_time && new Date(item.start_time).format('hh:mm:ss') <= i.end_time) {
            item.shift_name = i.short_name
          }
        }
      })
    }
    return item
  })
  return datas
}

function judgeRepeat(arr) {
  var hash = {}
  for (var i in arr) {
    if (hash[arr[i]]) {
      return true
    }
    hash[arr[i]] = true
  }
  return false
  // return /(\x0f[^\x0f]+)\x0f[\s\S]*\1/.test("\x0f"+a.join("\x0f\x0f") +"\x0f");
}

// 根据name过滤队组，返回队组过滤sql
function getAccessSql(defName) {
  let dse2 = ['person_absence']
  let s = ['person_well_overtime', 'person_area_overtime', 'person_well_overcount', 'person_area_overcount', 'person_call_help', 'person_area_limited', 'vehicle_enter_limit_area']
  let dve = ['vehicle_updown_mine', 'vehicle_no_updown_mine', 'his_area', 'v_vehicle_day', 'v_vehicle_month', 'driver_dept_day', 'driver_dept_month', 'vehicle_check']
  let v = ['v_overspeed', 'tbm_substation_distance_limited', 'car_end_zhuiwei', 'car_geofault_limited']
  let ds = ['person_card_battery_alarm', 'person_fixed_alarm']
  let aa = ['worktime_detail_table']
  let bt = ['TrackList']
  let accessResult = xdata.depts
  let sql = ''
  let field = ''
  if (accessResult && accessResult != '') {
    switch (true) {
      case dse2.includes(defName):
        field = 'dse2.dept_id'
        break;
      case s.includes(defName):
        field = 's.dept_id'
        break;
      case dve.includes(defName):
        field = 'dve.dept_id'
        break;
      case v.includes(defName):
        field = 'v.dept_id'
        break;
      case ds.includes(defName):
        field = 'ds.dept_id'
        break;
      case aa.includes(defName):
        field = 'aa.dept_id'
        break;
      case bt.includes(defName):
        field = 'bt.dept_id'
        break
      default:
        field = 'dse.dept_id'
        break;
    }
    for (let i = 0; i < accessResult.length; i++) {
      let concatstr = accessResult.length > 1 ? ' and (' : ' and '
      i === 0 ? sql += concatstr + field + '=' + Number(accessResult[i]) : sql += ' OR ' + field + '=' + Number(accessResult[i])
    }
    sql += accessResult.length > 1 ? ')' : ''
  }
  return sql
}

// 根据name过滤人车，返回人车过滤sql
function getDisplaySql(defName) {
  let dse2 = ['person_absence']
  let s = ['person_well_overtime', 'person_area_overtime', 'person_well_overcount', 'person_area_overcount', 'person_call_help', 'person_area_limited', 'vehicle_enter_limit_area']
  let ds = ['person_card_battery_alarm', 'person_fixed_alarm']
  let aa = ['worktime_detail_table']
  let dve = ['vehicle_updown_mine', 'vehicle_no_updown_mine', 'his_area', 'v_vehicle_day', 'v_vehicle_month', 'driver_dept_day', 'vehicle_check', 'driver_dept_month']
  let v = ['v_overspeed', 'vehicle_exception', 'driver_car_limited', 'person_driver_car_limited', 'tbm_substation_distance_limited', 'car_end_zhuiwei', 'car_geofault_limited']
  let sql = ''
  let field = ''
  switch (true) {
    case dse2.includes(defName):
      field = 'dse2.need_display'
      break;
    case s.includes(defName):
      field = 's.need_display'
      break;
    case ds.includes(defName):
      field = 'ds.need_display'
      break;
    case aa.includes(defName):
      field = 'aa.need_display'
      break;
    case dve.includes(defName):
      field = 'dve.need_display'
      break;
    case v.includes(defName):
      field = 'v.need_display'
      break;
    default:
      field = 'dse.need_display'
      break;
  }
  sql += ' and ' + field + '=' + 1
  return sql
}

function getAreaDisplaySql(defName) {
  let da = ['person_area', 'person_area_limited', 'his_area', 'vehicle_enter_limit_area', 'person_location_area']
  let a = ['person_area_overcount', 'inspection_detail_day', 'v_area', 'vehicle_enter_importent_area', 'person_area_important']
  let sql = ''
  let field = ''
  switch (true) {
    case da.includes(defName):
      field = 'da.need_display'
      break;
    case a.includes(defName):
      field = 'a.need_display'
      break;
    default:
      field = 'da.need_display'
      break;
  }
  sql += ' and ' + field + '=' + 1
  return sql
}

function specialName(name) {
  return specialTable[name] ? specialTable[name] : name + '_id'
}

// 获取搜索集
function getSearchData(label, name, rows, cb, datas) {
  let dataRows = name === 'staff' ? xdata.metaStore.staffs && Array.from(xdata.metaStore.staffs.values()) : xdata.metaStore.data[name] && Array.from(xdata.metaStore.data[name].values())
  datas = datas ? datas : dataRows
  let isFuzzy = fuzzySearch.hasOwnProperty(name)
  let fuzzy = fuzzySearch[name]
  let query = queryData[name]

  let typeDef = {
    name: isFuzzy ? fuzzy.name : query.name,
    label: isFuzzy ? fuzzy.label : query.label,
    placeholder: isFuzzy ? fuzzy.placeholder : query.placeholder,
    cb: cb // the callback when select an item.
  }

  let dataSet = {
    desc: isFuzzy ? fuzzy.desc : query.desc, // 显示结果集时，显示的字段：一般为描述字段
    keys: isFuzzy ? fuzzy.keys : query.keys, // 参与搜索的列名称
    data: isFuzzy ? datas : query.searchName === 'staff' ? Array.from(xdata.metaStore.staffs.values()) :  xdata.metaStore.dataInArray.get(query.searchName)
  }
  return {
    typeDef: typeDef,
    dataSet: dataSet
  }
}

// 去重
function unique(list, key) {
  var result = [];
  for (var i = 0; i < list.length; i++) {
    if (i == 0) result.push(list[i]);
    let b = false;
    if (result.length > 0 && i > 0) {
      for (var j = 0; j < result.length; j++) {
        if (result[j][key] == list[i][key]) {
          b = true;
          //break;
        }
      }
      if (!b) {
        result.push(list[i]);
      }
    }
  }
  return result;
}

function getMonthDate(nMonth, type) { // nMonth: yyyy-MM
  let y = nMonth ? nMonth.split('-')[0] : new Date().getFullYear()
  let m = nMonth ? nMonth.split('-')[1] : new Date().getMonth() + 1
  let shift = xdata.metaStore.data.shift && xdata.metaStore.data.shift.get(1)
  let shiftime = shift ? shift.start_time : '23:59:59'
  // 月初
  // let sMonth = nMonth ? `${nMonth}-01 00:00:00` : `${new Date(new Date().getTime()).format('yyyy-MM')}-01 00:00:00` 
  let sMonth = type ? `${new Date(new Date(y, Number(m) - 1, 0).getTime()).format('yyyy-MM-dd')} ${shiftime}` : `${new Date(new Date(y, Number(m) - 1, 1).getTime()).format('yyyy-MM-dd')}`
  // 月底
  let lMonth = `${new Date(new Date(y, m, 0).getTime()).format('yyyy-MM-dd')}`
  return [sMonth, lMonth]
}

function computeMonthDays(stime, etime) {
  let month1 = [1, 3, 5, 7, 8, 10, 12] // 31天的月份
  let month2 = [4, 6, 9, 11] // 30天的月份
  let month_start = Number(stime.split('-')[2])
  let month_end = Number(etime.split('-')[2])
  let searchSMonth = Number(stime.split('-')[1])
  let searchEMonth = Number(etime.split('-')[1])
  let daysArr = []
  let days = 0
  let len = 0
  if (month1.includes(Number(searchSMonth))) {
    len = 31
  } else if (month2.includes(Number(searchSMonth))) {
    len = 30
  } else {
    len = (searchYear[0] % 4 == 0 && searchYear[0] % 100 !== 0 || searchYear[0] % 400 == 0) ? 29 : 28
  }

  if (month_start < month_end) {
    days = month_end - month_start + 1
  } else if (month_start == month_end && searchEMonth == searchSMonth){
    days = 1
  } else {
    days = len + 1 - month_start + month_end
  }
  for (let j = month_start; j < (days + month_start); j++) {
    if (j > len) {
      daysArr.push(j % len)
    } else {
      daysArr.push(j)
    }
  }
  return {
    days: days,
    daysArr: daysArr,
    month_start: month_start,
    month_end: month_end
  }
}

//根据类型返回正确的时间格式  2019-5-15 lmj
function formatTime(date, type) {
  let times = new Date(date).getTime()
  if (isNaN(times)) return date
  return type === 'DATETIME' ? new Date(date).format('yyyy-MM-dd hh:mm:ss') : new Date(date).format('yyyy-MM-dd')
}

//数字与文字转换，传入value是中文字符时，需要转换成数字，则type === 'key'
function noTurnTxt(sheetName, nameTxt, value, type) {
  if (numberTurnText.hasOwnProperty(sheetName)) {
    let hasTurnName = numberTurnText[sheetName][nameTxt]
    if (hasTurnName) {
      if (type) {
        let values = Object.values(hasTurnName)
        let keys = Object.keys(hasTurnName)
        return keys[values.indexOf(value)]
      } else {
        return hasTurnName[value]
      }
    }
  }
  if (nameTxt === 'y') {
    value = -Number(value)
  }
  if (sheetName === 'vehicle_type' && nameTxt === 'vehicle_level_id' && value === 0) {
    return ' '
  }
  if (sheetName === 'reader_path_tof_n' && nameTxt === 'reader_id') {
    return xdata.metaStore.getNameByID('reader_id', value)
  }
  if (sheetName === 'patrol_path' && name === 'patrol_type_id') {
    let pathTypeData = Array.from(xdata.metaStore.data.patrol_path_type)
    pathTypeData.filter(item => {
      if (item[1].patrol_type_id === value) {
        value = item[1].name
      }
    })
  }
  return value
}

function getIpNum(ipAddress) {
  let ip = ipAddress.split(".")
  let a = parseInt(ip[0])
  let b = parseInt(ip[1])
  let c = parseInt(ip[2])
  let d = parseInt(ip[3])
  let ipNum = a * 256 * 256 * 256 + b * 256 * 256 + c * 256 + d
  return ipNum
}

function isInnerIP(userIp, begin, end) {
  return (userIp >= begin) && (userIp <= end)
}

// 判断是内网还是外网访问
function judgeURL(IP) {
  let userIP = IP || xdata.userIP
  let reg = /(http|ftp|https|www):\/\//g //去掉前缀
  let isInner = true
  if (userIP) {
    userIP = userIP.replace(reg, '')
    let reg1 = /\:+/g //替换冒号为一点
    userIP = userIP.replace(reg1, '.')
    userIP = userIP.split('.')
    let ipAddress = `${userIP[0]}.${userIP[1]}.${userIP[2]}.${userIP[3]}`
    let ipNum = getIpNum(ipAddress)
    let ips = xdata.metaStore.data.ip_address && Array.from(xdata.metaStore.data.ip_address.values())
    ips = ips ? ips : []
    for (let i = 0; i < ips.length; i++) {
      let ip = ips[i]
      let begin = ip.ip_begin && getIpNum(ip.ip_begin)
      let end = ip.ip_end && getIpNum(ip.ip_end)
      isInner = isInnerIP(ipNum, begin, end)
      if (isInner) {
        // return isInner
        break
      }
    }
  }
  console.log('是否是内网:' + isInner)
  return isInner
}

// 获取年月日 年月 月初1号 次月1号 2019-05-21 chenl
function getAllTime() {
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  let day = now.getDate()
  let date = year + '-' + month + '-' + day
  let earlyMonth = year + '-' + month + '-' + '01'
  let endMonth = year + '-' + (month + 1) + '-' + '01'
  let _month = `${year}-${month}`
  if (month === 12) {
    endMonth = (year + 1) + '-' + '1-1'
  }
  let data
  return data = {
    date: date, // 年、月、日
    month: _month, // 年、月
    earlyMonth: earlyMonth, // 月初1号
    endMonth: endMonth // 次月1号
  }
}

//获取排序文字名称 2019-05-20 chenl
function checkClick(target, nodename) {
  if (nodename === 'th') {
    return target.firstElementChild && target.firstElementChild.innerText
  } else if (nodename === 'span') {
    return target.innerText
  } else if (nodename === 'img') {
    return target.parentElement.querySelector('span').innerText
  }
}

function show(root) {
  let ele = root.querySelector('.dlg-window').classList
  let dlBgEle = root.querySelector('.dlg-bg').classList
  dlBgEle.remove('zoomNone')
  dlBgEle.add('zoomToOut')
  ele.add('zoomIn')
  ele.remove('zoomOut')
}

function fontDataChange(update) {
  if (window.localStorage.fontDataNumber) {
    let fontDataParse = JSON.parse(window.localStorage.fontDataNumber)
    window.FONT_SIZE = fontDataParse[0].fontSize
    window.PAGE_SIZE = fontDataParse[0].dataNumber
  } else {
    let fontDataNumber = [{
      id: 1,
      fontSize: 1,
      dataNumber: 10
    }]
    window.FONT_SIZE = fontDataNumber[0].fontSize
    window.PAGE_SIZE = fontDataNumber[0].dataNumber
    let fontDataStringify = JSON.stringify(fontDataNumber)
    window.localStorage.setItem('fontDataNumber', fontDataStringify)
  }
  document.getElementsByTagName('html')[0].style.fontSize = (FONT_SIZE * 16) + 'px'
  if (update) {
    let msg = {
      value: 'success',
      tip: '修改成功'
    }
    window.hintip.open(msg)
  }
}

// 模糊搜索
function searchList(evt, root) {
  let target = evt.currentTarget
  let searchValue = target.value
  let trackListTags = root.querySelectorAll('.list-item')
  // this.isCardExist = false
  let regString = 'n*' + searchValue + 'n*'
  let Reg = new RegExp(regString, 'i')
  let noresult = root.querySelector('.noresult')
  let resultArr = []
  if (trackListTags) {
    for (let i = 0; i < trackListTags.length; i++) {
      let cardName = trackListTags[i].getAttribute('data-name')
      let cardSpell = trackListTags[i].getAttribute('card-spell').toLowerCase()
      if ((!Reg.test(cardName) && !Reg.test(cardSpell)) || cardName === null) {
        trackListTags[i].style.display = 'none'
      } else {
        trackListTags[i].style.display = 'block'
        resultArr.push(trackListTags[i])
      }
    }
  }
  if (resultArr.length <= 0) {
    noresult && noresult.classList.remove('hide')
  } else {
    noresult && noresult.classList.add('hide')
  }
}

/**
 * @description: 格式化修改后的分站的信息
 * @param {type} 
 * @return: 
 */

function formartReaderPath(msg, data) {
  let coods = data
  let pmessage = []
  for (let i = 0; i < coods.length - 1; i++) {
    let _msg = clone(msg)
    for (let j = 0; j < _msg.rows.length; j++) {
      if (_msg.rows[j].field_name === 'b_x') {
        _msg.rows[j].field_value = coods[i][0]
      }
      if (_msg.rows[j].field_name === 'b_y') {
        _msg.rows[j].field_value = coods[i][1]
      }
      if (_msg.rows[j].field_name === 'e_x') {
        _msg.rows[j].field_value = coods[i + 1][0]
      }
      if (_msg.rows[j].field_name === 'e_y') {
        _msg.rows[j].field_value = coods[i + 1][1]
      }
      if (_msg.rows[j].field_name === 'spacing_ratio') {
        _msg.rows[j].field_value = 0
      }
    }
    pmessage.push(_msg)
  }
  return pmessage
}
/**
 * @description: 显示分站编辑窗口
 * @param {type} 
 * @return: 
 */
function showReaderDialog(msg, amsg, pmsg, coord) {
  let readerDialog
  if (readerDialog) {
    readerDialog.unmount(true)
  }
  readerDialog = coord ? riot.mount('reader-dialog', {
    message: msg,
    amessage: amsg,
    pmessage: pmsg,
    coord: coord
  })[0] : riot.mount('reader-dialog', {
    message: msg,
    amessage: amsg,
    pmessage: pmsg
  })[0]
}

/**
 * @description: 给分站覆盖范围隐藏的录入的字段赋值
 */
function getReaderPathMsg(msg, pmsg, i, length) {
  let index = i
  let rows1 = msg.rows
  let rows2 = pmsg.rows
  for (let i = 0; i < rows1.length; i++) {
    for (let j = 0; j < rows2.length; j++) {
      if (rows1[i].field_name === rows2[j].field_name && rows2[j].field_name === 'reader_id') {
        rows2[j].field_value = rows1[i].field_value
      }
      if (rows2[j].field_name === 'b_z') {
        rows2[j].field_value = 0
      }
      if (rows2[j].field_name === 'e_z') {
        rows2[j].field_value = 0
      }
    }
  }
  return pmsg
}

function getDaysBetween(dateString1,dateString2){
  var  startDate = Date.parse(dateString1);
  var  endDate = Date.parse(dateString2);
  var days=(endDate - startDate)/(1*24*60*60*1000);
  return  days;
}

function encrypt (username, userpwd, salt) {
  let value = salt ? `${username}-${userpwd}:${salt}` : `${username}-${userpwd}`
  const start = 5, end = 16
  return md5(value).slice(start, end)
}

function editDetail (fieldName, value, detail, tableName, table) {
  let defs = xdata.metaStore.defs[tableName], fields = defs.fields, names = fields.names, labels = fields.labels
  let index = names.indexOf(fieldName)
  if (index < 0 && table) {
    defs = xdata.metaStore.defs[table], fields = defs && defs.fields, names = defs && fields.names, labels = defs && fields.labels
    index = names && names.indexOf(fieldName)
  }
  let label = labels && labels[index]
  if (label) detail += `${label}:${value};`
  return detail
}

function getSqlByIsCheck(tableName,sqlString) {
  if (/^person/.test(tableName) && xdata.isCheck === 1) {
    if (tableName === 'person_reader_detail'){
      sqlString.staff.alarmSql = sqlString.staff.alarmSql.replace(/_dept/g, '_dept_ck').replace(/_staff_extend/g, '_staff_extend_ck')
    } else {
      sqlString = sqlString.replace(/_dept/g, '_dept_ck').replace(/_staff_extend/g, '_staff_extend_ck')
    }
  }
  return sqlString
}

function judgeAreaIsneedDisplay(obj) {
  let areaID = obj.area_id
  let areas = xdata.metaStore.data.area
  let deviceArea = areas && areas.get(areaID)
  let deviceAreaNeedDisplay = deviceArea && parseInt(deviceArea.need_display, 10)
  if (xdata.isCheck === 1 && deviceAreaNeedDisplay === 0) return false
  return true
}

function getMapCheckOrNot(isCheck) {
  isCheck = isCheck || xdata.isCheck
  if (isCheck === 1) {
    let params = {
      'LAYERS': 'gh-duiwai-m-y:gh-duiwai-m-y',
      'TILED': 'false'
    }
    let map = {
      id: 5,
      type: 'wms',
      tileWmsOpts: {
        url: 'http://60.220.238.152:1101/geoserver/gh-duiwai-m-y/wms',
        params: params,
        serverType: 'geoserver'
      },
      viewOpts: {
        center: [4727, -51],
        size: [768, 300],
        zoom: ZOOM_LEVEL.SMALL,  // default zoom
        maxZoom: ZOOM_LEVEL.MAX,
        minZoom: ZOOM_LEVEL.MIN
      }
    }
    let row = {
      defalut_map: '是',
      height: 300,
      inner_url: 'http://192.168.118.198:9800/geoserver/gh-duiwai-m-y/wms',
      judge_id: 0,
      layers: 'gh-duiwai-m-y:gh-duiwai-m-y',
      map_id: 5,
      map_type: 'wms',
      matrixId: '',
      maxX: 8446,
      maxY: 1241,
      minX: 1298,
      minY: -1883,
      name: '高河地图',
      scale: 2,
      spy: 'GHDT',
      url: 'http://60.220.238.152:1101/geoserver/gh-duiwai-m-y/wms',
      width: 768,
      x: 4727,
      y: -51
    }
    return {map, row}
  }
  return false
}

function testMapID (testMapID, defaultMapID) {
  if (testMapID === defaultMapID) return true
  return true
}

// 获取传入直线的最近的路径
function getPathshortPath (pointObj, pathGather, length) {
  let roadPathGather = clone(pathGather)
  roadPathGather=roadPathGather.map(item =>{
    let bpoint = item.bpoint.split(',')
    item.bpoint= {
      x: Number(Number(bpoint[0]).toFixed(1)),
      y: -Number(Number(bpoint[1]).toFixed(1)),
    }
    let epoint = item.epoint.split(',')
    item.epoint= {
      x: Number(Number(epoint[0]).toFixed(1)),
      y: -Number(Number(epoint[1]).toFixed(1)),
    }
    let disAS = pointToLineDistance(pointObj.start_point.x,pointObj.start_point.y,item.bpoint.x,item.bpoint.y,item.epoint.x,item.epoint.y)[0]
    let disAE = pointToLineDistance(pointObj.end_point.x,pointObj.end_point.y,item.bpoint.x,item.bpoint.y,item.epoint.x,item.epoint.y)[0]
    item.distance = disAS >= disAE ? disAE :  disAS
    return item
  })

  roadPathGather.sort(function (a,b) {
    return a.distance - b.distance
  })
  return roadPathGather.splice(0,length)
}

/** 
 * 获取传入坐标点的最近的路径
 * pointObj: 传入的坐标点 {x: 100, y: 100}
 * pathGather: 路径表
 * length: 需要返回的路径条数
*/
function getPointshortPath (pointObj, pathGather, length) {
  let roadPathGather = clone(pathGather)
  roadPathGather=roadPathGather.map(item =>{
    let bpoint = item.bpoint.split(',')
    item.bpoint= {
      x: Number(Number(bpoint[0]).toFixed(1)),
      y: -Number(Number(bpoint[1]).toFixed(1)),
    }
    let epoint = item.epoint.split(',')
    item.epoint= {
      x: Number(Number(epoint[0]).toFixed(1)),
      y: -Number(Number(epoint[1]).toFixed(1)),
    }
    let disAS = pointToLineDistance(pointObj.x,pointObj.y,item.bpoint.x,item.bpoint.y,item.epoint.x,item.epoint.y)[0]
    item.distance = disAS
    return item
  })

  roadPathGather.sort(function (a,b) {
    return a.distance - b.distance
  })
  return roadPathGather.slice(0,length)
}

  /*求点到直线的距离函数
  * xx,yy 所画线段x,y
  */
function pointToLineDistance (xx, yy, x1, y1, x2, y2) {
  let ang1, ang2, ang, m;
  let result = 0;

  // 分别计算三条边的长度
  const a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy));
  if (a === 0) {
    return [0, {
      x: x1,
      y: y1
    }];
  }
  const b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy));
  if (b === 0) {
    return [0, {
      x: x2,
      y: y2
    }];
  }
  const c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  // 如果线段是一个点则退出函数并返回距离
  if (c === 0) {
    result = a;
    return [result, {
      x: x1,
      y: y1
    }];
  }

  // 如果点(xx,yy到点x1,y1)这条边短
  if (a < b) {
    // 如果直线段AB是水平线。得到直线段AB的弧度
    if (y1 === y2) {
      if (x1 < x2) {
        ang1 = 0;
      } else {
        ang1 = Math.PI;
      }
    } else {
      m = (x2 - x1) / c;
      if (m - 1 > 0.00001) {
        m = 1;
      }

      ang1 = Math.acos(m);
      if (y1 > y2) {
        ang1 = Math.PI * 2 - ang1;
      } // 直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度
    }

    m = (xx - x1) / a;
    if (m - 1 > 0.00001) {
      m = 1;
    }

    ang2 = Math.acos(m);
    if (y1 > yy) {
      ang2 = Math.PI * 2 - ang2;
    } // 直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度

    ang = ang2 - ang1;
    if (ang < 0) {
      ang = -ang;
    }

    if (ang > Math.PI) {
      ang = Math.PI * 2 - ang;
    }

    // 如果是钝角则直接返回距离
    if (ang > Math.PI / 2) {
      return [a, {
        x: x1,
        y: y1
      }];
    }

    // 返回距离并且求得当前距离所在线段的坐标
    if (x1 === x2) {
      return [b * Math.sin(ang), {
        x: x1,
        y: yy
      }];
    } else if (y1 === y2) {
      return [b * Math.sin(ang), {
        x: xx,
        y: y1
      }];
    }

    // 直线的斜率存在且不为0的情况下
    let x = 0,
      y = 0;
    const k1 = ((y2 - y1) / (x2 - x1));
    const kk = -1 / k1;
    const bb = yy - xx * kk;
    const b1 = y2 - x2 * k1;
    x = (b1 - bb) / (kk - k1);
    y = kk * x + bb;
    return [a * Math.sin(ang), {
      x:Number(x.toFixed(1)),
      y:Number(y.toFixed(1))
    }];
  }
  // 如果两个点的纵坐标相同，则直接得到直线斜率的弧度
  if (y1 === y2) {
    if (x1 < x2) {
      ang1 = Math.PI;
    } else {
      ang1 = 0;
    }
  } else {
    m = (x1 - x2) / c;
    if (m - 1 > 0.00001) {
      m = 1;
    }
    ang1 = Math.acos(m);
    if (y2 > y1) {
      ang1 = Math.PI * 2 - ang1;
    }
  }
  m = (xx - x2) / b;
  if (m - 1 > 0.00001) {
    m = 1;
  }

  ang2 = Math.acos(m); // 直线(x2-x1)-(xx,yy)斜率的弧度
  if (y2 > yy) {
    ang2 = Math.PI * 2 - ang2;
  }

  ang = ang2 - ang1;
  if (ang < 0) {
    ang = -ang;
  }

  if (ang > Math.PI) {
    ang = Math.PI * 2 - ang;
  } // 交角的大小

  // 如果是对角则直接返回距离
  if (ang > Math.PI / 2) {
    return [b, {
      x: x2,
      y: y2
    }];
  }

  // 如果是锐角，返回计算得到的距离,并计算出相应的坐标
  if (x1 === x2) {
    return [b * Math.sin(ang), {
      x: x1,
      y: yy
    }];
  } else if (y1 === y2) {
    return [b * Math.sin(ang), {
      x: xx,
      y: y1
    }];
  }

  // 直线的斜率存在且不为0的情况下
  let x = 0,
    y = 0;
  const k1 = ((y2 - y1) / (x2 - x1));
  const kk = -1 / k1;
  const bb = yy - xx * kk;
  const b1 = y2 - x2 * k1;
  x = (b1 - bb) / (kk - k1);
  y = kk * x + bb;
  return [b * Math.sin(ang), {
    x:Number(x.toFixed(1)),
    y:Number(y.toFixed(1))
  }];
}


/**
 * 计算分站覆盖范围信息的每个路径的拐点
 */
function dealRowsTow (rows) {
  let result = rows.sort(function(a, b){return b.rows[3].field_value-a.rows[3].field_value})
  for (let index = 0, len = result.length; index < len; index++) {
      let item = result[index]
      item.cmd = 'INSERT'
      if (len === 1) {
          item.rows[2].field_value = 0
      } else if (len === 2 || len === 3) {
          let indexArr = [1, -1, -2]
          item.rows[2].field_value = indexArr[index]
      } else if (len === 4) {
          let indexArr = [2, 1, -1, -2]
          item.rows[2].field_value = indexArr[index]
      }
  }
  return result
}

/**
 * 通过分站数据以及路径集表，获取最近的一条路径
 * 用来分站覆盖范围基本信息中增加路径使用
 */
function getPathMsg(readerRow, pathGatherArr, cmd) {
  let pathGather = clone(pathGatherArr)
  let readPoint = {
      x: Number(readerRow[6].field_value),
      y: cmd === 'INSERT' ? Number(readerRow[7].field_value) : -Number(readerRow[7].field_value)
  }
  let shortPath = getPointshortPath(readPoint, pathGather, 1)[0]
  let modifyData = [[shortPath.bpoint.x, -shortPath.bpoint.y], [shortPath.epoint.x, -shortPath.epoint.y]]
  let ptable = {
      def: xdata.metaStore.defs['reader_path_tof_n'],
      rows: xdata.metaStore.dataInArray.get('reader_path_tof_n'),
      maxid: xdata.metaStore.maxIDs['reader_path_tof_n']
  }
  let rows = getRows(null, ptable.def, ptable.maxid)
  let msg = getMessage('INSERT', rows, ptable.def, ptable.maxid)
  let pmessage = formartReaderPath(msg, modifyData)
  if (!pmessage[0]) return
  pmessage = getReaderPathMsg({rows:readerRow},pmessage[0])
  return pmessage
}

export {
  toJson,
  clone,
  delay,
  handleEvent,
  adjustFontSize,
  isValidID,
  formatElapsedTime,
  isPC,
  needDisplay,
  displayByJobNumber,
  compare,
  getRows,
  getMessage,
  trim,
  composeUpdateDBReq,
  getMon,
  getMonth,
  getDeptID,
  objKeySort,
  initPagination,
  getMenus,
  dealMonth,
  getAlarmShow,
  computeDays,
  createChart,
  getShiftByTime,
  getAccessSql,
  getDisplaySql,
  getAreaDisplaySql,
  copySubRows,
  judgeRepeat,
  specialName,
  getSearchData,
  unique,
  getMonthDate,
  computeMonthDays,
  formatTime,
  noTurnTxt,
  getAllTime,
  checkClick,
  show,
  fontDataChange,
  judgeURL,
  formartReaderPath,
  showReaderDialog,
  getReaderPathMsg,
  searchList,
  getDaysBetween,
  encrypt,
  editDetail,
  getSqlByIsCheck,
  judgeAreaIsneedDisplay,
  getMapCheckOrNot,
  testMapID,
  getPathshortPath,
  getPointshortPath,
  pointToLineDistance,
  dealRowsTow,
  getPathMsg
}
