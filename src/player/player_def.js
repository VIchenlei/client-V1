let sqlDefs = {
  'staff': {
    sql: `select hed.event_type_id, date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s") as start_time, date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s") as end_time, de.dept_id, de.staff_id, de.card_id, hed.dis_type from (select * from his_event_data where stat=0) hed left join (select event_id, obj_id, cur_time from his_event_data where stat=100) hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id inner join dat_staff_extend de on hed.obj_id = de.card_id left join dat_staff dd on de.staff_id = dd.staff_id left join dat_event_type dt on hed.event_type_id = dt.event_type_id where 1=1 {exprString}`
  },
  'vehicle': {
    sql: `select hed.event_type_id, date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s") as start_time, date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s") as end_time, de.dept_id, de.vehicle_id, de.card_id, hed.dis_type from (select * from his_event_data where stat=0) hed left join (select event_id, obj_id, cur_time from his_event_data where stat=100) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend de on de.card_id = hed.obj_id where 1=1 {exprString} order by hed.cur_time desc`
  }
}

export {sqlDefs}