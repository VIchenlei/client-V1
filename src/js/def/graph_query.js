const graphQuery = {
  v_vehicle_day: {
    name: 'v_vehicle_day',
    label: '车辆考勤日报',
    graphType: ['bar'],
    fields: ['人车', '料车', '特种车'],
    sqlTmpl: 'select date_format(rav.start_time, "%Y-%m-%d %H:%i") as date,ds.shift_id shiftId,ds.short_name shiftName,dvc.vehicle_category_id categoryId,dvc.name,count(*) mcount from rpt_att_vehicle rav left join dat_shift ds on ds.shift_id = rav.shift_id left join dat_vehicle v on rav.vehicle_id = v.vehicle_id left join dat_vehicle_type dvt on dvt.vehicle_type_id = v.vehicle_type_id left join dat_vehicle_category dvc on dvc.vehicle_category_id = dvt.vehicle_category_id where {exprString} AND FORMAT(TIMESTAMPDIFF(MINUTE, rav.start_time, rav.end_time)/60.0, 1) >= "0.5" group by dvc.vehicle_category_id,rav.att_date,ds.shift_id order by rav.att_date,ds.shift_id',
    exprFields: ['rav.start_time', 'rav.start_time'],
    exprCond: ['>=', '<='],
    indexField: 'categoryId',
    countField: 'mcount'
  },
  v_vehicle_month: {
    name: 'v_vehicle_month',
    label: '车辆考勤月报',
    tipText: '考勤次数',
    graphType: ['pie', 'line'],
    fields: ['人车', '料车', '特种车'],
    sqlTmpl: 'select rav.card_id,dvc.vehicle_category_id categoryId,dvc.name,rav.att_date,count(*) as mcount from rpt_att_vehicle rav left join dat_vehicle dv on dv.vehicle_id = rav.vehicle_id left join dat_vehicle_type dvt on dvt.vehicle_type_id = dv.vehicle_type_id left join dat_vehicle_category dvc on dvc.vehicle_category_id = dvt.vehicle_category_id where {exprString} group by dvc.vehicle_category_id,rav.att_date',
    exprFields: ['rav.att_date','rav.att_date'],
    exprCond: ['>=', '<='],
    unit: '次数',
    indexField: 'categoryId',
    countField: 'mcount'
  },
  person_month: {
    name: 'person_month',
    label: '人员考勤月报',
    graphType: ['pie', 'line'],
    fields: ['0点班', '8点班', '4点班'],
    sqlTmpl: 'select ras.card_id,ras.att_date,ras.shift_id shiftId,ds.short_name,count(*) mcount from rpt_att_staff ras left join dat_shift ds on ds.shift_id = ras.shift_id left join dat_staff_extend dse on dse.staff_id = ras.staff_id where {exprString} and dse.staff_id is not null group by ras.att_date,ras.shift_id order by ras.att_date,ras.shift_id',
    exprFields: ['ras.att_date', 'ras.att_date'],
    exprCond: ['>=', '<='],
    unit: '次数',
    indexField: 'shiftId',
    countField: 'mcount'
  },
  driver_dept_month: {
    name: 'driver_dept_month',
    label: '里程月报',
    graphType: ['line'],
    fields: ['里程'],
    sqlTmpl: 'select cal_date att_date,sum(miles) miles from cal_miles_and_times_day_driver where {exprString} group by cal_date order by cal_date;',
    exprFields: ['cal_date'],
    exprCond: ['='],
    unit: '里程(km)',
    countField: 'miles'
  },
  driver_dept_month_two: {
    name: 'driver_dept_month',
    label: '超速统计',
    graphType: ['bar'],
    fields: ['超速次数'],
    sqlTmpl: 'select v.card_id,dda.name name,count(*) mcount from (select * from his_event_data where stat=0 and (event_type_id = 22 or event_type_id = 21)) hed left join (select event_id, cur_time from his_event_data where stat=100 and (event_type_id = 22 or event_type_id = 21)) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v on v.card_id = hed.obj_id left join dat_vehicle dv on dv.vehicle_id = v.vehicle_id left join  (select shift_id,start_time, end_time from dat_shift where shift_type_id = 1) s on (((s.start_time < s.end_time) and (time(hed.cur_time)  >= s.start_time and time(hed.cur_time)  < s.end_time)) or ((s.start_time > s.end_time) and (time(hed.cur_time) >=s.start_time or time(hed.cur_time) <s.end_time))) left join dat_driver_arrange dda on dda.vehicle_id = v.vehicle_id and dda.driver_date = date(hed.cur_time) and dda.shift_id = s.shift_id where 1=1 and dda.name is not null {exprString} group by v.card_id order by hed.cur_time desc;',
    exprFields: ['date_format(hed.cur_time,"%Y-%m")'],
    exprCond: ['='],
    unit: '次数',
    countField: 'mcount'
  },
  whole_status: {
    name: 'whole_status',
    label: '整体出车情况',
    sqlTmpl: 'SELECT rav.card_id,rav.vehicle_id,rav.start_time,rav.end_time,rav.att_date,rav.shift_id,dvt.vehicle_category_id, TIMESTAMPDIFF(MINUTE,rav.start_time,rav.end_time) time_diff,ifnull(hed.mcount,0) over_counts,ifnull(hvo.oli_wear,0) oil_wear FROM rpt_att_vehicle rav LEFT JOIN dat_vehicle dv ON dv.vehicle_id = rav.vehicle_id LEFT JOIN dat_vehicle_type dvt ON dvt.vehicle_type_id = dv.vehicle_type_id LEFT JOIN (select card_id,date_format(cur_time,"%Y-%m-%d") cur_time,oli_wear,case cur_shift when  0 then 1 when  8 then 2 when  4 then 3 else "err" end as cur_shift from his_vehicle_oilwear ) hvo ON hvo.card_id = rav.card_id AND hvo.cur_time = rav.att_date and hvo.cur_shift = rav.shift_id left join (select he.obj_id,date_format(he.cur_time,"%Y-%m-%d") cur_date,he.shift_id,count(*) mcount from (select * from his_event_data e left join (select shift_id,start_time, end_time from dat_shift where shift_type_id = 1) ds on (((ds.start_time < ds.end_time) and (time(e.cur_time) >= ds.start_time and time(e.cur_time)  < ds.end_time)) or ((ds.start_time > ds.end_time) and (time(e.cur_time) >= ds.start_time or time(e.cur_time) < ds.end_time))) where (event_type_id = 22 or event_type_id = 21) and stat = 100) he group by he.obj_id, date_format(he.cur_time,"%Y-%m-%d"),he.shift_id) hed on hed.cur_date = rav.att_date and hed.obj_id = rav.card_id and hed.shift_id = rav.shift_id WHERE {exprString} ;',
    exprFields: ['rav.att_date', 'rav.att_date'],
    exprCond: ['>=', '<='],
  },
  efficiency_overview: {
    name: 'efficiency_overview',
    label: '三率总览',
    sqlTmpl: {
      'overview-boot': `select round(sum(hsr.startup_rate) / count(hsr.startup_rate), 1) as worktime, work_date as stime from his_startup_rate hsr where work_date ${searchTime()}`,
      'overview-worktime': `select ROUND(sum(hwr.worktime_rate) / count(hwr.worktime_rate), 1) as worktime from his_worktime_rate hwr where work_date ${searchTime()}`,
      'overview-rugular': `select round(sum(worktime)/sum(schedule_value)*100, 1) as worktime, stime from(select sum(detail_value) as worktime, schedule_value, work_face_id, date(start_time) as stime from his_regular_cycle_detail where start_time ${searchTime()} and end_time is not null group by work_face_id, stime)aa order by worktime;`,
      'dept_boot': `select workface_id, work_face_type as workface_type, round(sum(startup_rate)/count(startup_rate), 1) as worktime from his_startup_rate hsr, dat_work_face dwf where hsr.workface_id = dwf.work_face_id and work_date ${searchTime()} group by workface_id, work_face_type;`,
      'dept_worktime': `select ROUND(sum(hwr.worktime_rate) / count(hwr.worktime_rate), 1) as worktime,  workface_id, work_face_type as workface_type from his_worktime_rate hwr, dat_work_face dwf where hwr.workface_id = dwf.work_face_id and work_date ${searchTime()} group by workface_id, work_face_type;`,
      'dept_rugular': `select round(sum(worktime)/sum(schedule_value)*100, 1) as worktime, stime, dept_id from (select sum(detail_value) as worktime, schedule_value, work_face_id, date(start_time) as stime, dept_id from his_regular_cycle_detail where start_time ${searchTime()} and end_time is not null group by work_face_id, stime)aa group by dept_id order by worktime;`
    },
    searchTime: `${getMon()}`,
    termTime: `${getMonth()}`,
    autoExec: true
  }
}

function timeDiff() {
  let y = new Date().getFullYear()
  let m = new Date().getMonth() + 1
  let d = new Date().getDate() - 1
  let stime = `${y}-${m}-1`
  let ltime = `${y}-${m}-${d}`
  return `date('${ltime}')-date('${stime}')-1`
}

function searchTime() {
  let y = new Date().getFullYear()
  let m = new Date().getMonth() + 1
  let d = new Date().getDate() - 1
  let stime = `${y}-${m}-1 00:00:00`
  let ltime = `${y}-${m}-${d} 23:59:59`
  if (new Date().getDate() === 1) {
    stime = `${new Date(new Date(y, Number(m)-2, 1).getTime()).format('yyyy-MM-dd')} 00:00:00`
    ltime = `${new Date(new Date(y, Number(m)-1, 1).getTime()).format('yyyy-MM-dd')} 23:59:59`
  }
  return `between '${stime}' and '${ltime}'`
}

function getMon(num) {
  let stime = ''
  let now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  // let year2 = year
  // if (month === 0) { // 如果是1月份，则取上一年的12月份
  //   year2 = parseInt(year2) - 1
  //   month = 12
  // }
  // if (month < 10) {
  //   month = '0' + month
  // }

  stime = `${year}-${month}`
  return stime
}

function getMonth(nMonth) { // nMonth: yyyy-MM
  let y = nMonth ? nMonth.split('-')[0] : new Date().getFullYear()
  let m = nMonth ? nMonth.split('-')[1] : new Date().getMonth()
  let shift = window.xdata && window.xdata.metaStore.data.shift && window.xdata.metaStore.data.shift.get(1)
  let shiftime = shift ? shift.start_time : '21:00:00'
  // 月初
  // let sMonth = nMonth ? `${nMonth}-01 00:00:00` : `${new Date(new Date().getTime()).format('yyyy-MM')}-01 00:00:00` 
  // 上个月1号
  let sMonth = `${new Date(new Date(y, Number(m), 0).getTime()).format('yyyy-MM-dd')} ${shiftime}`
  // 月底
  // let lMonth = `${new Date(new Date(y, m, 1).getTime()).format('yyyy-MM-dd')} 00:00:00`
  // 本月1号
  let lMonth = `${new Date(new Date(y, Number(m) + 1, 1).getTime()).format('yyyy-MM-dd')} 00:00:00`
  if (new Date().getDate() === 1) {
    sMonth = `${new Date(new Date(y, Number(m), 0).getTime()).format('yyyy-MM')}-01 00:00:00`
    lMonth = `${new Date(new Date(y, Number(m), 1).getTime()).format('yyyy-MM-dd')} 00:00:00`
  }
  return `between '${sMonth}' and '${lMonth}'`
}

function getDay(AddDayCount) {
  var dd = new Date()
  dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
  var y = dd.getFullYear()
  var m = dd.getMonth() + 1 //获取当前月份的日期
  var d = dd.getDate()
  return `${y}-${m}-${d}`
}

function getdate(nDay) {
  let today = `${getDay(0)} 00:00:00`
  let yesterday = `${getDay(-1)} 00:00:00`
  return `between '${yesterday}' and '${today}'`
}
export default graphQuery
