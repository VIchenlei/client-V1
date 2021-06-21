import {getMon} from '../utils/utils'
let reptQueryUntils = {
  getTime: function (nhour) {
    let stime = ''
    let hours = parseInt(nhour, 10)
    let now = new Date()
    let time = new Date(now.getTime() - hours * 60 * 60 * 1000)
    stime = '"' + time.format('yyyy-MM-dd hh:mm:ss') + '"'
    return stime
  },
  getDayTime: function (field = '') {
    let time = new Date().format('yyyy-MM-dd')
    let beforeTime = new Date() - 24 * 60 * 60 * 1000
    beforeTime = new Date(beforeTime).format('yyyy-MM-dd')
    let shift = xdata.metaStore.data.shift && xdata.metaStore.data.shift.get(1)
    let shiftime = shift ? shift.start_time : '23:59:59'
    return `${field} between '${beforeTime} ${shiftime}' and '${time} 23:59:59'`
  },
  getDay: function (field = '') {
    let stime = ''
    let now = new Date()
    stime = `${field} = "${now.format('yyyy-MM-dd')}"`
    return stime
  },
  getDat: function (field) {
    let stime = ''
    let now = new Date()
    let _year = now.getFullYear()
    let _mon = now.getMonth() + 1
    let _day = now.getDate()
    if (_mon < 11) {
      _mon = '0' + _mon
    }
    stime = field + '=' + '"' + _year + '-' + _mon + '-' + _day + '"'
    return stime
  },
  getMonth: function (field = '', nMonth) { // nMonth: yyyy-MM
    let y = nMonth ? nMonth.split('-')[0] : new Date().getFullYear()
    let m = nMonth ? nMonth.split('-')[1] : new Date().getMonth() + 1
    // 月初
    let sMonth = nMonth ? `${nMonth}-01 00:00:00` : `${new Date(new Date().getTime()).format('yyyy-MM')}-01 00:00:00` 
    // 月底
    let lMonth = `${new Date(new Date(y, m, 1).getTime()).format('yyyy-MM-dd')} 00:00:00`
    return `${field} between '${sMonth}' and '${lMonth}'`
  },
  getMon: function (field) {
    let stime = ''
    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth()
    let year2 = year
    if (month === 0) { // 如果是1月份，则取上一年的12月份
      year2 = parseInt(year2) - 1
      month = 12
    }
    if (month < 10) {
      month = '0' + month
    }
    stime = field + '=' + '"' + year2 + '-' + month + '"'
    return stime
  },
  getWeek: function (field = '') {
    let now = new Date()
    let time =new Date(now.getTime() - 7*24*60*60*1000).format('yyyy-MM-dd hh:mm:ss');
    return `${field} between '${time}' and '${now.format('yyyy-MM-dd hh:mm:ss')}'`
  },
  getHour: function () {
    let now = new Date()
    let time =new Date(now.getTime() - 1*60*60*1000).format('yyyy-MM-dd hh:mm:ss');
    return `(ras.start_time between '${time}' and '${now.format('yyyy-MM-dd hh:mm:ss')}' or ras.end_time between '${time}' and '${now.format('yyyy-MM-dd hh:mm:ss')}')`
  },
  intervalTime: function (fieldStart, fieldEnd) {
    let now = new Date()
    let time =new Date(new Date(new Date(new Date().toLocaleDateString()).getTime())).format('yyyy-MM-dd hh:mm:ss');
    return ` ${fieldStart} >= '${time}' and ${fieldEnd} <= '${now.format('yyyy-MM-dd hh:mm:ss')}'`
  },
  momentTime: function (fieldStart, fieldEnd) {
    let now = new Date()
    return ` ${fieldStart} >= '${new Date().format('yyyy-MM-dd 00:00:00')}' and ${fieldStart} <= '${now.format('yyyy-MM-dd hh:mm:ss')}' and (${fieldEnd} >= '${now.format('yyyy-MM-dd hh:mm:ss')}' or ${fieldEnd} is null)`
  },
  pmomentTime: function (firstFieldStart, firstFieldEnd, secondFieldStart, secondFieldEnd) {
    let now = new Date().format('yyyy-MM-dd hh:mm:ss')
    return {
      exprString1: ` ${firstFieldStart} <= '${now}' and (${firstFieldEnd} >= '${now}' or ${firstFieldEnd} is null)`,
      exprString2: ` ${secondFieldStart} <= '${now}' and (${secondFieldEnd} >= '${now}' or ${secondFieldEnd} is null)`
    }
  },
  curretTime: function (field = '') {
    let now = new Date()
    let time =new Date(new Date(new Date(new Date().toLocaleDateString()).getTime())).format('yyyy-MM-dd hh:mm:ss');
    return `${field} between '${time}' and '${now.format('yyyy-MM-dd hh:mm:ss')}'`
  },
  dealMonth: function  (field = '') {
    let time = getMon()
    let month_data = xdata.metaStore.data.month && Array.from(xdata.metaStore.data.month.values())
    let month_start = month_data && month_data[0].start_time
    let month_end = month_data && month_data[0].end_time
    let choose_year = new Date(time).getFullYear()
    let endYear = choose_year
    let choose_month = new Date(time).getMonth() + 1
    let endMonth = choose_month
    let month_num = new Date(choose_year,choose_month,0).getDate() 
    month_start = month_start >= month_num ? month_num : month_start
    month_end = month_end >= month_num ? month_num : month_end
    if(month_start >= month_end){
        if(choose_month === 12){
            endMonth = 1
            end_year = choose_year + 1
        }else{
            endMonth = choose_month + 1
        }
    }
    let choose_start = new Date(time).format('yyyy-MM') + '-' + month_start
    let choose_end = endYear + '-' + endMonth + '-' + month_end
    return `${field} between "${choose_start}" and "${choose_end}"`
  }
}
export default reptQueryUntils
