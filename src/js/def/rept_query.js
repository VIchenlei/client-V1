let reptQuery = {
  person_hour: {
    name: 'person_hour',
    label: '最近一小时人员出入井',
    //权限识别标识
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_staff ras left join dat_staff ds on ds.staff_id = ras.staff_id left join dat_staff_extend dse on dse.staff_id = ds.staff_id left join dat_shift da on da.shift_id = ras.shift_id INNER JOIN dat_dept dd ON dse.dept_id = dd.dept_id INNER JOIN dat_occupation doc ON dse.occupation_id = doc.occupation_id where 1=1 AND TIMESTAMPDIFF(MINUTE, ras.start_time, IFNULL(ras.end_time, CURRENT_TIMESTAMP())) >= 10 {exprString} order by ras.att_date desc,ras.start_time desc',
    fields: {
      names: ['date_format(ras.att_date,"%Y-%m-%d")', 'ds.staff_id', 'ds.name', 'ras.card_id', 'dd.name as dname', 'doc.name as oname', 'date_format(ras.start_time, "%Y-%m-%d %H:%i:%s") as start_time', 'date_format(ras.end_time, "%Y-%m-%d %H:%i:%s") as end_time', 'CASE WHEN ras.is_auto = 0 and ras.end_time is not null THEN "正常" WHEN ras.is_auto = 1 THEN "手动升井" WHEN ras.is_auto = 2 THEN "强制升井" WHEN ras.is_auto = 3 THEN "自动升井" ELSE " " END as auto', 'Concat(TIMESTAMPDIFF(HOUR, ras.start_time,ifnull(ras.end_time, current_timestamp())), "时",TIMESTAMPDIFF(MINUTE, ifnull(ras.start_time, current_timestamp()),ras.end_time) %60, "分") as retention_time', 'da.short_name', 'CASE WHEN ras.end_time is null then "" when TIMESTAMPDIFF(MINUTE, IFNULL(ras.start_time, CURRENT_TIMESTAMP()),ras.end_time) >= da.min_minutes*60 THEN "是" ELSE "否" END as is_enough'],
      types: ['STRING', 'NUMBER', 'STRING', 'NUMBER', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING'],
      labels: ['日期', '员工编号', '姓名', '卡号', '所属部门', '职务', '入井时间', '升井时间', '升井方式', '工作时长', '班次', '是否足班']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'ras.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dse.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        name: 'ras.is_auto',
        label: '升井方式',
        type: 'NUMBER'
      },
      {
        name: 'is_enough',
        label: '是否足班',
        type: 'RADIO'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'getHour',
        funFields: null
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person: {
    name: 'person',
    label: '人员出入井明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_staff ras left join dat_staff ds on ds.staff_id = ras.staff_id left join dat_staff_extend dse on dse.staff_id = ds.staff_id left join dat_shift da on da.shift_id = ras.shift_id INNER JOIN dat_dept dd ON dse.dept_id = dd.dept_id INNER JOIN dat_occupation doc ON dse.occupation_id = doc.occupation_id left join (select distinct card_id from his_card_batlog where 1=1 {batlogExprString}) aa on dse.card_id = aa.card_id where 1=1 AND TIMESTAMPDIFF(MINUTE, ras.start_time, IFNULL(ras.end_time, CURRENT_TIMESTAMP())) >= 10 {exprString} order by ras.att_date desc,ras.start_time desc',
    fields: {
      names: ['date_format(ras.att_date,"%Y-%m-%d")', 'ds.staff_id', 'ds.name', 'ras.card_id', 'dd.name as dname', 'doc.name as oname', 'dse.lampNo', 'date_format(ras.start_time, "%Y-%m-%d %H:%i:%s") as start_time', 'date_format(ras.end_time, "%Y-%m-%d %H:%i:%s") as end_time', 'CASE WHEN ras.is_auto = 0 and ras.end_time is not null THEN "正常" WHEN ras.is_auto = 1 THEN "手动升井" WHEN ras.is_auto = 2 THEN "强制升井" WHEN ras.is_auto = 3 THEN "自动升井" ELSE " " END as auto', 'Concat(TIMESTAMPDIFF(HOUR, ras.start_time,ifnull(ras.end_time, current_timestamp())), "时",TIMESTAMPDIFF(MINUTE, ifnull(ras.start_time, current_timestamp()),ras.end_time) %60, "分") as retention_time', 'da.short_name', 'CASE WHEN ras.end_time is null then "" when TIMESTAMPDIFF(MINUTE, IFNULL(ras.start_time, CURRENT_TIMESTAMP()),ras.end_time) >= da.min_minutes*60 THEN "是" ELSE "否" END as is_enough', 'aa.card_id is null as isbat'],
      types: ['STRING', 'NUMBER', 'STRING', 'NUMBER', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING'],
      labels: ['日期', '员工编号', '姓名', '卡号', '所属部门', '职务', '灯架号', '入井时间', '升井时间', '升井方式', '工作时长', '班次', '是否足班']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'ras.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dse.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        name: 'ras.is_auto',
        label: '升井方式',
        type: 'NUMBER'
      },
      {
        name: 'is_enough',
        label: '是否足班',
        type: 'RADIO'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.start_time'
            },
            label: '入井时间-入井时间'
          },
          {
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '入井时间-出井时间'
          },
          {
            start: {
              name: 'ras.end_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '出井时间-出井时间'
          }
        ]
      }

    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['ras.start_time', 'ras.start_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_special: {
    name: 'person_special',
    label: '人员出入井明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_staff ras left join dat_staff ds on ds.staff_id = ras.staff_id left join dat_staff_extend dse on dse.staff_id = ds.staff_id left join dat_shift da on da.shift_id = ras.shift_id INNER JOIN dat_dept dd ON dse.dept_id = dd.dept_id INNER JOIN dat_occupation doc ON dse.occupation_id = doc.occupation_id left join (select distinct card_id from his_card_batlog where 1=1 {batlogExprString}) aa on dse.card_id = aa.card_id where 1=1 AND TIMESTAMPDIFF(MINUTE, ras.start_time, IFNULL(ras.end_time, CURRENT_TIMESTAMP())) >= 10 {exprString} order by ras.att_date desc,ras.start_time desc',
    fields: {
      names: ['date_format(ras.att_date,"%Y-%m-%d")', 'ds.staff_id', 'ds.name', 'ras.card_id', 'dd.name as dname', 'dse.lampNo', 'date_format(ras.start_time, "%Y-%m-%d %H:%i:%s") as start_time', 'date_format(ras.end_time, "%Y-%m-%d %H:%i:%s") as end_time'],
      types: ['STRING', 'NUMBER', 'STRING', 'NUMBER', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING'],
      labels: ['日期', '员工编号', '姓名', '卡号', '所属部门', '灯架号', '入井时间', '升井时间']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'ras.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dse.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        name: 'ras.is_auto',
        label: '升井方式',
        type: 'NUMBER'
      },
      {
        name: 'is_enough',
        label: '是否足班',
        type: 'RADIO'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.start_time'
            },
            label: '入井时间-入井时间'
          },
          {
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '入井时间-出井时间'
          },
          {
            start: {
              name: 'ras.end_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '出井时间-出井时间'
          }
        ]
      }

    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['ras.start_time', 'ras.start_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_area: {
    name: 'person_area',
    label: '人员进出区域明细',
    sign: 1,
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_location_area_staff hlas inner join dat_staff ds on ds.staff_id = hlas.obj_id left join dat_area da on da.area_id = hlas.area_id left join dat_staff_extend dse on dse.staff_id = ds.staff_id INNER JOIN dat_dept dd on dse.dept_id = dd.dept_id INNER JOIN dat_occupation doc ON dse.occupation_id = doc.occupation_id INNER JOIN dat_area_type dat ON da.area_type_id = dat.area_type_id INNER JOIN dat_worktype dwt ON dse.worktype_id = dwt.worktype_id where 1=1 AND TIMESTAMPDIFF(MINUTE, hlas.enter_time, IFNULL(hlas.leave_time, CURRENT_TIMESTAMP())) >= 1 and hlas.area_id >= 0 {exprString} order by hlas.enter_time desc',
    fields: {
      names: ['dse.card_id', 'ds.staff_id', 'ds.name', 'dd.name as dname', 'doc.name as oname', 'dwt.name AS worktype_name' ,'da.name as aname', 'dat.name as atname', 'hlas.enter_time', 'hlas.leave_time', 'Concat(TIMESTAMPDIFF(HOUR, hlas.enter_time, ifnull(hlas.leave_time, current_timestamp())), "时",TIMESTAMPDIFF(MINUTE, hlas.enter_time, ifnull(hlas.leave_time, current_timestamp())) %60, "分",timestampdiff(second,hlas.enter_time,ifnull(hlas.leave_time,current_timestamp())) % 60,"秒") as retention_time'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['卡号', '员工编号', '姓名', '所属部门', '职务', '工种','区域名称', '区域类型', '进入时间', '离开时间', '滞留时长']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dse.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'hlas.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        name: 'dse.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        name: 'dse.worktype_id',
        label: '工种',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [
          // {name: 'between hlas.enter_time and hlas.leave_time', label: '时刻', type: 'moment'},
          {
            start: {
              name: 'hlas.enter_time'
            },
            end: {
              name: 'hlas.enter_time'
            },
            label: '进入时间-进入时间'
          },
          {
            start: {
              name: 'hlas.enter_time'
            },
            end: {
              name: 'hlas.leave_time'
            },
            label: '进入时间-离开时间'
          },
          {
            start: {
              name: 'hlas.leave_time'
            },
            end: {
              name: 'hlas.leave_time'
            },
            label: '离开时间-离开时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hlas.enter_time', 'hlas.enter_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_location_area: {
    name: 'person_location_area',
    label: '人员区域时刻',
    sign: 1,
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from(select hlas.area_id, count(distinct hlas.obj_id) as per_nums from his_location_area_staff hlas left join dat_staff_extend dse ON dse.staff_id = hlas.obj_id left join dat_area da on da.area_id = hlas.area_id where hlas.area_id > 0 {exprString} group by hlas.area_id) aa',
    fields: {
      names: ['aa.area_id', 'aa.per_nums'],
      types: ['SELECT', 'NUMBER', ],
      labels: ['区域名称', '区域人数']
    },
    exprFields: [{
        name: 'hlas.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        name: 'hlas.enter_time',
        label: '时刻',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'momentTime',
        funFields: ['hlas.enter_time', 'hlas.leave_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_lamp_number: {
    name: 'person_lamp_number',
    label: '矿灯使用情况',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_staff ras LEFT JOIN dat_staff ds ON ras.staff_id = ds.staff_id LEFT JOIN dat_staff_extend dse ON ds.staff_id = dse.staff_id WHERE 1=1 {exprString} order by ds.staff_id;',
    fields: {
      names: ['ds.staff_id', 'ds.name', 'dse.dept_id', 'dse.lampNo', 'ras.start_time'],
      types: ['SELECT', 'STRING', 'SELECT', 'STRING', 'DATETIME'],
      labels: ['员工编号', '姓名', '部门', '矿灯号', '入井时间']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dse.dept_id',
        label: '部门',
        type: 'SELECT'
      },
      {
        name: 'dse.lampNo',
        label: '矿灯号',
        type: 'STRING'
      },
      // {
      //   type: 'DATE',
      //   selectOptin: [{
      //       name: 'att_date',
      //       label: '日期'
      //     }
      //   ]
      // }
      {
        name: 'ras.att_date',
        label: '日期',
        type: 'DAY'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'curretTime',
        funFields: ['ras.att_date']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_reader: {
    name: 'person_reader',
    label: '人员进出分站明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_location_reader_staff hlas inner join dat_staff ds on ds.staff_id = hlas.obj_id left join dat_reader dr on dr.reader_id = -hlas.area_id left join dat_staff_extend dse on dse.staff_id = ds.staff_id INNER JOIN dat_dept dd on dse.dept_id = dd.dept_id INNER JOIN dat_occupation doc on dse.occupation_id = doc.occupation_id INNER JOIN dat_reader_type drt on dr.reader_type_id = drt.reader_type_id where 1=1 and hlas.area_id < 0 {exprString} order by hlas.enter_time desc',
    fields: {
      names: ['dse.card_id', 'ds.staff_id as staff_id', 'ds.name', 'dd.name as dname', 'doc.name as oname', 'CONCAT(dr.reader_id, "-",dr.name ) as nr_name', 'drt.name as rtname', 'hlas.enter_time', 'hlas.leave_time', 'Concat(TIMESTAMPDIFF(HOUR, hlas.enter_time, ifnull(hlas.leave_time, current_timestamp())), "时",TIMESTAMPDIFF(MINUTE, hlas.enter_time, ifnull(hlas.leave_time, current_timestamp())) %60, "分",timestampdiff(second,hlas.enter_time,ifnull(hlas.leave_time,current_timestamp())) % 60,"秒") as retention_time'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['卡号', '员工编号', '姓名', '所属部门', '职务', '分站名称', '分站类型', '进入时间', '离开时间', '滞留时长']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dse.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dr.reader_id',
        label: '分站名称',
        type: 'SELECT'
      },
      {
        name: 'dse.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hlas.enter_time'
            },
            end: {
              name: 'hlas.enter_time'
            },
            label: '进入时间-进入时间'
          },
          {
            start: {
              name: 'hlas.enter_time'
            },
            end: {
              name: 'hlas.leave_time'
            },
            label: '进入时间-离开时间'
          },
          {
            start: {
              name: 'hlas.leave_time'
            },
            end: {
              name: 'hlas.leave_time'
            },
            label: '离开时间-离开时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hlas.enter_time', 'hlas.enter_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_absence: {
    name: 'person_absence',
    label: '人员未出勤明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from dat_staff ds left join dat_staff_extend dse2 on dse2.staff_id = ds.staff_id where ds.staff_id not in (select ras.staff_id from rpt_att_staff ras left join dat_staff_extend dse on dse.staff_id = ras.staff_id where 1=1 {exprString}){noexprString}',
    fields: {
      names: ['ds.staff_id', 'ds.name', 'dse2.card_id', 'dse2.dept_id', 'dse2.occupation_id'],
      types: ['NUMBER', 'STRING', 'STRING', 'SELECT', 'SELECT'],
      labels: ['员工编号', '姓名', '卡号', '部门', '职务']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dse2.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse2.dept_id',
        label: '部门',
        type: 'SELECT'
      },
      {
        name: 'dse2.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
          start: {
            name: 'ras.att_date'
          },
          end: {
            name: 'ras.att_date'
          },
          label: '开始时间-结束时间'
        }]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'curretTime',
        funFields: ['ras.att_date']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_day: {
    name: 'person_day',
    label: '人员考勤日报',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_staff as ras left join dat_staff as ds on ras.staff_id = ds.staff_id left join dat_staff_extend dse on dse.staff_id = ds.staff_id LEFT JOIN dat_shift da on da.shift_id = ras.shift_id INNER JOIN dat_dept dd ON dse.dept_id = dd.dept_id INNER JOIN dat_occupation doc ON dse.occupation_id = doc.occupation_id where 1=1 AND TIMESTAMPDIFF(MINUTE, ras.start_time, IFNULL(ras.end_time, CURRENT_TIMESTAMP())) >= 10 {exprString} group by ras.att_date,ras.staff_id,ras.shift_id,TIMESTAMPDIFF(MINUTE, IFNULL(ras.start_time, CURRENT_TIMESTAMP()),ras.end_time) >= da.min_minutes*60 order by min(ras.start_time) desc ',
    fields: {
      names: ['ras.card_id', 'ds.staff_id', 'ds.name', 'dd.name as dname', 'doc.name as oname', 'da.short_name as shift_name', 'date_format(min(ras.start_time),"%Y-%m-%d %H:%i:%s") as start_time', 'date_format(max(ras.end_time),"%Y-%m-%d %H:%i:%s")', 'count(ras.card_id) as m_count', 'format(sum(TIMESTAMPDIFF(MINUTE, ras.start_time, ras.end_time)/60.0), 1) as work_time', 'format(sum(TIMESTAMPDIFF(MINUTE, ras.start_time, ras.end_time))/60.0/count(ras.staff_id), 1) as avg_work_time', 'CASE WHEN ras.end_time is null then "" when TIMESTAMPDIFF(MINUTE, IFNULL(ras.start_time, CURRENT_TIMESTAMP()),ras.end_time) >= da.min_minutes*60 THEN "是" ELSE "否" END as is_enough'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'NUMBER', 'NUMBER', 'STRING'],
      labels: ['卡号', '员工编号', '姓名', '所属部门', '职务', '班次', '最早入井时间', '最后升井时间', '次数', '合计时长(时)', '平均时长(时)', '是否足班']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'ras.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dse.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        name: 'da.shift_id',
        label: '班次',
        type: 'SELECT'
      },
      {
        name: 'is_enough',
        label: '是否足班',
        type: 'RADIO'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.start_time'
            },
            label: '最早入井时间-最早入井时间'
          },
          {
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '最早入井时间-最后升井时间'
          },
          {
            start: {
              name: 'ras.end_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '最后升井时间-最后升井时间'
          },
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['ras.start_time', 'ras.start_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_month: {
    name: 'person_month',
    label: '人员考勤月报',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from ( select card_id,staff_id,att_date,start_time,timestampdiff(minute, min(start_time),max(ifnull(end_time, curtime()))) as dur, shift_id from rpt_att_staff where 1=1 {exprStringTime} group by card_id, att_date, shift_id) ras left join dat_staff ds on ds.staff_id = ras.staff_id left join dat_staff_extend dse on dse.staff_id = ras.staff_id left join dat_shift df on df.shift_id  = ras.shift_id where 1=1 and dse.staff_id is not null {exprString} group by ras.staff_id,ds.staff_id,dse.dept_id,dse.occupation_id order by dse.dept_id;',
    fields: {
      names: ['dse.staff_id', 'dse.card_id', 'dse.dept_id', 'date_format(ras.att_date, "%Y-%m") as month', 'count(ras.staff_id) as m_count', 'format(sum(dur/60.0),1) as work_time', 'format(sum(dur)/60.0/count(ras.staff_id),1) as avg_time', 'sum(case when df.short_name = 0 then 1 end) zero', 'sum(case when df.short_name = 8 then 1 end) eight', 'sum(case when df.short_name = 4 then 1 end) four', 'group_concat(day(ras.att_date), ";",  df.short_name) as concat_day'],
      types: ['SELECT', 'SELECT', 'SELECT', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'STRING'],
      labels: ['姓名', '卡号', '部门名称', '月份', '次数', '合计时长', '平均时长', '0点班', '8点班', '4点班', '上班']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dse.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '部门名称',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'att_date',
            label: '月份'
          },
          {
            start: {
              name: 'att_date'
            },
            end: {
              name: 'att_date'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'dealMonth',
        funFields: ['att_date']
      }
    }],
    // presets: [{
    //   label: '本月考勤',
    //   conditions: [
    //     { type: 'EDITABLE', label: `时间 为 ${getMon()}`, value: `date_format(ras.att_date, "%Y-%m")=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    autoExec: true,
    needBreakdown: false,
    breakdown: { // 下钻配置
      opLabel: '明细', // 下钻按钮的文字
      targetQuery: 'month_detail',
      params: ['alarm_type_id', 'start_time', 'end_time'],
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '报警类型 = {alarm_type_id}',
          value: 'alarm_type_id = {alarm_type_id}'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 >= {start_time}',
          value: 'start_time >= "{start_time}"'
        },
        {
          type: 'EDITABLE',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 <= {end_time}',
          value: 'start_time <= "{end_time}"'
        }
      ]
    }
  },

  person_s_dept_month: {
    name: 'person_s_dept_month',
    label: '部门考勤月报',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'SELECT {resultFields} FROM (SELECT ras.card_id, ras.staff_id,DATE_FORMAT(start_time,"%Y-%m-%d") day_time,shift_id,COUNT(shift_id) num, TIMESTAMPDIFF(MINUTE,start_time,end_time) minute_time, dse.dept_id, ras.start_time FROM rpt_att_staff ras left join dat_staff_extend dse on ras.staff_id = dse.staff_id  where 1=1 and dse.staff_id is not null {exprString} GROUP BY ras.card_id,ras.start_time,ras.shift_id )a GROUP BY a.card_id,a.day_time,a.shift_id;',
    fields: {
      names: ['a.staff_id', 'a.shift_id', 'a.num', 'a.dept_id', 'SUM(minute_time) as sm', 'CASE  WHEN SUM(minute_time)>480 THEN "all" ELSE "absence" END nn', 'a.start_time'],
      types: ['SELECT', 'SELECT', 'NUMBER', 'SELECT', 'STRING', 'STRING', 'DATETIME'],
      labels: ['部门名称', '全勤次数', '非全勤次数', '零点班次数', '八点班次数', '四点班次数', '平均工作时间(h)']
    },
    exprFields: [{
        name: 'dse.dept_id',
        label: '部门名称',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'att_date',
            label: '月份'
          },
          {
            start: {
              name: 'att_date'
            },
            end: {
              name: 'att_date'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'dealMonth',
        funFields: ['ras.att_date']
      }
    }],
    // presets: [{
    //   label: '本月考勤',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
    //     { type: 'EDITABLE', label: `时间 为 ${getMon()}`, value: `date_format(rav.att_date, "%Y-%m")=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  person_s_dept_day: {
    name: 'person_s_dept_day',
    label: '部门考勤日报',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'SELECT {resultFields} FROM (SELECT ras.card_id, ras.staff_id,DATE_FORMAT(start_time,"%Y-%m-%d") day_time,shift_id,COUNT(shift_id) num, TIMESTAMPDIFF(MINUTE,start_time,end_time) minute_time, dse.dept_id, ras.start_time FROM rpt_att_staff ras left join dat_staff_extend dse on ras.staff_id = dse.staff_id  where 1=1 and dse.staff_id is not null {exprString} GROUP BY ras.card_id,ras.start_time,ras.shift_id )a GROUP BY a.card_id,a.day_time,a.shift_id;',
    fields: {
      names: ['a.staff_id', 'a.shift_id', 'a.num', 'a.dept_id', 'SUM(minute_time) as sm', 'CASE  WHEN SUM(minute_time)>480 THEN "all" ELSE "absence" END nn', 'a.start_time'],
      types: ['SELECT', 'SELECT', 'NUMBER', 'SELECT', 'STRING', 'STRING', 'DATETIME'],
      labels: ['部门名称', '全勤次数', '缺升井次数', '零点班次数', '八点班次数', '四点班次数', '平均工作时间(h)']
    },
    exprFields: [{
        name: 'dse.dept_id',
        label: '部门名称',
        type: 'SELECT'
      },
      {
        name: 'ras.att_date',
        label: '时间',
        type: 'DAY'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'getDay',
        funFields: ['ras.att_date']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_dept_period: {
    name: 'person_dept_period',
    label: '部门时段查询',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select dse.dept_id,count(distinct ras.staff_id) per_nums,sum(case when ras.shift_id = 1 then 1 else 0 end) shifta,sum(case when ras.shift_id = 2 then 1 else 0 end) shiftb,sum(case when ras.shift_id = 3 then 1 else 0 end) shiftc,round(sum(case when ras.shift_id = 1 then timestampdiff(minute,ras.start_time,ras.end_time) else 0 end)/60/sum(case when ras.shift_id = 1 then 1 else 0 end),2) worktimea, round(sum(case when ras.shift_id = 2 then timestampdiff(minute,ras.start_time,ras.end_time) else 0 end)/60/sum(case when ras.shift_id = 2 then 1 else 0 end),2) worktimeb,round(sum(case when ras.shift_id = 3 then timestampdiff(minute,ras.start_time,ras.end_time) else 0 end)/60/sum(case when ras.shift_id = 3 then 1 else 0 end),2) worktimec,count(*) nums,round(count(*)/count(distinct ras.staff_id),2) avg_num,round(sum(timestampdiff(MINUTE,ras.start_time,ras.end_time)/60),2) sum_time, round(sum(timestampdiff(minute,ras.start_time,ras.end_time))/60/ count(distinct ras.staff_id),2) avg_time, round(sum(timestampdiff(minute,ras.start_time,ras.end_time))/60/ count(distinct ras.staff_id),2) avg_worktime, min(ras.start_time) as start_time, max(ras.end_time) as end_time from rpt_att_staff ras left join dat_staff_extend dse on dse.staff_id = ras.staff_id where 1=1 {exprString} group by dse.dept_id) dp WHERE dp.dept_id > 0',
    fields: {
      names: ['dp.dept_id', 'dp.per_nums', 'dp.nums', 'dp.shifta', 'dp.shiftb', 'dp.shiftc', 'dp.worktimea', 'dp.worktimeb', 'dp.worktimec', 'dp.sum_time', 'round(sum_time/nums, 2) as avg_time', 'dp.start_time', 'dp.end_time'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME'],
      labels: ['部门名称', '人数', '下井总人次', '零点班', '八点班', '四点班', '零点班平均时长(h)', '八点班平均时长(h)', '四点班平均时长(h)', '下井总时长(h)', '平均下井时长(h)', '最早下井时间', '最后出井时间']
    },
    exprFields: [{
        name: 'dse.dept_id',
        label: '部门名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.start_time'
            },
            label: '最早下井时间-最早下井时间'
          },
          {
            start: {
              name: 'ras.start_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '最早下井时间-最后出井时间'
          },
          {
            start: {
              name: 'ras.end_time'
            },
            end: {
              name: 'ras.end_time'
            },
            label: '最后出井时间-最后出井时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['ras.start_time', 'ras.start_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_well_overtime: {
    name: 'person_well_overtime',
    label: '人员井下超时告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat = 0 and event_type_id = 13) hed left join (select event_id,cur_time from his_event_data where stat = 100 and event_type_id = 13) hed1 on hed.event_id = hed1.event_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_staff_extend s on s.card_id = hed.obj_id left join dat_staff ds on ds.staff_id = s.staff_id left join rpt_att_staff ras on ras.staff_id = ds.staff_id and case when isnull(ras.end_time) then hed.cur_time > ras.start_time else hed.cur_time BETWEEN ras.start_time AND ras.end_time end left join dat_dept d on d.dept_id = s.dept_id left join (select distinct card_id from his_card_batlog where 1=1 {batlogExprString}) aa on hed.obj_id = aa.card_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['s.card_id', 'ds.name', 'ifnull(d.name, " ")', 's.occupation_id', 'ifnull(date_format(ras.start_time, "%Y-%m-%d %H:%i:%s"), " ")', 'hed.cur_time', 'ifnull(date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ")', 'hed.limit_value', 'round(hed.cur_value,2)', 'aa.card_id is null as isbat'],
      types: ['NUMBER', 'STRING', 'STRING', 'SELECT', 'DATETIME', 'DATETIME', 'DATETIME', 'STRING', 'STRING'],
      labels: ['卡号', '姓名', '所属部门', '职务', '入井时间', '开始告警时间', '结束告警时间', '规定时长(分)', '实际时长(分)']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 's.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 's.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 's.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_area_overtime: {
    name: 'person_area_overtime',
    label: '人员区域超时告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat = 0 and event_type_id = 15) hed left join (select event_id,cur_time from his_event_data where stat = 100 and event_type_id = 15) hed1 on hed.event_id = hed1.event_id left join dat_staff_extend s on s.card_id = hed.obj_id left join his_location_area_staff hlas on hlas.obj_id = s.staff_id and hed.cur_time between hlas.enter_time and ifnull(hlas.leave_time, NOW()) and hlas.area_id = hed.area_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['hed.obj_id', 's.staff_id', 's.dept_id', 's.occupation_id', 'hed.area_id', 'hlas.enter_time', 'hed.cur_time', 'hed1.cur_time as end_time', 'ROUND(hed.limit_value/3600, 2)', 'round(timestampdiff(minute, hlas.enter_time,ifnull(hed1.cur_time, current_timestamp()))/60,2)'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'STRING'],
      labels: ['卡号', '姓名', '所属部门', '职务', '区域名称', '进入区域时间', '开始告警时间', '结束告警时间', '规定时长(时)', '实际时长(时)']
    },
    exprFields: [{
        name: 's.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 's.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 's.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 's.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        name: 's.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_well_overcount_detail: {
    name: 'person_well_overcount_detail',
    label: '触发人员井下超员告警详情',
    sign: 1,
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: `SELECT {resultFields} FROM rpt_att_staff ras LEFT JOIN dat_staff_extend dse ON ras.staff_id = dse.staff_id WHERE 1=1 {exprString};`,
    fields: {
      names: ['ras.staff_id', 'ras.card_id', 'dse.dept_id', 'start_time', 'hla.end_time'],
      types: ['SELECT', 'STRING', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['姓名', '卡号', '部门', '入井时间', '升井时间']
    },
    exprFields: [
      // {name: 'ras.staff_id', label: '姓名', type: 'SELECT'},
      // {name: 'dse.dept_id', label: '部门', type: 'SELECT'}
    ],
    autoExec: true
  },

  person_well_overcount: {
    name: 'person_well_overcount',
    label: '人员井下超员告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat = 0 and event_type_id = 1) hed left join (select event_id,cur_time from his_event_data where stat = 100 and event_type_id = 1) hed1 on hed.event_id = hed1.event_id left join dat_staff_extend s on s.card_id = hed.obj_id left join dat_event_type et on hed.event_type_id = et.event_type_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['et.name', 'hed.limit_value', 'hed.cur_value', 'date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s")', 'date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s")'],
      types: ['STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME'],
      labels: ['告警名称', '限制人员数', '实际人员数', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
      type: 'DATE',
      selectOptin: [{
          start: {
            name: 'hed.cur_time'
          },
          end: {
            name: 'hed.cur_time'
          },
          label: '开始告警时间-开始告警时间'
        },
        {
          start: {
            name: 'hed.cur_time'
          },
          end: {
            name: 'hed1.cur_time'
          },
          label: '开始告警时间-结束告警时间'
        },
        {
          start: {
            name: 'hed1.cur_time'
          },
          end: {
            name: 'hed1.cur_time'
          },
          label: '结束告警时间-结束告警时间'
        }
      ]
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: true, // 是否需要下钻？
    autoExec: true,
    breakdown: { // 下钻配置
      opLabel: '详情', // 下钻按钮的文字
      targetQuery: 'person_area_overcount_detail',
      params: ['start_time'],
      exprList: [
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '入井时间 >= {cur_time}',
          value: 'start_time >= "{cur_time}"'
        }
      ]
    }
  },

  person_area_overcount_detail: {
    name: 'person_area_overcount_detail',
    label: '触发人员区域超员告警详情',
    sign: 1,
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: `SELECT {resultFields} FROM his_location_area hla LEFT JOIN dat_staff_extend dse ON hla.obj_id = dse.staff_id WHERE 1=1 {exprString}`,
    fields: {
      names: ['obj_id', 'staff_id', 'card_id', 'dept_id', 'hla.area_id', 'enter_time', 'leave_time'],
      types: ['SELECT', 'SELECT', 'STRING', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['工号', '姓名', '卡号', '部门', '所在区域', '进入区域时间', '离开区域时间']
    },
    exprFields: [
      // {name: 'staff_id', label: '姓名', type: 'SELECT'},
      // {name: 'dept_id', label: '部门', type: 'SELECT'}
    ],
    autoExec: true
  },

  person_area_overcount: {
    name: 'person_area_overcount',
    label: '人员区域超员告警',
    sign: 1,
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat = 0 and event_type_id = 3) hed left join (select event_id,cur_time from his_event_data where stat = 100 and event_type_id = 3) hed1 on hed.event_id = hed1.event_id left join dat_staff_extend s on s.card_id = hed.obj_id left join dat_event_type et on hed.event_type_id = et.event_type_id left join dat_area a on a.area_id = hed.area_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['et.name', 'a.area_id', 'hed.limit_value', 'hed.cur_value', 'hed.cur_time', 'ifnull(date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ") '],
      types: ['STRING', 'SELECT', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME'],
      labels: ['告警名称', '告警区域', '限制人员数', '实际人员数', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'a.area_id',
        label: '告警区域',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: true, // 是否需要下钻？
    autoExec: true,
    breakdown: { // 下钻配置
      opLabel: '详情', // 下钻按钮的文字
      targetQuery: 'person_area_overcount_detail',
      params: ['area_id', 'cur_time'],
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '区域 = {area_id}',
          value: 'hla.area_id = {area_id}'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '进入区域时间 >= {cur_time}',
          value: 'enter_time >= "{cur_time}"'
        }
      ]
    }
  },

  person_call_help: {
    name: 'person_call_help',
    label: '人员井下呼救告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (SELECT * FROM his_event_data WHERE stat = 0 AND event_type_id = 24) hed left join (SELECT event_id,cur_time FROM his_event_data WHERE stat = 100 AND event_type_id = 24) hed1 on hed.event_id = hed1.event_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_staff_extend s on s.card_id = hed.obj_id left join dat_staff ds on ds.staff_id = s.staff_id left join rpt_att_staff ras on ras.staff_id = ds.staff_id and hed.cur_time between ras.start_time and ras.end_time left join dat_dept d on d.dept_id = s.dept_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['s.card_id', 'ds.name', 'ifnull(d.name, " ")', 's.occupation_id', 'ifnull(date_format(ras.start_time, "%Y-%m-%d %H:%i:%s"), " ")', 'date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s")', 'date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s")'],
      types: ['STRING', 'STRING', 'STRING', 'SELECT', 'DATETIME', 'DATETIME', 'DATETIME'],
      labels: ['卡号', '姓名', '所属部门', '职务', '入井时间', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 's.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 's.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 's.occupation_id',
        label: '职务',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_card_battery_alarm: {
    name: 'person_card_battery_alarm',
    label: '人卡电量低告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 12) hed left join (select event_id, obj_id, cur_time from his_event_data where stat=100 and event_type_id = 12)  hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id inner join dat_staff_extend ds on hed.obj_id = ds.card_id left join dat_staff dd on ds.staff_id = dd.staff_id left join dat_event_type et on hed.event_type_id = et.event_type_id left join (select distinct card_id from his_card_batlog where 1=1 {batlogExprString}) aa on hed.obj_id = aa.card_id where 1=1 {exprString} ',
    fields: {
      names: ['hed.obj_id as card_id', 'ds.staff_id', 'dd.name', 'ds.dept_id', 'et.name as et_name', 'hed.cur_time', 'hed1.cur_time as hedc', 'aa.card_id is null as isbat'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['卡号', '员工编号', '姓名', '所属部门', '告警类型', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'hed.obj_id as card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'ds.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_fixed_alarm: {
    name: 'person_fixed_alarm',
    label: '人卡静止不动告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 32) hed left join (select event_id, obj_id, cur_time from his_event_data where stat=100 and event_type_id = 32)  hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id inner join dat_staff_extend ds on hed.obj_id = ds.card_id left join dat_staff dd on ds.staff_id = dd.staff_id left join dat_event_type et on hed.event_type_id = et.event_type_id where 1=1 {exprString} ',
    fields: {
      names: ['hed.obj_id as card_id', 'ds.staff_id', 'dd.name', 'ds.dept_id', 'et.name as et_name', 'hed.cur_time', 'hed1.cur_time as hedc'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['卡号', '员工编号', '姓名', '所属部门', '告警类型', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'hed.obj_id as card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'ds.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_area_limited: {
    name: 'person_area_limited',
    label: '人员进入限制区域告警',
    sign: 1,
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat = 0 and event_type_id = 19) hed left join (select event_id, cur_time from his_event_data where stat = 100 and event_type_id = 19) hed1 on hed.event_id = hed1.event_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_staff_extend s on s.card_id = hed.obj_id left join dat_staff ds on ds.staff_id = s.staff_id left join rpt_att_staff ras on ras.staff_id = ds.staff_id and hed.cur_time between ras.start_time and ras.end_time left join dat_area da on da.area_id = hed.area_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['hed.obj_id', 'ds.name', 's.dept_id', 'hed.area_id', 'da.area_type_id', 'hed.cur_time', 'hed1.cur_time as end_time', 'TIMESTAMPDIFF(MINUTE, hed.cur_time, hed1.cur_time) as retime'],
      types: ['NUMBER', 'STRING', 'STRING', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['卡号', '姓名', '所属部门', '区域名称', '区域类型', '开始告警时间', '结束告警时间', '滞留时长（分钟）']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'sta.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 's.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_driver_car_limited: {
    name: 'person_driver_car_limited',
    label: '工作面司机与车卡距离告警',
    needDisplay: 1,
    // sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 22) hed left join (select event_id, cur_time from his_event_data where stat=100 and event_type_id = 22) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v on v.card_id = hed.obj_id left join dat_vehicle dv on dv.vehicle_id = v.vehicle_id left join  (select * from dat_shift where shift_type_id = 1) s on (((s.start_time < s.end_time) and (time(hed.cur_time)  >= s.start_time and time(hed.cur_time)  < s.end_time)) or ((s.start_time > s.end_time) and (time(hed.cur_time) >=s.start_time or time(hed.cur_time) <s.end_time))) left join dat_driver_arrange dda on dda.vehicle_id = v.vehicle_id and dda.driver_date = date(hed.cur_time) and dda.shift_id = s.shift_id where 1=1 and dda.name is not null {exprString} order by hed.cur_time desc;',
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 37) hed left join (select event_id, cur_time from his_event_data where stat=100 and event_type_id = 37) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v on v.card_id = hed.obj_id left join dat_vehicle dv on dv.vehicle_id = v.vehicle_id left join  (select * from dat_shift where shift_type_id = 1) s on (((s.start_time < s.end_time) and (time(hed.cur_time)  >= s.start_time and time(hed.cur_time)  < s.end_time)) or ((s.start_time > s.end_time) and (time(hed.cur_time) >=s.start_time or time(hed.cur_time) <s.end_time))) left join dat_driver_arrange dda on dda.vehicle_id = v.vehicle_id and dda.driver_date = date(hed.cur_time) and dda.shift_id = s.shift_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['v.card_id', 'dda.name', 'dda.dept_id', 'dv.vehicle_id', 'dv.vehicle_type_id', 'hed.area_id', 'hed.cur_time', 'hed1.cur_time hcu', 'concat(TIMESTAMPDIFF(minute, hed.cur_time, ifnull(hed1.cur_time, current_timestamp()))%60, "分", TIMESTAMPDIFF(second, hed.cur_time, ifnull(hed1.cur_time, current_timestamp()))%60, "秒") as dur'],
      types: ['STRING', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['卡号', '司机', '所属部门', '车牌名称', '车辆类型', '区域名称', '开始告警时间', '结束告警时间', '超距时长']
    },
    exprFields: [{
        name: 'dda.staff_id',
        label: '员工编号',
        type: 'SELECT'
      },
      {
        name: 'dda.staff_id',
        label: '姓名',
        type: 'SELECT'
      },
      {
        name: 'v.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dda.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_id',
        label: '车牌名称',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    // presets: [{
    //   label: '日期',
    //   conditions: [
    //     { type: 'EDITABLE', label: `开始告警时间晚于等于 ${getDay()}`, value: `hed.cur_time>=${getDay()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  person_time: {
    name: 'person_time',
    label: '人员井下时刻明细',
    sign: 1,
    needDisplay: 1,
    // sqlTmpl: 'select {resultFields} from (select staff_id, start_time, end_time from rpt_att_staff where {exprString1}) aa left join (select obj_id, area_id, begin_time, last_time from his_location_staff_ where {exprString2} and area_id > 0) bb on aa.staff_id = bb.obj_id and bb.begin_time >= aa.start_time left join dat_staff_extend dse on aa.staff_id = dse.staff_id left join dat_staff ds on aa.staff_id = ds.staff_id left join dat_area da on bb.area_id = da.area_id where 1=1 {exprString};',
    sqlTmpl: 'select {resultFields} from (select staff_id, start_time, end_time from rpt_att_staff where {exprString1}) aa left join dat_staff_extend dse on aa.staff_id = dse.staff_id left join dat_staff ds on aa.staff_id = ds.staff_id where 1=1 {exprString} order by aa.start_time;',
    fields: {
      names: ['aa.staff_id', 'ds.name', 'dse.card_id', 'dse.dept_id', 'dse.occupation_id'],
      types: ['NUMBER', 'STRING', 'NUMBER', 'SELECT', 'SELECT'],
      labels: ['员工编号', '姓名', '卡号', '部门', '职务']
    },
    exprFields: [{
        name: 'ds.staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'ds.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dse.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.dept_id',
        label: '部门',
        type: 'SELECT'
      },
      {
        name: 'start_time',
        label: '时刻',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'pmomentTime',
        funFields: ['start_time', 'end_time', 'begin_time', 'last_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  person_reader_detail: {
    name: 'person_reader_detail',
    label: '人员分站告警明细查询',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: {
      staff: {
        "alarmSql": `select s.staff_id as rsID,ds.name, hed.event_type_id, IFNULL(DATE_FORMAT(hed.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as start_time, IFNULL(DATE_FORMAT(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as end_time, "/" as auto from ( select * from his_event_data where stat = 0 ) hed left join ( select event_id,cur_time, event_type_id from his_event_data where stat = 100 ) hed1 on hed.event_id = hed1.event_id and hed.event_type_id = hed1.event_type_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_staff_extend s ON s.card_id = hed.obj_id left join dat_staff ds ON ds.staff_id = s.staff_id where 1=1 {exprString} order by hed.cur_time desc;`,
        "wellSql": `select s.staff_id as rsID,s.name , "升入井" as event_type_id, DATE_FORMAT(ras.start_time, "%Y-%m-%d %H:%i:%s") as start_time, DATE_FORMAT(ras.end_time, "%Y-%m-%d %H:%i:%s") as end_time, CASE WHEN ras.is_auto = 0 AND ras.end_time IS NOT NULL THEN "正常" WHEN ras.is_auto = 1 THEN "手动升井" WHEN ras.is_auto = 2 THEN "强制升井" WHEN ras.is_auto = 3 THEN "自动升井" ELSE " " END as auto from rpt_att_staff ras left join dat_staff s on s.staff_id = ras.staff_id where 1=1 {exprString} order by ras.start_time desc;`
      },
      reader: 'select cast(r.reader_id as signed) as rsID,r.name,hed.event_type_id, IFNULL(DATE_FORMAT(hed.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as start_time, IFNULL(DATE_FORMAT(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ") as end_time, "/" as auto from ( select * from his_event_data where stat=0) hed left join ( select event_id, obj_id, cur_time, event_type_id from his_event_data where stat=100 ) hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id and hed.event_type_id = hed1.event_type_id inner join dat_reader r ON hed.obj_id = r.reader_id where 1=1 {exprString} order by hed.cur_time desc;'
    },
    fields: {
      names: ['', '', 'hed.event_type_id', 'hed.cur_time', 'hed1.cur_time', ''],
      types: ['NUMBER', 'STRING', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['ID', '名称', '类型', '开始时间', '结束时间', '升井方式']
    },
    exprFields: [{
        name: 's.staff_id or r.reader_id',
        label: '名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始时间-开始时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始时间-结束时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: false
  },

  time_rate: {
    name: 'time_rate',
    label: '工时利用率日报',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} FROM ( select hwd.staff_id, dse.dept_id, case when dse.work_line = 1 then sum(hwd.real_work_time) - 0.5 else sum(hwd.real_work_time) end as worktime, hwd.schedule_work_time, dse.work_line, hwd.start_work_time, hwd.end_work_time from his_worktime_detail hwd left join dat_staff_extend dse on hwd.staff_id = dse.staff_id group by date(hwd.start_work_time), hwd.staff_id)aa left join rpt_sanlv_daily_detail rsd on rsd.dept_id = aa.dept_id left join rpt_sanlv_daily_main rsm on rsm.ID = rsd.MainID where 1=1 {exprString} group by date(aa.start_work_time), aa.dept_id;',
    fields: {
      names: ['aa.dept_id', 'date_format(aa.start_work_time, "%Y-%m-%d %H:%i:%s")', 'date_format(aa.end_work_time, "%Y-%m-%d %H:%i:%s")', 'concat(round(sum(aa.worktime) / sum(aa.schedule_work_time) * 100, 2), "%") as opra', 'date_format(aa.start_work_time,"%Y-%m-%d")', 'rsd.Analysis', 'rsm.ID'],
      types: ['NUMBER', 'DATE', 'DATE', 'NUMBER', 'DATE', 'STRING'],
      labels: ['部门', '开始工作时间', '结束工作时间', '当日工时利用率', '日期', '分析']
    },
    exprFields: [{
        name: 'a.dept_id',
        label: '部门',
        type: 'NUMBER'
      },
      {
        name: 'date_format(aa.start_work_time,"%Y-%m-%d")',
        label: '日期',
        type: 'DAY'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }]
  },

  time_rate_month: {
    name: 'time_rate_month',
    label: '工时利用率月报',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from ( select dse.dept_id, dse.work_line, case when dse.work_line = 1 then sum(hwd.real_work_time-0.5) else case when dse.work_line = 2 then sum(timestampdiff(hour, ras.start_time, ras.end_time)) end end as r_work_time, sum(hwd.schedule_work_time) as s_work_time, date_format(hwd.start_work_time,"%Y-%m") as date_time, rsd.Analysis, date_format(hwd.start_work_time, "%Y-%m-%d %H:%i") as start_work_time, date_format(hwd.end_work_time, "%Y-%m-%d %H:%i") as end_work_time, rsm.ID from his_worktime_detail hwd left join dat_staff_extend dse on hwd.staff_id = dse.staff_id left join rpt_sanlv_daily_detail rsd on rsd.dept_id = dse.dept_id left join rpt_sanlv_daily_main rsm on rsm.ID = rsd.MainID left join rpt_att_staff ras on hwd.staff_id = ras.staff_id and date(hwd.start_work_time) = ras.att_date group by dse.dept_id, date_format(hwd.end_work_time,"%Y-%m"), dse.work_line) a where 1 = 1 {exprString}',
    fields: {
      names: ['a.dept_id', 'a.work_line', 'a.r_work_time', 'a.s_work_time', 'concat(format(a.r_work_time/a.s_work_time*100, 2), "%") as opra', 'a.date_time', 'a.Analysis', 'a.ID'],
      types: ['NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'DATE', 'STRING'],
      labels: ['部门', '所属工作线', '当月实际工作时间', '当月计划工作时间', '当月工时利用率', '日期', '分析']
    },
    exprFields: [{
        name: 'a.dept_id',
        label: '部门',
        type: 'NUMBER'
      },
      {
        name: 'date_format(a.start_work_time,"%Y-%m")',
        label: '日期',
        type: 'MONTH'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }]
  },

  leader_day: {
    name: 'leader_day',
    label: '领导考勤日报',
    sqlTmpl: 'select {resultFields} from dat_staff s inner join rpt_att_staff ras on s.card_id = ras.card_id and s.level_id != 5 left join dat_dept d on s.dept_id = d.dept_id where 1=1 {exprString} group by ras.att_date order by ras.end_time desc;',
    fields: {
      names: ['s.card_id', 's.name', 'ifnull(d.name, " ")', 'ifnull(s.occupation_id, " ")', 'ifnull(date_format(ras.start_time, "%Y-%m-%d %H:%i"), " ")', 'ifnull(date_format(ras.end_time, "%Y-%m-%d %H:%i"), " ")', 'count(ras.card_id) as m_count', 'format(sum(TIMESTAMPDIFF(MINUTE, start_time, end_time)/60.0), 1) as work_time', 'format(sum(TIMESTAMPDIFF(MINUTE, start_time, end_time))/60.0/count(ras.card_id), 1) as avg_work_time'],
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'NUMBER', 'NUMBER'],
      labels: ['卡号', '姓名', '所属部门', '职务', '最早入井时间', '最后升井时间', '次数', '合计时长(时)', '平均时长(时)']
    },
    exprFields: [{
        name: 's.staff_id',
        label: '姓名',
        type: 'SELECT'
      },
      {
        name: 'ras.start_time',
        label: '开始时间',
        type: 'DATE'
      },
      {
        name: 'ras.end_time',
        label: '结束时间',
        type: 'DATE'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  leader_month: {
    name: 'leader_month',
    label: '领导考勤月报',
    sqlTmpl: 'select {resultFields} from rpt_att_staff ras inner join dat_staff s on ras.card_id = s.card_id left join dat_dept dd on s.dept_id = dd.dept_id left join dat_shift ds on ras.shift_id = ds.shift_id where s.level_id != 5 {exprString} group by ras.card_id, date_format(ras.att_date, "%Y-%m");',
    fields: {
      names: ['s.card_id', 's.name', 'dd.name as ddn', 's.occupation_id', 'date_format(ras.att_date, "%Y-%m") as month', 'count(ras.card_id) as m_count',
        'format(sum(TIMESTAMPDIFF(MINUTE, ras.start_time, ras.end_time)/60.0), 1) as work_time',
        'format(sum(TIMESTAMPDIFF(MINUTE, ras.start_time, ras.end_time))/60.0/count(ras.card_id), 1)as avg_work_time', 'group_concat(day(ras.att_date), ";",  ds.short_name)'
      ],
      types: ['NUMBER', 'STRING', 'STRING', 'STRING', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'],
      labels: ['卡号', '姓名', '所属部门', '职务', '月份', '次数', '合计时长', '平均时长', '工作']
    },
    exprFields: [{
        name: 's.staff_id',
        label: '姓名',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'ras.att_date',
            label: '月份'
          },
          {
            start: {
              name: 'ras.att_date'
            },
            end: {
              name: 'ras.att_date'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    // presets: [{
    //   label: '本月考勤',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
    //     { type: 'EDITABLE', label: `时间 为 ${getMon()}`, value: `date_format(ras.att_date, "%Y-%m")=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: false
  },

  inspection_day: {
    name: 'inspection_day',
    label: '巡检路线考勤日报',
    sqlTmpl: 'select {resultFields} from (select s.staff_id,s.card_id,s.name, patrol_task_id, patrol_path_id, patrol_point_id, idx, enter_time, leave_time, patrol_state_id, patrol_stay_state_id,case when patrol_state_id > 0 or patrol_stay_state_id > 0 then 1 else 0 end as errcount from his_patrol_data hpd inner join dat_staff s on hpd.card_id = s.card_id)pd left join dat_patrol_path pp on pd.patrol_path_id = pp.patrol_path_id left join dat_patrol_task pt on pd.patrol_task_id = pt.patrol_task_id where 1=1 {exprString} group by pd.staff_id, pd.patrol_task_id, pd.patrol_path_id;',
    fields: {
      names: ['pd.card_id', 'pd.name', 'pp.name as pname', 'pt.patrol_task_id', 'count(pd.patrol_task_id) as finishcount', 'sum(errcount) as err'],
      types: ['NUMBER', 'STRING', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER'],
      labels: ['卡号', '姓名', '巡检路线', '巡检任务编号', '完成区域数', '违规区域数']
    },
    exprFields: [{
        name: 's.staff_id',
        label: '姓名',
        type: 'SELECT'
      },
      {
        name: 'pp.patrol_path_id',
        label: '巡检路线',
        type: 'STRING'
      },
      {
        name: 'pd.patrol_task_id',
        label: '巡检任务编号',
        type: 'STRING'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    breakdown: { // 下钻配置
      opLabel: '详情', // 下钻按钮的文字
      targetQuery: 'inspection_detail_day',
      params: ['enter_time', 'leave_time'],
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 >= {start_time}',
          value: 'pd.enter_time >= "{enter_time}"'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 <= {end_time}',
          value: 'pd.leave_time <= "{leave_time}"'
        }
      ]
    }
  },

  inspection_detail_day: {
    name: 'inspection_detail_day',
    label: '巡检路线考勤日报详情',
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_patrol_data pd, dat_staff s, dat_area a, dat_patrol_point pp, dat_map m, dat_patrol_state ps where pd.staff_id = s.staff_id and s.area_id = a.area_id and pd.patrol_point_id = pp.patrol_point_id and pp.map_id = m.map_id and pd.patrol_state_id = ps.patrol_state_id {exprString};',
    fields: {
      names: ['s.name', 'a.area_id', 'pd.enter_time', 'pd.leave_time', 'ps.name as sname'],
      types: ['STRING', 'SELECT', 'DATATIME', 'DATATIME', 'SELECT'],
      labels: ['巡检人员', '巡检检查区域名', '要求到达时间', '实际到达时间', '状态']
    },
    exprFields: [{
        name: 's.name',
        label: '巡检人员',
        type: 'STRING'
      },
      {
        name: 'a.area_id',
        label: '巡检检查区域名',
        type: 'SELECT'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: true
  },

  inspection_mouth: {
    name: 'inspection_mouth',
    label: '巡检路线考勤月报',
    sqlTmpl: 'select {resultFields} from routing_count c, dat_staff s where s.staff_id = c.staff_id {exprString};',
    fields: {
      names: ['c.routing_duty_id', 'c.routing_path_id', 's.name', 'c.area_checked', 'c.area_alleged'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER'],
      labels: ['巡检任务编号', '巡检路线编号', '巡检人员', '完成区域数', '违规区域数']
    },
    exprFields: [{
        name: 'c.att_date',
        label: '任务开始时间',
        type: 'DATE'
      },
      {
        name: 's.staff_name',
        label: '巡检人员',
        type: 'STRING'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: true,
    breakdown: { // 下钻配置
      opLabel: '详情', // 下钻按钮的文字
      targetQuery: 'inspection_detail_mouth',
      params: ['start_time', 'end_time'],
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 >= {start_time}',
          value: 'att.start_time >= "{start_time}"'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 <= {end_time}',
          value: 'att.start_time <= "{end_time}"'
        }
      ]
    }
  },

  whole_status: {
    name: 'whole_status',
    label: '整体出车情况',
    needDisplay: 1,
    sqlTmpl: '',
    fields: {
      names: [],
      types: [],
      labels: []
    },
    exprFields: [{
      type: 'MONTH',
      selectOptin: [{
        name: 'month',
        label: '月份'
      }]
    }],
    needBreakdown: false,
    autoExec: true
  },

  vehicle_updown_mine: {
    name: 'vehicle_updown_mine',
    label: '车辆出车明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_vehicle rav left join dat_vehicle dv on dv.vehicle_id = rav.vehicle_id left join dat_vehicle_extend dve on dve.vehicle_id = rav.vehicle_id left join dat_shift ds on ds.shift_id = rav.shift_id where 1=1 {exprString} and dv.vehicle_type_id <> 25 and dv.vehicle_type_id <> 26 order by rav.start_time desc;',
    fields: {
      names: ['rav.card_id', 'ds.short_name as shift_name', 'dve.dept_id', 'dv.vehicle_id', 'dv.vehicle_type_id', 'date_format(rav.start_time, "%Y-%m-%d %H:%i:%s") as start_time', 'date_format(rav.end_time, "%Y-%m-%d %H:%i:%s") as end_time'],
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['车卡号', '班次', '所属部门', '车辆名称', '车辆类型', '出车时间', '回车时间']
    },
    exprFields: [{
        name: 'rav.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'dve.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'ds.shift_id',
        label: '班次',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'rav.start_time'
            },
            end: {
              name: 'rav.start_time'
            },
            label: '出车时间-出车时间'
          },
          {
            start: {
              name: 'rav.start_time'
            },
            end: {
              name: 'rav.end_time'
            },
            label: '出车时间-回车时间'
          },
          {
            start: {
              name: 'rav.end_time'
            },
            end: {
              name: 'rav.start_time'
            },
            label: '回车时间-回车时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['rav.start_time', 'rav.start_time']
      }
    }],
    needBreakdown: false, // 是否需要下钻？
    breakdown: { // 下钻配置
      opLabel: '轨迹', // 下钻按钮的文字
      targetQuery: 'v_track_detail',
      params: ['card_id', 'start_time', 'end_time'], // 注意：这里的参数，和下面的表达式需要一一对应，即第一个参数，对应第一个表达式
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '卡号 = {card_id}',
          value: 'card_id = {card_id}'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 >= {start_time}',
          value: 'cur_time >= "{start_time}"'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 <= {end_time}',
          value: 'cur_time <= "{end_time}"'
        }
      ]
    },
    autoExec: true // 当切换到当前报表时，是否自动执行查询操作
  },

  vehicle_no_updown_mine: {
    name: 'vehicle_no_updown_mine',
    label: '车辆未出车明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from dat_vehicle dv2 left join  dat_vehicle_extend dve on dve.vehicle_id = dv2.vehicle_id where dv2.vehicle_id not in (select rav.vehicle_id from rpt_att_vehicle rav left join dat_vehicle_extend dv on dv.vehicle_id = rav.vehicle_id where 1=1 {exprString}) {noexprString} and dv2.vehicle_type_id <> 25 and dv2.vehicle_type_id <> 26 and dve.card_id is not null',
    fields: {
      names: ['dve.card_id', 'dv2.vehicle_id', 'dv2.vehicle_type_id', 'dve.dept_id'],
      types: ['STRING', 'SELECT', 'SELECT', 'SELECT'],
      labels: ['车卡号', '车辆名称', '车辆类型', '部门']
    },
    exprFields: [{
        name: 'dve.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dv2.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
          start: {
            name: 'rav.att_date'
          },
          end: {
            name: 'rav.att_date'
          },
          label: '开始时间-结束时间'
        }]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['rav.att_date', 'rav.att_date']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  area: {
    name: 'his_area',
    label: '车辆进出区域明细',
    sign: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from dat_vehicle dv left join dat_vehicle_extend dve on dve.vehicle_id = dv.vehicle_id left join his_location_area_vehicle hlav on dve.vehicle_id = hlav.obj_id left join dat_area da on da.area_id = hlav.area_id where 1=1 AND TIMESTAMPDIFF(SECOND,enter_time, IFNULL(leave_time, CURRENT_TIMESTAMP())) >= 20 and hlav.area_id >= 0 {exprString} order by hlav.enter_time desc;',
    fields: {
      names: ['dve.card_id', 'dv.vehicle_id', 'dv.vehicle_type_id', 'dve.dept_id', 'hlav.area_id', 'da.area_type_id', 'date_format(hlav.enter_time, "%Y-%m-%d %H:%i:%s")', 'date_format(hlav.leave_time, "%Y-%m-%d %H:%i:%s")', 'CONCAT(TIMESTAMPDIFF(HOUR, enter_time, IFNULL(leave_time, CURRENT_TIMESTAMP())), "时", TIMESTAMPDIFF(MINUTE,enter_time, IFNULL(leave_time, CURRENT_TIMESTAMP())) %60, "分", TIMESTAMPDIFF(SECOND,enter_time, IFNULL(leave_time, CURRENT_TIMESTAMP())) % 60,"秒") as retention_time'],
      types: ['STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['车卡号', '车辆名称', '车辆类型', '所属部门', '区域名称', '区域类型', '进入时间', '离开时间', '滞留时长']
    },
    exprFields: [{
        name: 'dve.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'dve.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'da.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hlav.enter_time'
            },
            end: {
              name: 'hlav.enter_time'
            },
            label: '进入时间-进入时间'
          },
          {
            start: {
              name: 'hlav.enter_time'
            },
            end: {
              name: 'hlav.leave_time'
            },
            label: '进入时间-离开时间'
          },
          {
            start: {
              name: 'hlav.leave_time'
            },
            end: {
              name: 'hlav.leave_time'
            },
            label: '离开时间-离开时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hlav.enter_time', 'hlav.enter_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  v_reader: {
    name: 'v_reader',
    label: '车辆进出分站明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_location_reader_vehicle hlas inner join dat_vehicle ds on ds.vehicle_id = hlas.obj_id left join dat_reader dr on dr.reader_id = -hlas.area_id left join dat_vehicle_extend dse on dse.vehicle_id = ds.vehicle_id where 1=1 and hlas.area_id < 0 {exprString} order by hlas.enter_time desc',
    fields: {
      names: ['dse.card_id', 'ds.vehicle_id', 'dse.dept_id', 'CONCAT(dr.name, "-", dr.reader_id) as nr_name', 'dr.reader_type_id', 'hlas.enter_time', 'hlas.leave_time', 'Concat(TIMESTAMPDIFF(HOUR, hlas.enter_time, ifnull(hlas.leave_time, current_timestamp())), "时",TIMESTAMPDIFF(MINUTE, hlas.enter_time, ifnull(hlas.leave_time, current_timestamp())) %60, "分",timestampdiff(second,hlas.enter_time,ifnull(hlas.leave_time,current_timestamp())) % 60,"秒") as retention_time'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['车卡号', '车牌名称', '所属部门', '分站名称', '分站类型', '进入时间', '离开时间', '滞留时长']
    },
    exprFields: [{
        name: 'dse.card_id',
        label: '车卡号',
        type: 'SEARCH'
      },
      {
        name: 'ds.vehicle_id',
        label: '车牌名称',
        type: 'SEARCH'
      },
      {
        name: 'dse.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'dr.reader_id',
        label: '分站名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hlas.enter_time'
            },
            end: {
              name: 'hlas.enter_time'
            },
            label: '进入时间-进入时间'
          },
          {
            start: {
              name: 'hlas.enter_time'
            },
            end: {
              name: 'hlas.leave_time'
            },
            label: '进入时间-离开时间'
          },
          {
            start: {
              name: 'hlas.leave_time'
            },
            end: {
              name: 'hlas.leave_time'
            },
            label: '离开时间-离开时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hlas.enter_time', 'hlas.enter_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  v_vehicle_day: {
    name: 'v_vehicle_day',
    label: '车辆考勤日报',
    sign: 1,
    needDisplay: 1,
    // sqlTmpl: 'select {resultFields} from rpt_att_vehicle rav left join dat_vehicle dv on rav.vehicle_id = dv.vehicle_id left join dat_vehicle_extend dve on dve.vehicle_id = dv.vehicle_id where 1=1 {exprString} and dv.vehicle_type_id <> 25 and dv.vehicle_type_id <> 26 group by rav.att_date, rav.card_id,dv.vehicle_id,dv.vehicle_type_id order by rav.end_time desc;',
    sqlTmpl: 'select {resultFields} from rpt_att_vehicle rav left join dat_vehicle dv on rav.vehicle_id = dv.vehicle_id left join dat_vehicle_extend dve on dve.vehicle_id = dv.vehicle_id LEFT JOIN dat_vehicle_type dvt on dv.vehicle_type_id = dvt.vehicle_type_id LEFT JOIN dat_driver_arrange dda ON rav.vehicle_id = dda.vehicle_id AND rav.att_date = dda.driver_date LEFT JOIN dat_shift dsh ON dsh.shift_id = rav.shift_id where 1=1 {exprString} and dv.vehicle_type_id <> 25 and dv.vehicle_type_id <> 26 GROUP BY rav.start_time,dv.vehicle_id order by dv.vehicle_id,rav.start_time;',
    fields: {
      names: ['dv.name as vname', 'dvt.name as vtname', 'dda.name', 'dve.dept_id', 'date_format(rav.start_time, "%Y-%m-%d %H:%i") as stime', 'date_format(rav.end_time, "%Y-%m-%d %H:%i") as etime', 'format(sum(TIMESTAMPDIFF(MINUTE, rav.start_time, rav.end_time)/60.0), 1) as work_time'],
      types: ['SELECT', 'STRING', 'STRING', 'SELECT', 'DATETIME', 'DATETIME', 'NUMBER'],
      labels: ['车辆名称', '车辆类型', '司机', '所属部门', '最早出车时间', '最后回车时间', '合计时长(时)']
    },
    exprFields: [{
        name: 'dve.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'dsh.shift_id',
        label: '班次',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'rav.start_time'
            },
            end: {
              name: 'rav.start_time'
            },
            label: '最早出车时间-最早出车时间'
          },
          {
            start: {
              name: 'rav.start_time'
            },
            end: {
              name: 'rav.end_time'
            },
            label: '最早出车时间-最后回车时间'
          },
          {
            start: {
              name: 'rav.end_time'
            },
            end: {
              name: 'rav.end_time'
            },
            label: '最后回车时间-最后回车时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['rav.start_time', 'rav.start_time']
      }
    }],
    needBreakdown: true,
    autoExec: true,
    breakdown: { // 下钻配置
      opLabel: '明细', // 下钻按钮的文字
      targetQuery: 'v_vehicle_day_detail',
      params: ['vehicle_id', 'date_format(min(rav.start_time), "%m-%d %H:%i")', 'date_format(max(rav.end_time), "%m-%d %H:%i")'],
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '车辆名称 = {vehicle_id}',
          value: 'dv.vehicle_id = {vehicle_id}'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 >= {date_format(min(rav.start_time), "%m-%d %H:%i")}',
          value: 'date_format(rav.start_time, "%m-%d %H:%i") >= "{date_format(min(rav.start_time), "%m-%d %H:%i")}"'
        },
        {
          type: 'EDITABLE',
          logicLabel: '并且',
          logicValue: 'and',
          label: '结束时间 <= {date_format(max(rav.end_time), "%m-%d %H:%i")}',
          value: 'date_format(rav.end_time, "%m-%d %H:%i") <= "{date_format(max(rav.end_time), "%m-%d %H:%i")}"'
        }
      ]
    }
  },

  v_vehicle_day_detail: {
    name: 'v_vehicle_day_detail',
    label: '车辆考勤日报明细',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_vehicle rav left join dat_vehicle dv on rav.vehicle_id = dv.vehicle_id left join dat_vehicle_extend dve on rav.vehicle_id = dve.vehicle_id left join dat_driver_arrange dda on rav.vehicle_id = dda.vehicle_id and rav.att_date = dda.driver_date where 1=1 {exprString}',
    fields: {
      names: ['dv.vehicle_id', 'dda.name', 'dv.vehicle_type_id', 'dve.dept_id', 'date_format(rav.start_time, "%m-%d %H:%i")', 'date_format(rav.end_time, "%m-%d %H:%i")'],
      types: ['SELECT', 'STRING', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER'],
      labels: ['车辆名称', '司机', '车辆类型', '所属部门', '出车时间', '回车时间']
    },
    exprFields: [{
        name: 'dv.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'rav.start_time',
        label: '出车时间',
        type: 'DATETIME'
      },
      {
        name: 'rav.start_time',
        label: '回车时间',
        type: 'DATETIME'
      }
    ],
    exprList: [],
    needBreakdown: false,
    autoExec: true
  },

  v_vehicle_month: {
    name: 'v_vehicle_month',
    label: '车辆考勤月报',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select vehicle_id,att_date,timestampdiff(minute, min(start_time),max(ifnull(end_time, curtime()))) as dur,shift_id from rpt_att_vehicle group by vehicle_id, att_date, shift_id) rav left join dat_vehicle dv on rav.vehicle_id = dv.vehicle_id left join dat_vehicle_extend dve on dve.vehicle_id = dv.vehicle_id left join dat_shift ds on ds.shift_id = rav.shift_id where 1=1 {exprString} and dv.vehicle_type_id <> 25 and dv.vehicle_type_id <> 26 group by dv.vehicle_id,dv.vehicle_type_id,date_format(rav.att_date, "%Y-%m") order by dve.dept_id;',
    fields: {
      names: ['dv.vehicle_id', 'dv.vehicle_type_id', 'dve.dept_id', 'date_format(rav.att_date, "%Y-%m") as month', 'count(rav.vehicle_id) as m_count', 'format(sum(dur/60.0), 1) as work_time', 'format(sum(dur/60.0)/count(rav.vehicle_id), 1) as avg_work_time', 'group_concat(day(rav.att_date), ";",  ds.short_name) as concat_day'],
      types: ['SELECT', 'SELECT', 'SELECT', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'],
      labels: ['车牌名称', '车辆类型', '部门名称', '月份', '次数', '合计时长', '平均时长', '工作']
    },
    exprFields: [{
        name: 'dve.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_id',
        label: '车牌名称',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'rav.att_date',
            label: '月份'
          },
          {
            start: {
              name: 'rav.att_date'
            },
            end: {
              name: 'rav.att_date'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'dealMonth',
        funFields: ['rav.att_date']
      }
    }],
    // presets: [{
    //   label: '本月考勤',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
    //     { type: 'EDITABLE', label: `时间 为 ${getMon()}`, value: `date_format(rav.att_date, "%Y-%m")=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  driver_dept_day: {
    name: 'driver_dept_day',
    label: '司机考勤日报',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_vehicle rav left join dat_vehicle v on rav.vehicle_id = v.vehicle_id left join dat_vehicle_extend dve on dve.vehicle_id = v.vehicle_id inner join dat_driver_arrange dda on rav.shift_id = dda.shift_id and rav.att_date = dda.driver_date and v.vehicle_id = dda.vehicle_id where 1=1 {exprString} order by rav.start_time desc;',
    fields: {
      names: ['rav.card_id', 'dda.staff_id', 'dda.dept_id', 'dda.vehicle_id', 'date_format(rav.start_time, "%Y-%m-%d %H:%i:%s")', 'date_format(rav.end_time, "%Y-%m-%d %H:%i:%s")'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['车卡号', '姓名', '所属部门', '驾驶车辆', '最早入井时间', '最后升井时间']
    },
    exprFields: [{
        name: 'rav.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dda.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dda.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'rav.start_time'
            },
            end: {
              name: 'rav.start_time'
            },
            label: '最早入井时间-最早入井时间'
          },
          {
            start: {
              name: 'rav.start_time'
            },
            end: {
              name: 'rav.end_time'
            },
            label: '最早入井时间-最后升井时间'
          },
          {
            start: {
              name: 'rav.end_time'
            },
            end: {
              name: 'rav.end_time'
            },
            label: '最后升井时间-最后升井时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['rav.start_time', 'rav.start_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  driver_dept_month: {
    name: 'driver_dept_month',
    label: '司机考勤月报',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select vehicle_id,att_date,timestampdiff(minute, min(start_time),max(ifnull(end_time, curtime()))) as dur, shift_id from rpt_att_vehicle group by vehicle_id, att_date,shift_id) rav left join dat_vehicle dv on rav.vehicle_id = rav.vehicle_id left join dat_vehicle_extend dve on dve.vehicle_id = dv.vehicle_id left join dat_shift ds on ds.shift_id = rav.shift_id inner join dat_driver_arrange dda on dda.vehicle_id = rav.vehicle_id and dda.driver_date = rav.att_date and dda.shift_id = rav.shift_id  where 1=1 {exprString} group by dda.staff_id,dda.dept_id,date_format(dda.driver_date, "%Y-%m") order by dda.dept_id;',
    fields: {
      names: ['rav.vehicle_id', 'dda.staff_id', 'dda.dept_id', 'date_format(dda.driver_date, "%Y-%m") as month', 'count(dda.staff_id) as m_count', 'format(sum(dur)/60.0, 1) as work_time', 'format(sum(dur)/60.0/count(rav.vehicle_id), 1)as avg_work_time', 'group_concat(day(rav.att_date),";",ds.short_name) concat_day'],
      types: ['SELECT', 'SELECT', 'SELECT', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'],
      labels: ['车辆名称', '姓名', '所属部门', '月份', '次数', '合计时长', '平均时长', '工作']
    },
    exprFields: [{
        name: 'rav.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'dda.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dda.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'dda.driver_date',
            label: '月份'
          },
          {
            start: {
              name: 'dda.driver_date'
            },
            end: {
              name: 'dda.driver_date'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'dealMonth',
        funFields: ['dda.driver_date']
      }
    }],
    // presets: [{
    //   label: '本月考勤',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
    //     { type: 'EDITABLE', label: `时间 为 ${getMon()}`, value: `date_format(dda.driver_date, "%Y-%m")=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  per_mil: {
    name: 'per_mil',
    label: '司机里程报表',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from cal_miles_and_times_day_driver cmt,dat_staff_extend dse where cmt.staff_id = dse.staff_id {exprString} group by dse.staff_id,dse.dept_id,date_format(cmt.cal_time,"%Y-%m") order by sum(cmt.miles) desc;',
    fields: {
      names: ['dse.card_id', 'dse.staff_id', 'dse.dept_id', 'date_format(cmt.cal_time,"%Y-%m")', 'cast(sum(cmt.miles) as decimal(10,2))'],
      types: ['STRING', 'SELECT', 'SELECT', 'DATE', 'NUMBER'],
      labels: ['车卡号', '姓名', '部门', '月份', '里程数(KM)']
    },
    exprFields: [{
        name: 'dse.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dse.staff_id',
        label: '姓名',
        type: 'SEARCH'
      },
      {
        name: 'dse.dept_id',
        label: '部门',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'cmt.cal_time',
            label: '月份'
          },
          {
            start: {
              name: 'cmt.cal_time'
            },
            end: {
              name: 'cmt.cal_time'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'getMon',
        funFields: ['date_format(cmt.cal_time,"%Y-%m")']
      }
    }],
    // presets: [{
    //   label: '本月里程数',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
    //     { type: 'EDITABLE', label: `月份 为 ${getMon()}`, value: `date_format(cmt.cal_time,"%Y-%m")=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  v_overspeed: {
    name: 'v_overspeed',
    label: '车辆超速告警',
    sign: 1,
    needDisplay: 1,
    // sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 22) hed left join (select event_id, cur_time from his_event_data where stat=100 and event_type_id = 22) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v on v.card_id = hed.obj_id left join dat_vehicle dv on dv.vehicle_id = v.vehicle_id left join  (select * from dat_shift where shift_type_id = 1) s on (((s.start_time < s.end_time) and (time(hed.cur_time)  >= s.start_time and time(hed.cur_time)  < s.end_time)) or ((s.start_time > s.end_time) and (time(hed.cur_time) >=s.start_time or time(hed.cur_time) <s.end_time))) left join dat_driver_arrange dda on dda.vehicle_id = v.vehicle_id and dda.driver_date = date(hed.cur_time) and dda.shift_id = s.shift_id where 1=1 and dda.name is not null {exprString} order by hed.cur_time desc;',
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and (event_type_id = 21 or event_type_id = 22)) hed left join (select event_id, cur_time from his_event_data where stat=100 and (event_type_id = 21 or event_type_id = 22)) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v on v.card_id = hed.obj_id left join dat_vehicle dv on dv.vehicle_id = v.vehicle_id left join  (select * from dat_shift where shift_type_id = 1) s on (((s.start_time < s.end_time) and (time(hed.cur_time)  >= s.start_time and time(hed.cur_time)  < s.end_time)) or ((s.start_time > s.end_time) and (time(hed.cur_time) >=s.start_time or time(hed.cur_time) <s.end_time))) left join dat_driver_arrange dda on dda.vehicle_id = v.vehicle_id and dda.driver_date = date(hed.cur_time) and dda.shift_id = s.shift_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['v.card_id', 'dda.name', 'dda.dept_id', 'dv.vehicle_id', 'dv.vehicle_type_id', 'hed.area_id', 'hed.limit_value', 'hed.cur_value', 'hed.cur_time', 'hed1.cur_time hcu', 'concat(TIMESTAMPDIFF(minute, hed.cur_time, ifnull(hed1.cur_time, current_timestamp()))%60, "分", TIMESTAMPDIFF(second, hed.cur_time, ifnull(hed1.cur_time, current_timestamp()))%60, "秒") as dur'],
      types: ['STRING', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['车卡号', '司机', '所属部门', '车辆名称', '车辆类型', '区域名称', '限制车速(Km/h)', '实际车速(Km/h)', '开始告警时间', '结束告警时间', '超时时长']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'dda.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    // presets: [{
    //   label: '日期',
    //   conditions: [
    //     { type: 'EDITABLE', label: `开始告警时间晚于等于 ${getDay()}`, value: `hed.cur_time>=${getDay()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  vehicle_exception: {
    name: 'vehicle_exception',
    label: '车卡电量低告警',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select event_id,obj_id,cur_time,event_type_id from his_event_data where stat = 0 and event_type_id = 12 group by event_id,cur_time,obj_id) hed left join ( select event_id, obj_id, cur_time from his_event_data where stat=100 and event_type_id = 12 group by event_id,cur_time,obj_id) hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id inner join dat_vehicle_extend v on hed.obj_id = v.card_id left join dat_vehicle dv on dv.vehicle_id = v.vehicle_id left join dat_event_type et on hed.event_type_id = et.event_type_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['hed.obj_id as card_id', 'v.vehicle_id', 'dv.vehicle_type_id', 'et.name', 'hed.cur_time', 'hed1.cur_time as hedc'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['车卡号', '车牌号', '车辆类型', '告警类型', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'v.vehicle_id',
        label: '车牌号',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'hed.cur_time',
        label: '开始告警时间',
        type: 'DATE'
      },
      {
        name: 'hed.cur_time',
        label: '结束告警时间',
        type: 'DATE'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    // presets: [{
    //   label: '日期',
    //   conditions: [
    //     { type: 'EDITABLE', label: `开始告警时间晚于等于 ${getDay()}`, value: `hed.cur_time>=${getDay()} `, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    autoExec: true,
    needBreakdown: false,
    breakdown: { // 下钻配置
      opLabel: '明细', // 下钻按钮的文字
      targetQuery: 'v_exception_detail',
      params: ['alarm_type_id', 'start_time', 'end_time'],
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '报警类型 = {alarm_type_id}',
          value: 'alarm_type_id = {alarm_type_id}'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 >= {start_time}',
          value: 'start_time >= "{start_time}"'
        },
        {
          type: 'EDITABLE',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 <= {end_time}',
          value: 'start_time <= "{end_time}"'
        }
      ]
    }
  },

  v_area_limited: {
    name: 'vehicle_enter_limit_area',
    label: '出入禁止区域',
    sign: 1,
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat = 0 and event_type_id = 20) hed left join (select event_id, cur_time from his_event_data where stat = 100 and event_type_id = 20) hed1 on hed.event_id = hed1.event_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_vehicle_extend s on s.card_id = hed.obj_id left join dat_vehicle ds on ds.vehicle_id = s.vehicle_id left join rpt_att_vehicle ras on ras.vehicle_id = ds.vehicle_id and hed.cur_time between ras.start_time and ras.end_time left join dat_driver_arrange dda on dda.driver_date = date_format(hed.cur_time, "%Y-%m-%d") and dda.vehicle_id = ds.vehicle_id left join dat_area da on da.area_id = hed.area_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['hed.obj_id', 'ds.vehicle_id', 'dda.name', 'ds.vehicle_type_id', 's.dept_id', 'hed.area_id', 'da.area_type_id', 'hed.cur_time', 'ifnull(date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s"),"")', 'TIMESTAMPDIFF(MINUTE, hed.cur_time, hed1.cur_time) as retime'],
      types: ['NUMBER', 'SELECT', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['卡号', '车辆名称', '司机', '车辆类型', '所属部门', '区域名称', '区域类型', '开始告警时间', '结束告警时间', '滞留时长(分钟)']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'ds.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'ds.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  t_s_distance_limited: {
    name: 'tbm_substation_distance_limited',
    label: '掘进机与分站距离超限告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 28) hed left join (select event_id, cur_time from his_event_data where stat=100 and event_type_id = 28) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v ON v.card_id = hed.obj_id left join dat_drivingface_vehicle ddv ON ddv.vehicle_id = v.vehicle_id left join dat_drivingface ddf on ddf.drivingface_id = ddv.drivingface_id where 1=1 {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['v.card_id', 'v.vehicle_id', 'hed.area_id', 'hed.limit_value', 'hed.cur_value', 'hed.cur_time', 'hed1.cur_time as hcu'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', ],
      labels: ['卡号', '车辆名称', '工作面名称', '告警阈值', '告警当前值', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '工作面名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  c_e_zhuiwei: {
    name: 'car_end_zhuiwei',
    label: '车辆追尾告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from ( select * from his_event_data where stat=0 and event_type_id = 36) hed left join (select event_id, cur_time from his_event_data where stat=100 and event_type_id = 36) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v on v.card_id = hed.obj_id where 1=1 and v.card_id is not null {exprString} order by hed.cur_time desc;',
    fields: {
      names: ['v.card_id', 'v.vehicle_id', 'hed.description', 'hed.area_id', 'hed.cur_time', 'hed1.cur_time as hcu'],
      types: ['NUMBER', 'SELECT', 'STRING', 'SELECT', 'DATETIME', 'DATETIME', ],
      labels: ['车卡号', '车辆名称', '追尾描述', '区域名称', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  c_g_limited: {
    name: 'car_geofault_limited',
    label: '地质断层距离告警',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 38) hed left join ( select event_id, cur_time from his_event_data where stat=100 and event_type_id = 38) hed1 on hed.event_id = hed1.event_id left join dat_vehicle_extend v on v.card_id = hed.obj_id left join dat_geofault dg on dg.geofault_id = hed.landmark_dist where 1=1 {exprString} order by hed.cur_time DESC;',
    fields: {
      names: ['v.card_id', 'v.vehicle_id', 'hed.area_id', 'dg.geofault', 'hed.limit_value', 'hed.cur_value', 'hed.cur_time', 'hed1.cur_time as hcu'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', ],
      labels: ['车卡号', '车辆名称', '工作面名称', '断层名称', '告警阈值', '告警当前值', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        name: 'hed.area_id',
        label: '工作面名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  vehicle_time: {
    name: 'vehicle_time',
    label: '车辆井下时刻明细',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_att_vehicle raf left join dat_vehicle ds on raf.vehicle_id = ds.vehicle_id left join dat_vehicle_extend dse on ds.vehicle_id = dse.vehicle_id where 1=1 {exprString}',
    fields: {
      names: ['raf.vehicle_id', 'ds.name', 'raf.card_id', 'dse.dept_id', 'ds.vehicle_type_id', 'raf.start_time', 'raf.end_time'],
      types: ['NUMBER', 'STRING', 'NUMBER', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['车辆编号', '车辆名称', '车卡号', '部门', '车辆类型', '入井时间', '出井时间']
    },
    exprFields: [{
        name: 'dse.card_id',
        label: '车卡号',
        type: 'SELECT'
      },
      {
        name: 'ds.vehicle_id',
        label: '车辆名称',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'raf.start_time'
            },
            end: {
              name: 'raf.start_time'
            },
            label: '入井时间-入井时间'
          },
          {
            start: {
              name: 'raf.start_time'
            },
            end: {
              name: 'raf.end_time'
            },
            label: '入井时间-出井时间'
          },
          {
            start: {
              name: 'raf.end_time'
            },
            end: {
              name: 'raf.end_time'
            },
            label: '出井时间-出井时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['raf.start_time', 'raf.start_time']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  battery_vehicle_rept: {
    name: 'battery_vehicle_rept',
    label: '车辆电池充电记录',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from dat_battery db left join dat_staff ds ON ds.staff_id = db.staff_id left join dat_staff_extend dse ON dse.staff_id = ds.staff_id where 1=1 {exprString} order by battery_id;',
    fields: {
      names: ['db.name', 'date_format(charge_date,"%Y-%m-%d")', 'db.staff_id', 'ifnull(remark, " ")'],
      types: ['NUMBER', 'DATE', 'SELECT', 'STRING'],
      labels: ['电池编号', '充电日期', '充电人', '备注']
    },
    exprFields: [{
        name: 'battery_id',
        label: '电池编号',
        type: 'NUMBER'
      },
      {
        name: 'date_format(charge_date,"%Y-%m-%d")',
        label: '充电日期',
        type: 'DAY'
      },
      {
        name: 'db.staff_id',
        label: '充电人',
        type: 'SELECT'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'getDat',
        funFields: ['DATE_FORMAT(charge_date,"%Y-%m-%d")']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  battery_rept: {
    name: 'battery_rept',
    label: '车辆电池更换记录',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from dat_battery_vehicle bv left join dat_battery b on bv.battery_id = b.battery_id left join dat_staff s on bv.staff_id = s.staff_id left join dat_staff_extend dse on dse.staff_id = s.staff_id where 1=1 {exprString} order by bv.battery_id;',
    fields: {
      names: ['b.name bn', 'bv.vehicle_id', 'bv.use_date', 's.name', 'b.charge_date', 'b.staff_id', 'ifnull(bv.remark, "") as remark', 'ifnull(b.remark, "") as remarkb'],
      types: ['NUMBER', 'SELECT', 'DATETIME', 'SELECT', 'DATETIME', 'SELECT', 'STRING', 'STRING'],
      labels: ['电池编号', '安装车辆', '安装日期', '安装人', '充电日期', '充电人', '安装备注', '充电备注']
    },
    exprFields: [{
        name: 'b.battery_id',
        label: '电池编号',
        type: 'NUMBER'
      },
      {
        name: 'date(use_date)',
        label: '安装日期',
        type: 'DAY'
      },
      {
        name: 'bv.vehicle_id',
        label: '安装车辆',
        type: 'SELECT'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'getDat',
        funFields: ['date(bv.use_date)']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  vehicle_check: {
    name: 'vehicle_check',
    label: '车辆保养记录',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_maintenance hm left join his_checkparts_data hcd on hm.maintenance_id = hcd.maintenance_id left join dat_vehicle dv on hm.vehicle_id = dv.vehicle_id left join dat_vehicle_extend dve on dve.vehicle_id = dv.vehicle_id left join dat_checkpartsitem dc on dc.checkpartsitem_id = hcd.checkpartsitem_id left join dat_checkparts dch on dch.checkparts_id = dc.checkparts_id where 1=1 {exprString};',
    fields: {
      names: ['dve.card_id', 'dv.vehicle_id', 'dv.vehicle_type_id', 'hm.driver', 'dc.name', 'dch.name as dchn', 'hcd.stat', 'maintainer', 'maintain_leader', 'date_format(hm.maintenance_date, "%Y-%m-%d %H:%i:%s")'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'DATETIME'],
      labels: ['车卡号', '车牌号', '车辆类型', '司机', '检查项', '检查部位', '检查情况', '检修人', '检修负责人', '检查时间']
    },
    exprFields: [{
        name: 'dve.card_id',
        label: '车卡号',
        type: 'STRING'
      },
      {
        name: 'dv.vehicle_id',
        label: '车牌号',
        type: 'SELECT'
      },
      {
        name: 'dv.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'dc.checkpartsitem_id',
        label: '检查项',
        type: 'SELECT'
      },
      {
        name: 'dch.checkparts_id',
        label: '检查部位',
        type: 'SELECT'
      },
      {
        name: 'date(maintenance_date)',
        label: '检查时间',
        type: 'DAY'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'getDat',
        funFields: ['date(maintenance_date)']
      }
    }],
    needBreakdown: false,
    autoExec: true
  },

  operation_rate: {
    name: 'operation_rate',
    label: '车辆开机率日报',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_startup_detail ds left join rpt_sanlv_daily_detail rsd on rsd.dept_id = ds.dept_id left join rpt_sanlv_daily_main rsm on rsm.ID = rsd.MainID where 1=1 {exprString} group by ds.dept_id, date_format(ds.start_up_time, "%Y-%m-%d")',
    fields: {
      names: ['ds.dept_id', 'sum(ds.real_startup_time) as r_time', '(ds.schedule_work_time) as s_time', 'concat(format(sum(ds.real_startup_time)/(ds.schedule_work_time)*100, 2), "%") as opra', 'date_format(ds.start_up_time,"%Y-%m-%d")', 'rsd.Analysis', 'rsm.ID'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'DATE', 'STRING'],
      labels: ['队组', '当日累计开机时间', '当日应开机时间', '开机率', '日期', '分析']
    },
    exprFields: [{
        name: 'ds.dept_id',
        label: '队组',
        type: 'SELECT'
      },
      {
        name: 'date_format(ds.start_up_time,"%Y-%m-%d")',
        label: '日期',
        type: 'DAY'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }]
  },

  operation_rate_month: {
    name: 'operation_rate_month',
    label: '车辆开机率月报',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_startup_detail ds left join rpt_sanlv_daily_detail rsd on rsd.dept_id = ds.dept_id left join rpt_sanlv_daily_main rsm on rsm.ID = rsd.MainID where 1=1 {exprString} group by ds.dept_id, date_format(ds.start_up_time, "%Y-%m")',
    fields: {
      names: ['ds.dept_id', 'sum(ds.real_startup_time) as r_time', 'sum(ds.schedule_work_time) as s_time', 'concat(format(sum(ds.real_startup_time)/sum(ds.schedule_work_time)*100, 2), "%") as opra', 'date_format(ds.start_up_time,"%Y-%m")', 'rsd.Analysis', 'rsm.ID'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'DATE', 'STRING'],
      labels: ['队组', '当月累计开机时间', '当月应开机时间', '开机率', '日期', '分析']
    },
    exprFields: [{
        name: 'ds.dept_id',
        label: '队组',
        type: 'SELECT'
      },
      {
        name: 'date_format(ds.start_up_time,"%Y-%m")',
        label: '日期',
        type: 'MONTH'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }]
  },

  regular_cycle: {
    name: 'regular_cycle',
    label: '正规循环率日报',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_regular_cycle_detail drc left join rpt_sanlv_daily_detail rsd on rsd.dept_id = drc.dept_id left join rpt_sanlv_daily_main rsm on rsm.ID = rsd.MainID where 1=1 {exprString} group by drc.dept_id, date_format(drc.start_time, "%Y-%m-%d")',
    fields: {
      names: ['drc.dept_id', 'sum(drc.detail_value) as r_time', '(drc.schedule_value) as s_time', 'concat(format(sum(drc.detail_value)/(drc.schedule_value)*100, 2), "%") as opra', 'date_format(drc.start_time,"%Y-%m-%d")', 'rsd.Analysis', 'rsm.ID'],
      types: ['NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'DATE', 'STRING'],
      labels: ['部门', '当日实际刀数', '当日计划刀数', '当日正规循环率', '日期', '分析']
    },
    exprFields: [{
        name: 'drc.dept_id',
        label: '部门',
        type: 'SELECT'
      },
      {
        name: 'date_format(drc.start_time,"%Y-%m-%d")',
        label: '日期',
        type: 'DAY'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }]
  },

  regular_cycle_month: {
    name: 'regular_cycle_month',
    label: '正规循环率月报',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_regular_cycle_detail drc left join rpt_sanlv_daily_detail rsd on rsd.dept_id = drc.dept_id left join rpt_sanlv_daily_main rsm on rsm.ID = rsd.MainID where 1=1 {exprString} group by drc.dept_id, date_format(drc.start_time, "%Y-%m")',
    fields: {
      names: ['drc.dept_id', 'sum(drc.detail_value) as r_time', 'sum(drc.schedule_value) as s_time', 'concat(format(sum(drc.detail_value)/sum(drc.schedule_value)*100, 2), "%") as opra', 'date_format(drc.start_time,"%Y-%m")', 'rsd.Analysis', 'rsm.ID'],
      types: ['NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'DATE', 'STRING'],
      labels: ['部门', '当日实际刀数', '当日计划刀数', '当日正规循环率', '日期', '分析']
    },
    exprFields: [{
        name: 'drc.dept_id',
        label: '部门',
        type: 'SELECT'
      },
      {
        name: 'date_format(drc.start_time,"%Y-%m")',
        label: '日期',
        type: 'MONTH'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }]
  },

  v_area: {
    name: 'v_area',
    label: '车辆运行轨迹',
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from dat_vehicle v inner join his_location_area la on v.card_id = la.card_id left join dat_area a on la.area_id = a.area_id left join dat_dept d on v.dept_id = d.dept_id left join dat_map m on la.map_id = m.map_id where 1=1 {exprString} group by date_format(la.enter_time,"%Y-%m-%d");',
    fields: {
      names: ['v.card_id', 'v.name', 'd.name ddn', 'v.name', 'v.vehicle_type_id', 'group_concat(m.name,"-",a.name)', 'min(la.enter_time) as enter', 'max(la.leave_time) as lea'],
      types: ['NUMBER', 'STRING', 'SELECT', 'STRING', 'SELECT', 'STRING', 'DATETIME', 'DATETIME'],
      labels: ['车卡号', '车牌号', '所属部门', '车辆名称', '车辆类型', '所经地图与区域', '出车时间', '回车时间']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '车卡号',
        type: 'NUMBER'
      },
      {
        name: 'v.dept_id',
        label: '所属部门',
        type: 'STRING'
      },
      {
        name: 'v.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'v.name',
        label: '车牌号',
        type: 'STRING'
      },
      {
        name: 'min(la.enter_time) enter',
        label: '出车时间',
        type: 'DATETIME'
      },
      {
        name: 'max(la.leave_time) lea',
        label: '回车时间',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  v_track_detail: {
    name: 'vehicle_track_detail',
    label: '车辆轨迹明细',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_location where 1=1 {exprString};',
    fields: {
      names: ['card_id', 'cur_time', 'x', 'y', 'map_id', 'area_id'],
      types: ['NUMBER', 'DATETIME', 'NUMBER', 'NUMBER', 'SELECT', 'SELECT'],
      labels: ['卡号', '时间', 'X', 'Y', '所属地图', '所属区域']
    },
    needBreakdown: false, // 是否需要下钻？
    autoExec: true // 当切换到当前报表时，是否自动执行查询操作
  },

  v_overcount: {
    name: 'vehicle_overcount_alarm',
    label: '车辆超员告警',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 2) hed left join (select event_id, cur_time from his_event_data where stat=100 and event_type_id = 2) hed1 on hed.event_id = hed1.event_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_vehicle v on v.vehicle_id = hed.obj_id left join dat_vehicle_type dvt on dvt.vehicle_type_id = v.vehicle_type_id where 1=1 {exprString};',
    fields: {
      names: ['v.card_id', 'v.name', 'ifnull(v.vehicle_type_id, " ")', 'hed.limit_value', 'hed.cur_value', 'ifnull(date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s"), " ")', 'ifnull(date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ")'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME'],
      labels: ['卡号', '车牌号', '车辆类型', '限制人数(人)', '实际人数(人)', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'v.name',
        label: '车牌号',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'hed.cur_time',
        label: '开始告警时间',
        type: 'DATETIME'
      },
      {
        name: 'hed1.cur_time',
        label: '结束告警时间',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false, // 是否需要下钻？
    breakdown: { // 下钻配置
      opLabel: '详情', // 下钻按钮的文字
      targetQuery: 'v_overcount_detail',
      params: ['start_time', 'end_time'],
      exprList: [{
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 >= {start_time}',
          value: 'att.start_time >= "{start_time}"'
        },
        {
          type: 'FIXED',
          logicLabel: '并且',
          logicValue: 'and',
          label: '开始时间 <= {end_time}',
          value: 'att.start_time <= "{end_time}"'
        }
      ]
    }
  },

  v_overcount_detail: {
    name: 'vehicle_overcount_detail',
    label: '超员告警明细',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from rpt_attendance att, dat_vehicle v where att.card_id=v.card_id {exprString};',
    fields: {
      names: ['count(v.card_id) as ncount', 'v.card_id', 'v.name', 'v.vehicle_type_id', 'v.name', 'v.dept_id', 'att.start_time', 'att.end_time'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'SELECT', 'STRING', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['总数', '卡号', '车辆名称', '车辆类型', '车辆编号', '所属部门', '开始时间', '结束时间']
    },
    // exprFields: [
    //         { name: 'v.card_id', label: '卡号', type: 'STRING' },
    //         { name: 'v.dept_id', label: '所属部门', type: 'SELECT' },
    //         { name: 'v.vehicle_type_id', label: '车辆类型', type: 'SELECT' },
    //         { name: 'v.number', label: '车牌号', type: 'STRING' }
    //         // { name: 'att.start_time', label: '开始时间', type: 'DATETIME' }  // 时间段由上一次查询结果直接转入
    // ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false, // 是否需要下钻？
    autoExec: true // 当切换到当前报表时，是否自动执行查询操作
  },

  v_area_important: {
    name: 'vehicle_enter_importent_area',
    label: '出入重点区域',
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_location_area la, dat_area a, dat_vehicle v where la.area_id = a.area_id and la.card_id = v.card_id and a.area_type_id=2 {exprString};',
    fields: {
      names: ['v.card_id', 'v.name', 'v.vehicle_type_id', 'v.name', 'v.dept_id', 'la.area_id', 'a.area_type_id', 'la.enter_time', 'la.leave_time', 'Concat(TIMESTAMPDIFF(HOUR, enter_time, ifnull(leave_time, current_timestamp())), "时",TIMESTAMPDIFF(MINUTE, enter_time, ifnull(leave_time, current_timestamp())) %60, "分") as retention_time'],
      types: ['NUMBER', 'STRING', 'SELECT', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['卡号', '车辆名称', '车辆类型', '车辆编号', '所属部门', '区域名称', '区域类型', '进入时间', '离开时间', '滞留时长']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '卡号',
        type: 'NUMBER'
      },
      {
        name: 'v.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'v.name',
        label: '车辆名称',
        type: 'STRING'
      },
      {
        name: 'la.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        name: 'la.enter_time',
        label: '进入时间',
        type: 'DATETIME'
      },
      {
        name: 'la.leave_time',
        label: '离开时间',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  person_area_important: {
    name: 'person_area_important',
    label: '人员出入重点区域',
    needDisplay: 1,
    areaDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_location_area la, dat_staff sta, dat_area a where la.area_id = a.area_id and la.card_id = sta.card_id and a.area_type_id=2 {exprString};',
    fields: {
      names: ['sta.card_id', 'sta.name', 'sta.dept_id', 'sta.area_id', 'a.area_type_id', 'la.enter_time', 'la.leave_time', 'Concat(TIMESTAMPDIFF(HOUR, enter_time, ifnull(leave_time, current_timestamp())), "时",TIMESTAMPDIFF(MINUTE, enter_time, ifnull(leave_time, current_timestamp())) %60, "分") as retention_time'],
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
      labels: ['卡号', '姓名', '所属部门', '区域名称', '区域类型', '进入时间', '离开时间', '滞留时长']
    },
    exprFields: [{
        name: 'sta.card_id',
        label: '卡号',
        type: 'NUMBER'
      },
      {
        name: 'sta.name',
        label: '姓名',
        type: 'STRING'
      },
      {
        name: 'sta.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'sta.area_id',
        label: '区域名称',
        type: 'SELECT'
      },
      {
        name: 'la.enter_time',
        label: '进入时间',
        type: 'DATETIME'
      },
      {
        name: 'la.leave_time',
        label: '离开时间',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  v_overtime: {
    name: 'vehicle_over_time',
    label: '车辆超时告警',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 14) hed left join (select event_id, cur_time from his_event_data where stat=100 and event_type_id = 14) hed1 on hed.event_id = hed1.event_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_vehicle v on v.card_id = hed.obj_id left join dat_dept d on d.dept_id = v.dept_id inner join rpt_att_vehicle rav on rav.card_id = hed.obj_id and rav.start_time <= hed.cur_time and rav.end_time >= hed.cur_time where 1=1 {exprString} order by rav.start_time desc;',
    fields: {
      names: ['v.card_id', 'ifnull(d.name, " ")', 'v.name', 'v.name', 'ifnull(v.vehicle_type_id, " ")', 'hed.limit_value', 'hed.cur_value', 'date_format(rav.start_time, "%Y-%m-%d %H:%i:%s")', 'date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s")', 'date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s")'],
      types: ['NUMBER', 'STRING', 'SELECT', 'STRING', 'SELECT', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME'],
      labels: ['卡号', '所属部门', '车牌号', '车辆名称', '车辆类型', '规定时长(时)', '实际时长(时)', '出车时间', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'v.name',
        label: '车辆名称',
        type: 'STRING'
      },
      {
        name: 'v.dept_id',
        label: '所属部门',
        type: 'STRING'
      },
      {
        name: 'v.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'hed.cur_time',
        label: '开始告警时间',
        type: 'DATE'
      },
      {
        name: 'hed1.cur_time as end_time',
        label: '结束告警时间',
        type: 'DATE'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  speed_detail: {
    name: 'speed_detail',
    label: '车速明细',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_location hl inner join dat_vehicle v on hl.card_id = v.card_id where 1=1 {exprString};',
    fields: {
      names: ['v.name', 'hl.speed', 'date_format(hl.cur_time, "%H:%i:%s")', 'date_format(hl.cur_time,"%Y-%m-%d")'],
      types: ['NUMBER', 'NUMBER', 'DATETIME', 'DATE'],
      labels: ['车牌号', '时速1(Km/h)', '时间1', '日期']
    },
    exprFields: [{
        name: 'v.name',
        label: '车牌号',
        type: 'STRING'
      },
      {
        name: 'date_format(hl.cur_time,"%Y-%m-%d")',
        label: '日期',
        type: 'DATE'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    // presets: [{
    //   label: '车牌号为GC-CG-1006',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '车牌号 等于 GC-CG-1006', value: 'v.name = "GC-CG-1006"' },
    //     { type: 'EDITABLE', label: `日期为 ${getDat()}`, value: `date_format(hl.cur_time,"%Y-%m-%d")=${getDat()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: false
  },

  v_runlight: {
    name: 'v_runlight',
    label: '闯红灯告警',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_event_data hed, dat_vehicle v,dat_light l,dat_dept d,dat_driver_arrange arr,dat_staff s,rpt_att_staff ras where hed.obj_id = v.vehicle_id and hed.event_type_id = 23 and hed.x = l.x and v.dept_id = d.dept_id and v.vehicle_id = arr.vehicle_id and s.staff_id = arr.staff_id and date_format(hed.cur_time,"%Y-%m-%d") = arr.driver_date and hed.cur_time between ras.start_time and ras.end_time and arr.shift_id = ras.shift_id {exprString};',
    fields: {
      names: ['s.name', 'v.name', 'ifnull(d.name, " ")', 'ifnull(v.name, " ")', 'l.name as ln', 'date_format(hed.cur_time, "%Y-%m-%d %H:%i")'],
      types: ['STRING', 'NUMBER', 'STRINT', 'STRINT', 'SELECT', 'DATE'],
      labels: ['司机', '车牌号', '所属部门', '车辆类型', '被闯红灯', '时间']
    },
    exprFields: [{
        name: 's.staff_id',
        label: '司机',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'v.name',
        label: '车牌号',
        type: 'NUMBER'
      },
      {
        name: 'd.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'l.light_id',
        label: '被闯红灯',
        type: 'STRING'
      },
      {
        name: 'start_time',
        label: '开始时间',
        type: 'DATE'
      },
      {
        name: 'end_time',
        label: '结束时间',
        type: 'DATE'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  v_exception_detail: {
    name: 'vehicle_exception_detail',
    label: '车辆告警明细',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_alarm_card ai, dat_vehicle v where ai.card_id = v.card_id {exprString};',
    fields: {
      names: ['v.card_id', 'v.name', 'v.dept_id', 'v.name', 'v.vehicle_type_id', 'ai.alarm_type_id', 'ai.start_time', 'ai.end_time'],
      types: ['NUMBER', 'STRING', 'SELECT', 'STRING', 'SELECT', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['卡号', '车牌号', '所属部门', '车辆名称', '车辆类型', '报警类型', '开始时间', '结束时间']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '卡号',
        type: 'NUMBER'
      },
      {
        name: 'v.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'v.number',
        label: '车牌号',
        type: 'STRING'
      },
      {
        name: 'ai.start_time',
        label: '开始时间',
        type: 'DATETIME'
      },
      {
        name: 'ai.end_time',
        label: '结束时间',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: true
  },

  vehicle_part: {
    name: 'vehicle_part',
    label: '车辆配件更换记录',
    needDisplay: 1,
    sqlTmpl: 'select {resultFields} from his_maintenance hm inner join his_parts_data hpd on hm.maintenance_id = hpd.maintenance_id left join dat_vehicle v on hm.vehicle_id = v.vehicle_id left join dat_parts p on hpd.parts_id = p.parts_id left join dat_parts_type pt on p.parts_type_id = pt.parts_type_id where 1=1 {exprString};',
    fields: {
      names: ['v.card_id', 'v.vehicle_id', 'v.vehicle_type_id', 'hm.driver', 'p.name', 'pt.name as dchn', 'hm.maintainer', 'maintain_leader', 'date_format(hm.maintenance_date,"%Y-%m-%d %H:%i:%s")'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'STRING', 'DATETIME'],
      labels: ['卡号', '车牌号', '车辆类型', '司机', '配件名称', '配件类型', '检修人', '检修负责人', '检查时间']
    },
    exprFields: [{
        name: 'v.card_id',
        label: '卡号',
        type: 'NUMBER'
      },
      {
        name: 'v.vehicle_id',
        label: '车牌号',
        type: 'SELECT'
      },
      {
        name: 'v.vehicle_type_id',
        label: '车辆类型',
        type: 'SELECT'
      },
      {
        name: 'p.parts_id',
        label: '配件名称',
        type: 'SELECT'
      },
      {
        name: 'pt.parts_type_id',
        label: '配件类型',
        type: 'SELECT'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },
  /*
    vehicle_type_day: {
      name: 'vehicle_type_day',
      label: '车辆状态日报统计表',
      needDisplay: 1,
      sqlTmpl: `select name,count(vehicle_id) as total,sum(guzhang) as guzhang,sum(weixiu)  as weixiu,sum(baoyang) as baoyang,sum(chuche) as chuche from(select vehicle_id, name,case when sum(guzhang) >0 then 1 else 0 end as guzhang,case when sum(weixiu) >0 then 1 else 0 end as weixiu,case when sum(baoyang) >0 then 1 else 0 end as baoyang,case when sum(chuche) >0 then 1 else 0 end as chuche from(select dv.vehicle_id, dvc.name,case when dvs.state_vehicle_id = 1 then 1 else 0 end as guzhang,case when dvs.state_vehicle_id = 2 then 1 else 0 end as weixiu,case when dvs.state_vehicle_id = 3 then 1 else 0 end as baoyang,case when isnull(leave_time) then 0 else 1 end as chuche from dat_vehicle dv left join dat_vehicle_type dvt on dv.vehicle_type_id = dvt.vehicle_type_id left join dat_vehicle_category dvc on dvt.vehicle_category_id = dvc.vehicle_category_id left join ( select * from dat_vehicle_state where date(start_time) = ${getDay()}) dvs on dv.vehicle_id = dvs.vehicle_id left join (select * from dat_vehicle_drive where date(leave_time) = ${getDay()}) dvd on dv.vehicle_id = dvd.vehicle_id) tab group by vehicle_id, name) vehTab where 1=1 group by name;`,
      fields: {
        names: ['name', 'count(vehicle_id) as total', 'sum(guzhang) as guzhang', 'sum(weixiu) as weixiu', 'sum(baoyang) as baoyang', 'sum(chuche) as chuche'],
        types: ['STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER'],
        labels: ['车辆类型', '总数', '故障数量', '维修数量', '保养数量', '出车数量']
      },
      exprFields: [
        { name: 'date(start_time) && date(leave_time)', label: '日期', type: 'DATE' }
      ],
      exprList: [
        { type: 'FIXED', label: '所有', value: '1=1' }
      ],
      // presets: [{
      //   label: '日期',
      //   conditions: [
      //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
      //     { type: 'EDITABLE', label: `时间 为 ${getDay()}`, value: `date(start_time)=${getDay()} && date(leave_time)=${getDay()}`, logicLabel: '并且', logicValue: 'and' }
      //   ]
      // }],
      needBreakdown: false,
      autoExec: false
    },

    vehicle_type_month_detail: {
      name: 'vehicle_type_month_detail',
      label: '车辆状态月报明细表',
      needDisplay: 1,
      sqlTmpl: `select sta.name,sta.vehicle_type_id, sum(guzhang) as guzhang,sum(weixiu) as weixiu,sum(baoyang) as baoyang,ifnull(vdr.chu,0) as chuche from (select dv.vehicle_id, ta.shift,dv.vehicle_type_id,dv.name,case when ta.state_vehicle_id=1 then 1 else 0 end as guzhang,case when ta.state_vehicle_id=2 then 1 else 0 end as weixiu,case when ta.state_vehicle_id=3 then 1 else 0 end as baoyang,ta.start_time from dat_vehicle dv left join (select tab.vehicle_id, case when tab.zao=0 and tab.wu=0 and tab.wan=0 then 0 else 1 end as shift, tab.state_vehicle_id, tab.start_time from (select vehicle_id, case when time(start_time) > '06:00:00' and time(start_time) < '13:00:00' then 1 else 0 end as 'zao',case when time(start_time) > '13:00:00' and time(start_time) < '21:00:00' then 1 else 0 end as 'wu',case when time(start_time) > '21:00:00' or time(start_time) < '06:00:00' then 1 else 0 end as 'wan', state_vehicle_id, start_time from dat_vehicle_state where date_format(start_time,"%Y-%m")=${getMon()}) tab) ta on dv.vehicle_id = ta.vehicle_id) sta left join (select vehicle_id,count(shift_id) as chu,leave_time from dat_vehicle_drive where date_format(leave_time,"%Y-%m")=${getMon()} group by vehicle_id) vdr on sta.vehicle_id=vdr.vehicle_id group by sta.vehicle_id;`,
      fields: {
        names: ['sta.name', 'sta.vehicle_type_id', 'sum(guzhang) as guzhang', 'sum(weixiu) as weixiu', 'sum(baoyang) as baoyang', 'vdr.chu'],
        types: ['STRING', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER'],
        labels: ['车牌号', '车辆类型', '故障班次数', '维修班次数', '保养班次数', '出车班次数']
      },
      exprFields: [
        { type: 'MONTH', selectOptin: [
          {name: 'start_time', label: '月份'},
          {start:{ name: 'start_time' }, end:{ name: 'start_time'}, label: '开始时间-结束时间'}
          ]
        }
      ],
      exprList: [
        // { type: 'EDITABLE', label: `时间 为 ${getDay()}`, value: `${getDay()}`, logicLabel: '并且', logicValue: 'and' }
        { type: 'FIXED', label: '所有', value: '1=1' }
      ],
      // presets: [{
      //   label: '日期',
      //   conditions: [
      //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
      //     { type: 'EDITABLE', label: `月份 为 ${getMon()}`, value: `date_format(start_time,'%Y-%m')=${getMon()} && date_format(leave_time, '%Y-%m')=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
      //   ]
      // }],
      needBreakdown: false,
      autoExec: false
    },

    vehicle_type_day_detail: {
      name: 'vehicle_type_day_detail',
      label: '车辆状态日报明细表',
      needDisplay: 1,
      sqlTmpl: `select v.name,v.vehicle_type_id,case when tb.zao>0 then '出车' else case when tt.zao >0 then dsv1.name else '-' end end as zao,case when tb.zhong>0 then '出车' else case when tt.zhong >0 then dsv2.name else '-' end end as zhong,case when tb.wan>0 then '出车' else case when tt.wan >0 then dsv3.name else '-' end end as wan from dat_vehicle v left join(select tab.vehicle_id, sum(tab.zao) as zao, sum(tab.zhong) as zhong, sum(tab.wan) as wan,tab.start_time from(select vehicle_id, case shift_id when 1 then state_vehicle_id else  0 end as zao,case shift_id when  2 then state_vehicle_id else  0 end as zhong,case shift_id when  3 then state_vehicle_id else  0 end as wan,date(start_time) as start_time from dat_vehicle_state where date(start_time)=${getDay()}) tab group by tab.vehicle_id) tt on v.vehicle_id = tt.vehicle_id left join(select ta.vehicle_id, sum(ta.zao) as zao, sum(ta.zhong) as zhong, sum(ta.wan) as wan,ta.leave_time from(select vehicle_id, case shift_id when 1 then 1 else  0 end as zao,case shift_id when  2 then 1 else  0 end as zhong,case shift_id when  3 then 1 else  0 end as wan,date(leave_time) as leave_time from dat_vehicle_drive where date(leave_time)=${getDay()}) ta group by ta.vehicle_id) tb on v.vehicle_id = tb.vehicle_id left join dat_state_vehicle dsv1 on tt.zao = dsv1.state_vehicle_id left join dat_state_vehicle dsv2 on tt.zhong = dsv2.state_vehicle_id left join dat_state_vehicle dsv3 on tt.wan = dsv3.state_vehicle_id;`,
      fields: {
        names: ['v.name', 'v.vehicle_type_id', 'case when tb.zao>0 then "出车" else case when tt.zao >0 then dsv1.name else "-" end end as zao', 'case when tb.zhong>0 then "出车" else case when tt.zhong >0 then dsv2.name else "-" end end as zhong', 'case when tb.wan>0 then "出车" else case when tt.wan >0 then dsv3.name else "-" end end as wan'],
        types: ['STRING', 'SELECT', 'STRING', 'STRING', 'STRING'],
        labels: ['车牌号', '车辆类型', '早班状态', '中班状态', '晚班状态']
      },
      exprFields: [
        { name: 'date(start_time) && date(leave_time)', label: '日期', type: 'DATE' }
      ],
      exprList: [
        // { type: 'EDITABLE', label: `时间 为 ${getDay()}`, value: `${getDay()}`, logicLabel: '并且', logicValue: 'and' }
        { type: 'FIXED', label: '所有', value: '1=1' }
      ],
      // presets: [{
      //   label: '日期',
      //   conditions: [
      //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
      //     { type: 'EDITABLE', label: `日期 为 ${getDay()}`, value: `date_format(start_time,'%Y-%m')=${getDay()} && date_format(leave_time, '%Y-%m')=${getDay()}`, logicLabel: '并且', logicValue: 'and' }
      //   ]
      // }],
      needBreakdown: false,
      autoExec: false
    },

    vehicle_type_month: {
      name: 'vehicle_type_month',
      label: '车辆状态月报统计表',
      needDisplay: 1,
      sqlTmpl: `select name,count(vehicle_id) as total,sum(guzhang) as guzhang,sum(weixiu)  as weixiu,sum(baoyang) as baoyang,sum(chuche) as chuche from(select vehicle_id, name,case when sum(guzhang) >0 then 1 else 0 end as guzhang,case when sum(weixiu) >0 then 1 else 0 end as weixiu,case when sum(baoyang) >0 then 1 else 0 end as baoyang,case when sum(chuche) >0 then 1 else 0 end as chuche from(select dv.vehicle_id, dvc.name,case when dvs.state_vehicle_id = 1 then 1 else 0 end as guzhang,case when dvs.state_vehicle_id = 2 then 1 else 0 end as weixiu,case when dvs.state_vehicle_id = 3 then 1 else 0 end as baoyang,case when isnull(leave_time) then 0 else 1 end as chuche from dat_vehicle dv left join dat_vehicle_type dvt on dv.vehicle_type_id = dvt.vehicle_type_id left join dat_vehicle_category dvc on dvt.vehicle_category_id = dvc.vehicle_category_id left join ( select * from dat_vehicle_state where date(start_time) = ${getMon()}) dvs on dv.vehicle_id = dvs.vehicle_id left join (select * from dat_vehicle_drive where date(leave_time) = ${getMon()}) dvd on dv.vehicle_id = dvd.vehicle_id) tab group by vehicle_id, name) vehTab where 1=1 group by name;`,
      fields: {
        names: ['name', 'count(vehicle_id) as total', 'sum(guzhang) as guzhang', 'sum(weixiu) as weixiu', 'sum(baoyang) as baoyang', 'sum(chuche) as chuche'],
        types: ['STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER'],
        labels: ['车辆类型', '总数', '故障数量', '维修数量', '保养数量', '出车数量']
      },
      exprFields: [
        { type: 'MONTH', selectOptin: [
          {name: 'start_time', label: '月份'},
          {start:{ name: 'start_time' }, end:{ name: 'start_time'}, label: '开始时间-结束时间'}
          ]
        }
      ],
      exprList: [
        { type: 'FIXED', label: '所有', value: '1=1' }
      ],
      // presets: [{
      //   label: '月份',
      //   conditions: [
      //     { type: 'EDITABLE', label: `时间 为 ${getMon()}`, value: `date_format(start_time,'%Y-%m')=${getMon()} && date_format(leave_time, '%Y-%m')=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
      //   ]
      // }],
      needBreakdown: false,
      autoExec: false
    },
  */
  drivingface_month: {
    name: 'drivingface_month',
    label: '掘进面月报表',
    sqlTmpl: 'select {resultFields} from (select case when tab.zao=0 and tab.wu=0 and tab.wan=0 then 0 else 1 end as shift, tab.start_time,tab.drivingface_id,tab.cur_finish_length from(select case when time(start_time) > "06:00:00" and time(end_time) < "13:00:00" then 1 else 0 end as "zao",case when time(start_time) > "13:00:00" and time(end_time) < "21:00:00" then 1 else 0 end as "wu",case when time(start_time) > "21:00:00" then 1 else 0 end as "wan",start_time, drivingface_id, cur_finish_length from his_drivingface_his) tab ) ba where 1=1 {exprString} group by date_format(ba.start_time, "%Y-%m"), ba.drivingface_id',
    fields: {
      names: [' ba.drivingface_id', 'sum(ba.cur_finish_length)', 'count(ba.shift)', 'date_format(ba.start_time, "%Y-%m")'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'DATETIME'],
      labels: ['掘进面名称', '掘进长度(米)', '掘进班数', '掘进月份']
    },
    exprFields: [{
        name: 'drivingface_id',
        label: '掘进面名称',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'ba.start_time',
            label: '月份'
          },
          {
            start: {
              name: 'ba.start_time'
            },
            end: {
              name: 'ba.start_time'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  drivingface_day: {
    name: 'drivingface_day',
    label: '掘进面日报表',
    sqlTmpl: 'select {resultFields} from his_drivingface_his hdh left join his_drivingface_real hdr on hdh.drivingface_id = hdr.drivingface_id and date(start_time) = date(cur_time) where 1=1 {exprString} group by date(start_time),hdh.drivingface_id',
    fields: {
      names: ['hdh.drivingface_id', 'hdh.shift_id', 'sum(cur_finish_length) as leng', 'hdr.average_speed', 'max(hdr.speed)', 'date_format(start_time,"%Y-%m-%d")'],
      types: ['SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'DATETIME'],
      labels: ['掘进面名称', '班次', '掘进距离', '平均速度', '最大速度', '掘进时间']
    },
    exprFields: [{
      name: 'hdh.drivingface_id',
      label: '掘进面名称',
      type: 'SELECT'
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  coalface_month: {
    name: 'coalface_month',
    label: '综采面月报表',
    sqlTmpl: 'select {resultFields} from (select case when tab.zao=0 and tab.wu=0 and tab.wan=0 then 0 else 1 end as shift, tab.start_time,tab.mechanized_id,tab.cur_finish_length from(select case when time(start_time) > "06:00:00" and time(end_time) < "13:00:00" then 1 else 0 end as "zao",case when time(start_time) > "13:00:00" and time(end_time) < "21:00:00" then 1 else 0 end as "wu",case when time(start_time) > "21:00:00" then 1 else 0 end as "wan",start_time, mechanized_id,cur_finish_length from his_mechanized_his) tab) ba left join dat_coalface dc on ba.mechanized_id = dc.mechanized_id where 1=1 {exprString} group by date_format(ba.start_time, "%Y-%m"), ba.mechanized_id',
    fields: {
      names: ['ba.mechanized_id', 'sum(ba.cur_finish_length)/knife_length', 'sum(cur_finish_length)/knife_length*knife_ton', 'date_format(ba.start_time, "%Y-%m") '],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'DATETIME'],
      labels: ['掘进面名称', '掘进距离(米)', '采煤量(吨)', '开始月份']
    },
    exprFields: [{
      name: 'hdh.drivingface_id',
      label: '掘进面编号',
      type: 'SELECT'
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  coalface_day: {
    name: 'coalface_day',
    label: '综采面日报表',
    sqlTmpl: 'select {resultFields} from his_mechanized_his hmh left join dat_coalface dc on hmh.mechanized_id = dc.mechanized_id left join his_mechanized_real hmr on hmh.mechanized_id = hmr.mechanized_id where 1=1 {exprString} group by date(hmh.start_time),hmh.mechanized_id',
    fields: {
      names: ['hmh.mechanized_id', 'hmh.shift_id', 'sum(cur_finish_length)/knife_length*knife_ton', 'average_speed', 'max(speed)'],
      types: ['SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER'],
      labels: ['综采面面名称', '班次', '采煤量', '平均速度', '最大速度']
    },
    exprFields: [{
      name: 'hdh.drivingface_id',
      label: '掘进面编号',
      type: 'SELECT'
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  v_dept_month: {
    name: 'v_dept_month',
    label: '部门考勤月报',
    sqlTmpl: 'select {resultFields} from (select dept_id,att.att_date,att.card_id from rpt_att_vehicle att left join dat_vehicle v on att.card_id = v.card_id)aa left join dat_dept d on d.dept_id = aa.dept_id left join rpt_att_vehicle rav on rav.att_date = aa.att_date where 1=1 {exprString} group by d.dept_id,date_format(rav.att_date, "%Y-%m");',
    fields: {
      names: ['d.name', 'date_format(rav.att_date, "%Y-%m") as month', 'count(d.dept_id) as m_count',
        'format(sum(TIMESTAMPDIFF(MINUTE, rav.start_time, rav.end_time)/60.0), 1) as work_time',
        'format(sum(TIMESTAMPDIFF(MINUTE, rav.start_time, rav.end_time))/60.0/count(rav.card_id), 1)as avg_work_time'
      ],
      types: ['SELECT', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER'],
      labels: ['部门名称', '月份', '次数', '合计时长(时)', '平均时长(时)']
    },
    exprFields: [{
        name: 'd.dept_id',
        label: '部门名称',
        type: 'SELECT'
      },
      {
        type: 'MONTH',
        selectOptin: [{
            name: 'rav.att_date',
            label: '月份'
          },
          {
            start: {
              name: 'rav.att_date'
            },
            end: {
              name: 'rav.att_date'
            },
            label: '开始时间-结束时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    // presets: [{
    //   label: '本月考勤',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
    //     { type: 'EDITABLE', label: `时间 为 ${getMon()}`, value: `date_format(rav.att_date, "%Y-%m")=${getMon()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: false
  },

  v_dept_day: {
    name: 'v_dept_day',
    label: '部门考勤日报',
    sqlTmpl: 'select {resultFields} from (select dept_id,att.att_date,att.card_id from rpt_att_vehicle att left join dat_vehicle v on att.card_id = v.card_id)aa left join dat_dept d on d.dept_id = aa.dept_id left join rpt_att_vehicle rav on rav.att_date = aa.att_date where 1=1 {exprString} group by d.dept_id,aa.att_date order by rav.end_time desc;',
    fields: {
      names: ['d.name', 'date_format(aa.att_date, "%Y-%m-%d")', 'count(aa.att_date) as m_count', 'format(sum(TIMESTAMPDIFF(MINUTE, rav.start_time, rav.end_time)/60.0), 1) as work_time', 'format(sum(TIMESTAMPDIFF(MINUTE, rav.start_time, rav.end_time))/60.0/count(rav.card_id), 1) as avg_work_time'],
      types: ['SELECT', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER'],
      labels: ['部门名称', '日期', '次数', '合计时长(时)', '平均时长(时)']
    },
    exprFields: [{
        name: 'd.dept_id',
        label: '部门名称',
        type: 'SELECT'
      },
      {
        name: 'rav.start_time',
        label: '开始时间',
        type: 'DATE'
      },
      {
        name: 'rav.end_time',
        label: '结束时间',
        type: 'DATE'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  driver: {
    name: 'driver',
    label: '司机排班',
    needDisplay: 1,
    sqlTmpl: 'SELECT {resultFields} FROM(SELECT s.name,v.name,IFNULL(shift_id,"total") shift_id,driver_date FROM dat_driver_arrange dda INNER JOIN dat_staff s ON dda.staff_id = s.staff_id INNER JOIN dat_vehicle v ON dda.vehicle_id = v.vehicle_id WHERE driver_date = "2017-04-01" GROUP BY dda.vehicle_id, shift_id, driver_date WITH ROLLUP HAVING driver_date IS NOT NULL)tb2 GROUP BY tb2.name, tb2.driver_date WITH ROLLUP HAVING driver_date IS NOT NULL',
    fields: {
      names: ['number', 'date_format(driver_date,"%Y-%m-%d")', 'MAX(CASE shift_id WHEN "1" THEN name ELSE 0 END) as "早"', 'MAX(CASE shift_id WHEN "2" THEN name ELSE 0 END) as "中"', 'MAX(CASE shift_id WHEN "3" THEN name ELSE 0 END) as "晚"'],
      types: ['NUMBER', 'STRING', 'STRING', 'STRING', 'STRING'],
      labels: ['车牌号', '日期', '早', '中', '晚']
    },
    exprFields: [{
      name: 's.staff_id',
      label: '姓名',
      type: 'SELECT'
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  leader: {
    name: 'leader',
    label: '领导明细',
    sqlTmpl: 'select {resultFields} from dat_staff sta, dat_level lev, dat_state s where lev.level_id = sta.level_id and sta.state = s.state {exprString};',
    fields: {
      names: ['sta.name', 'sta.dept_id', 'lev.leader', 'sta.card_id', 'sta.sex', 's.name as sn', 'sta.lastUpdate'],
      types: ['STRING', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING', 'DATATIME'],
      labels: ['姓名', '所属部门', '职务', '卡号', '性别', '状态', '入井时间']
    },
    exprFields: [{
        name: 'sta.name',
        label: '姓名',
        type: 'STRING'
      },
      {
        name: 'sta.dept_id',
        label: '所属部门',
        type: 'SELECT'
      },
      {
        name: 'lev.leader',
        label: '职务',
        type: 'SELECT'
      },
      {
        name: 'sta.card_id',
        label: '卡号',
        type: 'SELECT'
      },
      {
        name: 'sta.lastUpdata',
        label: '入井时间',
        type: 'DATATIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  inspection_detail_mouth: {
    name: 'inspection_detail_mouth',
    label: '巡检路线考勤月报详情',
    sqlTmpl: 'select {resultFields} from routing_count c, dat_staff s, dat_occupation o, routing_detail d where s.staff_id = c.staff_id and o.occupation_id = s.occupation_id and d.routing_duty_id = c.routing_duty_id {exprString};',
    fields: {
      names: ['c.routing_duty_id', 'c.routing_path_id', 's.name', 's.occupation_id', 'd.area_check_time', 'd.area_arrive_time', 'd.state'],
      types: ['NUMBER', 'NUMBER', 'STRING', 'SELECT', 'DATATIME', 'DATATIME', 'STRING'],
      labels: ['巡检任务编号', '巡检路线编号', '巡检人员', '巡检检查区域名', '要求到达时间', '实际到达时间', '考勤状态']
    },
    exprFields: [{
        name: 's.staff_name',
        label: '巡检人员',
        type: 'STRING'
      },
      {
        name: 's.occupation_id',
        label: '巡检检查区域名',
        type: 'SELECT'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  alarm_reader: {
    name: 'alarm_reader',
    label: '分站通信异常报警明细',
    sqlTmpl: `select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 6) hed left join (select event_id, obj_id, cur_time from his_event_data where stat=100 and event_type_id = 6) hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_reader r on hed.obj_id = r.reader_id where 1=1 {exprString} order by hed.cur_time desc;`,
    fields: {
      names: ['CAST(hed.obj_id AS signed)', 'r.name', 'et.event_type_id', 'ifnull(date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s"), " ")', 'ifnull(date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ")'],
      types: ['NUMBER', 'STRING', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['分站号', '分站名称', '报警类型', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'r.reader_id',
        label: '分站号',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    // presets: [{
    //   label: '日期',
    //   conditions: [
    //     { type: 'EDITABLE', label: `开始告警时间晚于等于 ${getDay()}`, value: `hed.cur_time>=${getDay()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  alarm_reader_charge: {
    name: 'alarm_reader_charge',
    label: '分站供电告警明细',
    sqlTmpl: `select {resultFields} from (select * from his_event_data where stat=0 and event_type_id = 33) hed left join (select event_id, obj_id, cur_time from his_event_data where stat=100 and event_type_id = 33) hed1 on hed.event_id = hed1.event_id and hed.obj_id = hed1.obj_id left join dat_event_type et on hed.event_type_id = et.event_type_id inner join dat_reader r on hed.obj_id = r.reader_id where 1=1 {exprString} order by hed.cur_time desc;`,
    fields: {
      names: ['CAST(hed.obj_id AS signed)', 'r.name', 'et.event_type_id', 'ifnull(date_format(hed.cur_time, "%Y-%m-%d %H:%i:%s"), " ")', 'ifnull(date_format(hed1.cur_time, "%Y-%m-%d %H:%i:%s"), " ")'],
      types: ['NUMBER', 'STRING', 'SELECT', 'DATETIME', 'DATETIME'],
      labels: ['分站号', '分站名称', '报警类型', '开始告警时间', '结束告警时间']
    },
    exprFields: [{
        name: 'r.reader_id',
        label: '分站号',
        type: 'SELECT'
      },
      {
        type: 'DATE',
        selectOptin: [{
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed.cur_time'
            },
            label: '开始告警时间-开始告警时间'
          },
          {
            start: {
              name: 'hed.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '开始告警时间-结束告警时间'
          },
          {
            start: {
              name: 'hed1.cur_time'
            },
            end: {
              name: 'hed1.cur_time'
            },
            label: '结束告警时间-结束告警时间'
          }
        ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: {
        funName: 'intervalTime',
        funFields: ['hed.cur_time', 'hed.cur_time']
      }
    }],
    // presets: [{
    //   label: '日期',
    //   conditions: [
    //     { type: 'EDITABLE', label: `开始告警时间晚于等于 ${getDay()}`, value: `hed.cur_time>=${getDay()}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false,
    autoExec: true
  },

  v_his_data: {
    name: 'v_his_data',
    label: '分站存储历史数据',
    sqlTmpl: 'select {resultFields} from his_raw_data hr, dat_reader r, dat_vehicle v where hr.card_id = v.card_id and hr.reader_id = r.reader_id {exprString};',
    fields: {
      names: ['v.card_id', 'v.name', 'ifnull(v.vehicle_type_id, " ")', 'ifnull(v.name, " ")', 'ifnull(v.dept_id, " ")', 'ifnull(r.reader_id, " ")', 'ifnull(r.name, " ")', 'ifnull(hr.rec_time, " ")', 'ifnull(hr.his_time, " ")'],
      types: ['SELECT', 'STRING', 'SELECT', 'STRING', 'SELECT', 'NUMBER', 'STRING', 'DATETIME', 'DATETIME'],
      labels: ['卡号', '车辆名称', '车辆类型', '车辆编号', '所属部门', '分站编号', '分站名称', '上传时间', '记录时间']
    },
    exprFields: [{
        name: 'r.reader_id',
        label: '分站编号',
        type: 'SELECT'
      },
      {
        name: 'hr.rec_time',
        label: '记录时间',
        type: 'DATETIME'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  reader_range_area: {
    name: 'reader_range_area',
    label: '分站识别区域查询',
    sqlTmpl: 'select {resultFields} from his_location_area la inner join dat_staff s on la.card_id = s.card_id inner join dat_reader_range_area rra on rra. {exprString};',
    fields: {
      names: ['s.name', 'a.area_id', 'pd.enter_time', 'pd.leave_time', 'ps.name as sname'],
      types: ['STRING', 'SELECT', 'DATATIME', 'DATATIME', 'SELECT'],
      labels: ['巡检人员', '巡检检查区域名', '要求到达时间', '实际到达时间', '状态']
    },
    exprFields: [{
        name: 's.name',
        label: '巡检人员',
        type: 'STRING'
      },
      {
        name: 'a.area_id',
        label: '巡检检查区域名',
        type: 'SELECT'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: true
  },

  l_exception: {
    name: 'l_exception',
    label: '红绿灯异常告警',
    sqlTmpl: 'select {resultFields} from his_event_data hed inner join dat_light l on l.light_id=hed.obj_id and hed.event_type_id = 8 left join dat_event_type det on hed.event_type_id = det.event_type_id where 1=1 {exprString};',
    fields: {
      names: ['l.light_id', 'l.name', 'det.name as dn', 'hed.cur_time'],
      types: ['STRING', 'STRING', 'SELECT', 'DATETIME'],
      labels: ['红绿灯号', '红绿灯名称', '报警类型', '发生时间']
    },
    exprFields: [{
        name: 'l.light_id',
        label: '红绿灯名称',
        type: 'SELECT'
      },
      {
        name: 'hed.cur_time',
        label: '发生时间',
        type: 'DATE'
      },
      {
        name: 'leave_time',
        label: '结束时间',
        type: 'DATE'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  operate_log: {
    name: 'operate_log',
    label: '操作日志',
    sqlTmpl: 'select {resultFields} from his_op_log where 1=1 {exprString} order by op_time desc',
    fields: {
      names: ['op_id', 'user_id', 'op_time', 'ip', 'op_type_id', 'ifnull(detail, " ")'],
      types: ['NUMBER', 'STRING', 'DATETIME', 'STRING', 'SELECT', 'STRING'],
      labels: ['编号', '用户', '操作时间', 'IP', '操作类型', '内容']
    },
    exprFields: [{
        name: 'user_id',
        label: '用户',
        type: 'STRING'
      },
      {
        name: 'op_type_id',
        label: '操作类型',
        type: 'SELECT'
      },
      // { name: 'date_format(time,"%Y-%m-%d")', label: '操作时间', type: 'DAY' },
      {
        type: 'DATE',
        selectOptin: [{
          start: {
            name: 'op_time'
          },
          end: {
            name: 'op_time'
          },
          label: '开始时间-结束时间'
        }, ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    // 可以在这里预设置一些常用的查询主题，这里是示例
    // presets: [{
    //   label: '用户 HANK 最近6个小时 的操作日志',
    //   conditions: [
    //     { type: 'EDITABLE', logicLabel: '并且', logicValue: 'and', label: '用户ID 等于 HANK', value: 'user_id = "HANK"' },
    //     { type: 'EDITABLE', label: `时间 晚于 ${getTime(6)}`, value: `time>${getTime(6)}`, logicLabel: '并且', logicValue: 'and' }
    //   ]
    // }],
    needBreakdown: false, // 是否需要下钻？
    autoExec: true
  },

  his_staff_change: {
    name: 'his_staff_change',
    label: '历史人员变更记录',
    sqlTmpl: `select {resultFields} from his_staff_op_log where 1=1 and (detail IS NOT NULL && detail != '') {exprString} order by staff_id, last_update desc;`,
    fields: {
      names: ['staff_id', 'CASE WHEN op_log = "INSERT" THEN "新增" WHEN op_log = "UPDATE" THEN "更新" WHEN op_log = "DELETE" THEN "删除" END AS op_log', 'detail', 'user_id', 'last_update'],
      types: ['STRING', 'STRING', 'STRING', 'STRING', 'DATETIME'],
      labels: ['员工编号', '操作方式', '操作内容', '操作用户', '操作时间']
    },
    exprFields: [{
        name: 'staff_id',
        label: '员工编号',
        type: 'SEARCH'
      },
      {
        name: 'user_id',
        label: '操作人',
        type: 'SEARCH'
      },
      {
        type: 'DATE',
        selectOptin: [{
          start: {
            name: 'last_update'
          },
          end: {
            name: 'last_update'
          },
          label: '开始操作时间-结束操作时间'
        }, ]
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }]
  },

  materiel_bar: {
    name: 'materiel_bar',
    label: '高河能源物料倒运计划表',
    sqlTmpl: 'select {resultFields} from his_materiel_bar_plan mbp where mbp.date_time="2017-6-29" and mbp.shift_id=1 {exprString} order by mbp.work_property;',
    fields: {
      names: ['case when work_property=0 then "日常工作" else "重点工作" end as workpro', 'company_name', 'product_name', 'vehcile_number', 'bar_place', 'discharge_place', 'case when complate_situation=0 then "完成" else "未完成" end as comp'],
      types: ['NUMBER', 'STRING', 'STRING', 'NUMBER', 'STRING', 'STRING', 'NUMBER'],
      labels: ['工作性质', '单位', '品名', '使用车数', '倒运物料地点', '卸料物料地点', '完成情况']
    },
    exprFields: [{
        name: 's.staff_name',
        label: '巡检人员',
        type: 'STRING'
      },
      {
        name: 's.occupation_id',
        label: '巡检检查区域',
        type: 'SELECT'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: false
  },

  operation: {
    name: 'operation',
    label: '运行日志',
    sqlTmpl: 'select {resultFields} from his_operation where 1=1 {exprString}',
    fields: {
      names: ['date_format(time, "%Y-%m-%d %H:%i")', 'op_site', 'op_aspect', 'op_case', 'op_description'],
      types: ['DATETIME', 'STRING', 'STRING', 'STRING', 'STRING'],
      labels: ['时间', '系统', '模块', '事件类型', '事件描述']
    },
    exprFields: [{
        name: 'start_time',
        label: '开始时间',
        type: 'DATATIME'
      },
      {
        name: 'end_time',
        label: '结束时间',
        type: 'DATATIME'
      },
      {
        name: 'op_site',
        label: '系统',
        type: 'STRING'
      },
      {
        name: 'op_aspect',
        label: '模块',
        type: 'STRING'
      },
      {
        name: 'op_case',
        label: '事件类型',
        type: 'STRING'
      }
    ],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    autoExec: false,
    needBreakdown: false // 是否需要下钻？
  },

  efficiency_overview: {
    name: 'efficiency_overview',
    label: '三率总览',
    sqlTmpl: {
      'overview-boot': `select hsr.workface_id, work_face_type as workface_type, need_display, round(sum(hsr.startup_rate) / count(hsr.startup_rate), 1) as worktime, work_date as stime from his_startup_rate hsr, dat_work_face dwf where hsr.workface_id = dwf.work_face_id and need_display = 1 and work_date {exprString} group by work_date`,
      'overview-rugular': `select dept_id, round(sum(worktime)/sum(schedule_value) * 100, 1) as worktime, date(stime) as stime, need_display from (select sum(detail_value) as worktime, schedule_value, date(start_time) as stime, dept_id, need_display from his_regular_cycle_detail hrc left join dat_work_face dwf ON hrc.work_face_id = dwf.work_face_id WHERE start_time {exprString} and need_display = 1 group by date(start_time), hrc.work_face_id)aa group by aa.stime order by aa.stime`,
      'overview-worktime': `select hwr.workface_id, work_face_type as workface_type, need_display, ROUND(sum(hwr.worktime_rate) / count(hwr.worktime_rate), 1) as worktime,  work_date as stime from his_worktime_rate hwr, dat_work_face dwf where hwr.workface_id = dwf.work_face_id and need_display = 1 and work_date {exprString} group by work_date`,
      'dept_boot': `select workface_id, work_face_type as workface_type, need_display, rank, round(startup_rate, 1) AS worktime,work_date as stime from his_startup_rate hsr, dat_work_face dwf where hsr.workface_id = dwf.work_face_id and work_date {exprString} group by workface_id, work_date, work_face_type;`,
      'dept_rugular': `SELECT ROUND(SUM(worktime) / schedule_value * 100, 1) AS worktime, stime, dept_id, ROUND(sum(worktime),2) as sumnum, work_face_id, work_face_type, need_display, rank FROM (SELECT SUM(detail_value) AS worktime, schedule_value, DATE(start_time) AS stime, hrc.dept_id, dwf.work_face_id, dwf.work_face_type, dwf.need_display, dwf.rank FROM his_regular_cycle_detail hrc LEFT JOIN dat_work_face dwf on hrc.work_face_id = dwf.work_face_id WHERE start_time {exprString} GROUP BY DATE(start_time), work_face_id ORDER BY start_time)aa GROUP BY stime, dept_id ORDER BY stime;`,
      'dept_worktime': `select rate_id, ROUND(sum(hwr.worktime_rate) / count(hwr.worktime_rate), 1) as worktime, workface_id, work_face_type as workface_type, work_date as stime, avg_valid_time as overWorktime, avg_invalid_time as overChecktime, need_display, rank from his_worktime_rate hwr, dat_work_face dwf where hwr.workface_id = dwf.work_face_id and work_date {exprString} group by workface_id, work_date, work_face_type`
    },
    fields: {
      names: '',
      types: '',
      labels: ''
    },
    exprFields: [{
      type: 'MONTH',
      selectOptin: [{
        name: 'month',
        label: '月份'
      }]
    }],
    exprList: [
      // { type: 'EDITABLE', label: `时间 为 ${getDay()}`, value: `${getMonth()}`, logicLabel: '并且', logicValue: 'and' }
      {
        type: 'EDITABLE',
        label: '所有',
        value: {
          funName: 'getMonth',
          funFields: null
        }
      }
    ],
    autoExec: true
  },

  efficiency_manage: {
    name: 'efficiency_manage',
    label: '管理调度日报',
    sqlTmpl: {
      'dept_boot': `select round(startup_rate, 1) as worktime, round(startup_time,2) as overWorktime,  round( schedule_work_time ,2) as overChecktime, workface_id, work_face_type as workface_type, need_display, rank from his_startup_rate hsr, dat_work_face dwf where hsr.workface_id = dwf.work_face_id and work_date between {exprString} group by workface_id, workface_type`,
      'analysis': `select Rpt_Type, rsdd.work_face_id, Analysis, work_face_type, rsdm.ID from rpt_sanlv_daily_main rsdm, rpt_sanlv_daily_detail rsdd, dat_work_face dwf where rsdm.ID = rsdd.MainID and rsdd.work_face_id = dwf.work_face_id and rsdm.CreateDateTime between {exprString};`,
      'dept_rugular': `SELECT ROUND(SUM(worktime) / schedule_value * 100, 1) AS worktime, stime,dept_id, ROUND(SUM(worktime),1) AS sumnum,round(SUM(worktime), 2) as overWorktime, round(schedule_value, 2) as overChecktime, work_face_type AS workface_type, work_face_id, need_display, rank FROM (SELECT SUM(detail_value) AS worktime, schedule_value, DATE(start_time) AS stime, hrc.dept_id, hrc.work_face_id, dv.work_face_type, need_display, rank FROM his_regular_cycle_detail hrc LEFT JOIN dat_work_face dv ON hrc.work_face_id = dv.work_face_id WHERE DATE(start_time) between {exprString} GROUP BY DATE(start_time), work_face_id ORDER BY start_time)aa GROUP BY stime, dept_id ORDER BY dept_id;`,
      'planing': `select workface_id,work_face_type,schedule_startup_time as boot_time,case when work_face_type = 1 then schedule_mine_times else schedule_tunnelling_times end as planing,schedule_date from dat_workface_scheduling dws left join dat_work_face dwf on dws.workface_id = dwf.work_face_id where schedule_date between {exprString};`,
      'dept_worktime': `select round(sum(hwr.worktime_rate) / count(hwr.worktime_rate), 1) as worktime, round(sum(avg_valid_time) / count(hwr.worktime_rate), 2) as overWorktime, round(sum(avg_invalid_time)/count(hwr.worktime_rate), 2) as overChecktime, workface_id, work_face_type as workface_type, need_display, rank from his_worktime_rate hwr, dat_work_face dwf where hwr.workface_id = dwf.work_face_id and work_date between {exprString} group by workface_id, work_face_type;`
    },
    fields: {
      names: [],
      types: [],
      labels: []
    },
    exprFields: [{
      name: 'day',
      label: '查询日期',
      type: 'DAY'
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    autoExec: true
  },

  worktime_dept_shift: {
    name: 'worktime_dept_shift',
    label: '队组班次工作面时长表',
    sqlTmpl: `select {resultFields} from his_worktime_rate hwr left join his_worktime_rate_detail hwrd on hwr.rate_id = hwrd.rate_id left join dat_work_face dwf on hwr.workface_id = dwf.work_face_id where 1=1 {exprString}`,
    fields: {
      names: ['hwrd.staff_count as num', 'hwrd.avg_valid_time as worktime', 'hwrd.shift_id', 'hwr.workface_id', 'work_face_type as workface_type'],
      types: ['NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER'],
      labels: ['人数', '平均时长', '班次', '工作面ID', '工作面属性']
    },
    exprFields: [{
      name: 'hwr.work_date',
      label: '时间',
      type: 'DAY'
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    needBreakdown: false,
    autoExec: true
  },

  worktime_detail_table: {
    name: 'worktime_detail_table',
    label: '工时详情',
    sign: 1,
    needDisplay: 1,
    sqlTmpl: `SELECT {resultFields} FROM (SELECT SUM(case when end_work_time then real_work_time ELSE (NOW() - start_work_time) END) AS worktime,hwd.staff_id, DATE(start_work_time) AS stime,schedule_work_time, dept_id, hwd.shift_id,start_work_time as start_time, end_work_time as end_time, dse.need_display FROM his_worktime_detail hwd LEFT JOIN dat_staff_extend dse ON hwd.staff_id=dse.staff_id INNER JOIN dat_area da ON hwd.work_area_id = da.area_id AND da.area_type_id = 2000 WHERE {exprString} AND proc_tag = 1 {exprStringDept} GROUP BY staff_id) aa LEFT JOIN (select staff_id, sum(motionless_time) as dtime, date(start_time) as att_date, start_time, end_time, shift_id from his_motionless_detail hmd, dat_area da WHERE hmd.area_id = da.area_id AND da.area_type_id = 2000 AND {exprStringLess} group by staff_id) bb ON aa.staff_id = bb.staff_id AND aa.stime = bb.att_date`,
    fields: {
      names: ['aa.staff_id', 'aa.dept_id', 'date_format(stime,"%Y-%m-%d")', 'case when bb.dtime then (worktime-bb.dtime) else worktime end as real_worktime', 'bb.dtime as dtime', 'case when bb.dtime then concat(round((worktime-bb.dtime)/worktime*100,2),"%") else "100%" end as worktime_eff', 'aa.start_time', 'aa.end_time'],
      types: ['SELECT', 'SELECT', 'STRING', 'NUMBER', 'NUMBER', 'STRING', 'DATETIME', 'DATETIME'],
      labels: ['姓名', '队组', '日期', '有效时长(h)', '无效时长(h)', '工时利用率', '进入区域时间', '出区域时间']
    },
    exprFields: [{
        name: 'dept_id',
        label: '队组',
        type: 'SELECT'
      },
      {
        name: 'shift_id',
        label: '班次',
        type: 'SELECT'
      },
      {
        name: 'start_work_time',
        label: '时间',
        type: 'DAY'
      }
    ],
    exprList: [
      // { type: 'FIXED', label: '所有', value: { funName: 'getDayTime', funFields:['start_work_time']}}
    ],
    needBreakdown: false,
    autoExec: true
  },

  rugular_total: {
    name: 'rugular_total',
    label: '三率综合数据',
    sqlTmpl: {
      'dept_rugular': `SELECT ROUND(SUM(worktime) / schedule_value * 100, 1) AS worktime, stime, dept_id, ROUND(sum(worktime),2) as sumnum, vehicle_type_id, vehicle_id FROM (SELECT SUM(detail_value) AS worktime, schedule_value, DATE(start_time) AS stime, hrc.dept_id, hrc.vehicle_id,dv.vehicle_type_id FROM his_regular_cycle_detail hrc left join dat_vehicle dv on hrc.vehicle_id = dv.vehicle_id WHERE DATE(start_time) between {exprString} GROUP BY DATE(start_time), vehicle_id ORDER BY start_time)aa GROUP BY stime, dept_id ORDER BY stime;`,
      'displacement': `select dept_id, hdp.position_data as position_data, avg_distance from his_draw_position hdp left join dat_vehicle_extend dve on hdp.vehicle_id = dve.vehicle_id where DATE(write_time) between {exprString};`,
      'gasment': `select aa.dept_id, hsd.sensor_id, concat_ws(',', date_format(hsd.write_time, "%Y-%m-%d %H:%i:%S"),hsd.data_value) as switch_data, write_time, sensor_type_id from his_sensor_data hsd inner join ( select sensor_id, sensor_type_id, dve.dept_id from dat_sensor ds, dat_vehicle_extend dve where ds.vehicle_id = dve.vehicle_id)aa on hsd.sensor_id = aa.sensor_id and DATE(hsd.write_time) between {exprString};`,
      'bootswitch': `select hsd.dept_id, concat_ws(',', date_format(hsd.start_up_time, "%Y-%m-%d %H:%i:%S"),1) as open_data, concat_ws(',', date_format(case when hsd.shut_down_time is null then now() else hsd.shut_down_time end, "%Y-%m-%d %H:%i:%S"),0) as close_data from his_startup_detail hsd where DATE(hsd.start_up_time) between {exprString} order by hsd.dept_id, hsd.start_up_time;`
    },
    fields: {
      names: [],
      types: [],
      labels: []
    },
    exprFields: [{
      name: 'day',
      label: '查询日期',
      type: 'DAY'
    }],
    exprList: [{
      type: 'FIXED',
      label: '所有',
      value: '1=1'
    }],
    autoExec: true
  }
}

export default reptQuery
