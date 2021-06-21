let tables = {
  person_reader_detail: {
    name: 'person_reader_detail',
    label: '人员分站告警明细查询',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: {
      staff: {
        "alarmSql": `select s.staff_id as rsID, ds.name as name, hed.event_type_id as event_type_id, IFNULL(DATE_FORMAT(hed.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as start_time, IFNULL(DATE_FORMAT(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as end_time, "/" AS auto from ( select * from his_event_data where stat = 0 ) hed left join ( select event_id,cur_time, event_type_id from his_event_data where stat = 100 ) hed1 on hed.event_id = hed1.event_id and hed.event_type_id = hed1.event_type_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_staff_extend s ON s.card_id = hed.obj_id left join dat_staff ds ON ds.staff_id = s.staff_id where 1=1 {exprString} order by hed.cur_time desc;`,
        "wellSql": `select s.staff_id as rsID, s.name as name, "升入井" as event_type_id, DATE_FORMAT(ras.start_time, "%Y-%m-%d %H:%i") AS start_time, DATE_FORMAT(ras.end_time, "%Y-%m-%d %H:%i") AS end_time, CASE WHEN ras.is_auto = 0 AND ras.end_time IS NOT NULL THEN "正常" WHEN ras.is_auto = 1 THEN "手动升井" WHEN ras.is_auto = 2 THEN "强制升井" ELSE " " END AS auto from rpt_att_staff ras left join dat_staff s on s.staff_id = ras.staff_id where 1=1 {exprString} order by ras.start_time desc;`
      },
      reader: 'select cast(r.reader_id as signed) as rsID,r.name as name,hed.event_type_id as event_type_id, IFNULL(DATE_FORMAT(hed.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as start_time, IFNULL(DATE_FORMAT(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as end_time, "/" as auto from ( select * from his_event_data where stat=0) hed left join ( select event_id, obj_id, cur_time, event_type_id from his_event_data where stat=100 ) hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id and hed.event_type_id = hed1.event_type_id inner join dat_reader r ON hed.obj_id = r.reader_id where 1=1 {exprString} order by hed.cur_time desc;'
    },
    fields: {
      names: ['rsID', 'name', 'event_type_id', 'start_time', 'end_time', 'auto'],
      types: ['NUMBER', 'STRING', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['ID', '名称', '类型', '开始时间', '结束时间', '升井方式']
    },
    exprFields: [
      { type: 'DATE', selectOptin: [
        {start:{ name: 'hed.cur_time'}, end:{ name: 'hed1.cur_time'}, label: '开始时间-结束时间'}
        ]
      }
    ],
    needBreakdown: false,
    autoExec: false
  }
}

export default tables