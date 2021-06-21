/*
 * @Description: 报表页面专用工具函数js文件
 * @Author: tangyue
 * @since: 2019-05-27 09:47:21
 * @lastTime: 2019-06-27 18:25:47
 * @LastAuthor: tangyue
 */

function getSql (def, choosed, earlyTime, currentTime) {
  let readers = ''

  if (def.msg.reader_id) {
    def.msg.reader_id.forEach(reader => {
      readers += ` or dr.reader_id = ${reader.reader_id}`
    })
    readers = readers.replace('or', '')
  }
  
  let sqlTmpl = {
    vehicle: {
      v_reader: {
        isReaders: `and (${readers}) AND hlas.enter_time>= '${earlyTime}' and hlas.enter_time <= '${currentTime}'`,
        notReaders: `and ds.vehicle_id = ${choosed && choosed.vehicle_id} and hlas.enter_time >= '${earlyTime}' and hlas.enter_time <= '${currentTime}'`
      },
      vehicle_updown_mine: `and dv.vehicle_id = ${choosed && choosed.vehicle_id} and dv.vehicle_type_id = ${choosed && choosed.vehicle_type_id} and rav.start_time >= '${earlyTime}' and rav.end_time <= '${currentTime}'`
    },
    staff: {
      person_reader: {
        isReaders: `and (${readers}) AND hlas.enter_time>= '${earlyTime}' and hlas.enter_time <= '${currentTime}'`,
        notReaders: `and ds.staff_id = ${choosed && choosed.staff_id} and hlas.enter_time >= '${earlyTime}' and hlas.enter_time <= '${currentTime}'`
      },
      person: `and ds.staff_id = ${choosed && choosed.staff_id} and dse.dept_id = ${choosed && choosed.dept_id} and dse.occupation_id = ${choosed && choosed.occupation_id} and ras.start_time >= '${earlyTime}' and ras.end_time <= '${currentTime}'`
    }
  }
  let sql = sqlTmpl[def.msg.name][def.msg.report]
  if (typeof sql === 'object') {
    if (def.msg.reader_id) return sql.isReaders
    return sql.notReaders
  }
  return sql
}

/**
 * @description: 修改def配置
 * @param {type} def
 * @return: 
 */
function searchchoose (def) {
  let sqlfield = null
  let sqlexpr = null
  let arr = null
  let currentTime = def.msg.endTime || `${new Date().format('yyyy-MM-dd')} 00:00:00`
  let earlyTime = def.msg.startTime || `${new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).format('yyyy-MM-dd')} 23:59:59`
  let cardID = def.msg.cardID
  let choosed = xdata.metaStore.getCardBindObjectInfo(cardID)
  def.autoExec = true
  let sqlnames = def.fields.names
  for (let i = 0, len = sqlnames.length; i < len; i++) {
    if (i === 0) {
      sqlfield = sqlnames[i]
    } else {
      sqlfield += ',' + sqlnames[i]
    }
  }
  sqlexpr = getSql(def, choosed, earlyTime, currentTime)
  // if (def.msg.report === 'person_reader' || def.msg.report === 'v_reader') {
  //   let expr = def.msg.report === 'person_reader' ? `ds.staff_id = ${choosed.staff_id}` : `ds.vehicle_id = ${choosed.vehicle_id}`
  //   sqlexpr = `and ${expr} and hlas.enter_time >= '${earlyTime}' and hlas.leave_time <= '${currentTime}'`
  //   arr = def.msg.report === 'person_reader' ? {
  //     staff_id: choosed.staff_id
  //   } : {
  //     vehicle_id: choosed.vehicle_id
  //   }
  // } else if (def.msg.name === 'vehicle') {
  //   sqlexpr = `and dv.vehicle_id = ${choosed.vehicle_id} and dv.vehicle_type_id = ${choosed.vehicle_type_id} and rav.start_time >= '${earlyTime}' and rav.end_time <= '${currentTime}'`
  //   arr = {
  //     vehicle_id: choosed.vehicle_id
  //   }
    
  // } else if (def.msg.name === 'staff') {
  //   sqlexpr = `and ds.staff_id = ${choosed.staff_id} and dse.dept_id = ${choosed.dept_id} and dse.occupation_id = ${choosed.occupation_id} and ras.start_time >= '${earlyTime}' and ras.end_time <= '${currentTime}'`
  //   arr = {
  //     staff_id: choosed.staff_id
  //   }
  // }
  arr = {
    staff_id: choosed && choosed.staff_id,
    vehicle_id: choosed && choosed.vehicle_id,
    dept_id: choosed && choosed.dept_id,
    vehicle_type_id: choosed && choosed.vehicle_id,
    reader_id: def.msg.reader_id,
    defaultTime: [`${earlyTime}`, `${currentTime}`]
  }
  // arr['dept_id'] = choosed.dept_id
  // arr['vehicle_type_id'] = choosed.vehicle_type_id
  // arr['defaultTime'] = [`${earlyTime}`, `${currentTime}`]
  def.sqlTmpl = def.sqlTmpl.replace('{resultFields}', sqlfield).replace('{exprString}', sqlexpr)
  def['choosepreset'] = arr
}

/**
 * @description: 获取每页显示数据条数
 * @param {type} tabName
 * @return: page_size
 */
function reptPageGetPageSize(tabName) {
  let page_size = PAGE_SIZE ? PAGE_SIZE : 10
  const SIZE100000 = ['worktime_dept_shift', 'person_s_dept_month', 'v_vehicle_day', 'person_s_dept_day']
  if (SIZE100000.includes(tabName)) {
    page_size = 100000
  } else if(tabName === 'person_reader_detail') {
    page_size = 0
  }
  return page_size
}
export { searchchoose, reptPageGetPageSize }
