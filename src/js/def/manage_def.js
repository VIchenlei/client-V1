let manages = {
  'battery_charge': {
    rows: '',
    def: {
      label: '电池充电',
      name: 'battery',
      keyIndex: 0,
      table: 'dat_battery',
      fields: {
        labels: ['电池编号', '电池名称', '充电人', '充电日期', '备注'],
        names: ['battery_id', 'name', 'staff_id', 'charge_date', 'remark'],
        types: ['SELECT', 'STRING', 'STRING', 'DATETIME', 'STRING'],
        enableNull: [false, false, false, false, true]
      }
    }
  },
  'battery_vehicle': {
    rows: '',
    def: {
      label: '电池安装',
      name: 'battery_vehicle',
      keyIndex: 0,
      table: 'dat_battery_vehicle',
      fields: {
        labels: ['更换车辆', '更换人', '电池编号', '更换日期', '备注'],
        names: ['vehicle_id', 'staff_id', 'battery_id', 'use_date', 'remark'],
        types: ['SELECT', 'STRING', 'SELECT', 'DATETIME', 'STRING'],
        enableNull: [false, false, false, false, true]
      }
    }
  },
  'leader_scheduling': {
    rows: '',
    def: {
      label: '领导排班',
      name: 'leader_arrange',
      keyIndex: 0,
      table: 'his_leader_arrange',
      fields: {
        labels: ['排班日期', '班制', '班次', '姓名'],
        names: ['duty_date', 'shift_type_id', 'shift_id', 'staff_id'], // 字段
        types: ['DATE', 'SELECT', 'SELECT', 'NUMBER'], // 字段类型
        enableNull: [false, false, false, false]
      }
    }
  },
  'transport_back': {
    rows: '',
    def: {
      label: '运输任务反馈',
      name: 'transport_back',
      keyIndex: 0,
      table: 'dat_transport_back',
      fields: {
        labels: ['任务单号', '进料单位', '进料品名', '进料数量(车)', '倒运单位', '倒运品名', '倒运计划量(车)', '倒运完成情况量(车)', '剩料单位', '剩料品名', '剩料数量(车)', '剩料入井时间', '跟班队干', '班组长', '反馈时间', '班次'],
        names: ['tran_back_id', 'dept_id', 'feedstock_commodity', 'feedstock_num', 'reshipment_dept_id', 'reshipment_commodity', 'reshipment_plan', 'reshipment_finish', 'residues_dept_id', 'residues_commodity', 'residues_num', 'enter_time', 'captain', 'monitor', 'date_time', 'shift_id'],
        types: ['NUMBER', 'SELECT', 'STRING', 'NUMBER', 'INPUT', 'STRING', 'NUMBER', 'NUMBER', 'INPUT', 'STRING', 'NUMBER', 'DATETIME', 'INPUT', 'INPUT', 'DATETIME', 'SELECT'],
        enableNull: [false, false, false, false, true, true, true, true, true, true, true, false, false, false, false, false]
      }
    }
  },
  'his_maintenance': {
    rows: '',
    def: {
      label: '保养记录',
      name: 'his_maintenance',
      keyIndex: 0,
      table: 'his_maintenance',
      fields: {
        labels: ['保养记录编号', '车辆名称', '班次', '保养日期', '司机', '检修人', '检修负责人', '备注'],
        names: ['maintenance_id', 'vehicle_id', 'shift_id', 'maintenance_date', 'driver', 'maintainer', 'maintain_leader', 'remark'],
        types: ['NUMBER', 'SELECT', 'SELECT', 'DATETIME', 'STRING', 'STRING', 'STRING', 'STRING'],
        enableNull: [false, false, false, false, false, false, false, true]
      }
    }
  },
  'dat_vehicle_state': {
    rows: '',
    def: {
      name: 'dat_vehicle_state',
      label: '车辆状态登记',
      table: 'dat_vehicle_state',
      keyIndex: 0,
      fields: {
        names: ['vehicle_id', 'start_time', 'end_time', 'shift_id', 'state_vehicle_id'],
        types: ['SELECT', 'DATETIME', 'DATETIME', 'SELECT', 'SELECT'],
        labels: ['车辆名称', '开始时间', '结束时间', '班次', '车辆状态'],
        enableNull: [false, false, false, false, false]
      }
    }
  },
  'dat_vehicle_drive': {
    rows: '',
    def: {
      name: 'dat_vehicle_drive',
      label: '车辆出/回车登记',
      table: 'dat_vehicle_drive',
      keyIndex: 0,
      fields: {
        names: ['vehicle_id', 'leave_time', 'enter_time', 'shift_id', 'staff_id'],
        types: ['SELECT', 'DATETIME', 'DATETIME', 'SELECT', 'STRING'],
        labels: ['车辆名称', '出车时间', '回车时间', '班次', '司机'],
        enableNull: [false, true, false, false, false]
      }
    }
  },
  'battery': {
    rows: '',
    def: {
      label: '电池充电',
      name: 'battery',
      keyIndex: 0,
      table: 'dat_battery',
      fields: {
        labels: ['电池编号', '电池名称', '充电人', '充电日期', '备注'],
        names: ['battery_id', 'name', 'staff_id', 'charge_date', 'remark'],
        types: ['SELECT', 'STRING', 'STRING', 'DATETIME', 'STRING'],
        enableNull: [false, false, false, false, true]
      }
    }
  },
  'personcardstart': {
    lebel: '一人带多卡',
    name: 'personcardstart',
    keyIndex: 0,
    table: '',
    fields: {
      labels: ['卡号', '姓名', '开始时间'],
      names: ['card_id', 'name', 'start_time'],
      types: ['NUMBER', 'STRING', 'DATETIME']
    }
  },
  'personcardend': {
    lebel: '一人带多卡',
    name: 'personcardend',
    keyIndex: 0,
    table: '',
    fields: {
      labels: ['卡号', '姓名', '结束时间'],
      names: ['card_id', 'name', 'end_time'],
      types: ['NUMBER', 'STRING', 'DATETIME']
    }
  },
  'alarmPoint': {
    lebel: '一人带多卡',
    name: 'alarmPoint',
    keyIndex: 0,
    table: '',
    fields: {
      labels: ['卡号', '姓名', '发生时间', 'x坐标', 'y坐标'],
      names: ['card_id', 'name', 'cur_time', 'x', 'y'],
      types: ['NUMBER', 'STRING', 'DATETIME', 'STRING', 'STRING']
    }
  },
  'staffDeptLevel': {
    label: '员工性质',
    name: 'staffDeptLevel',
    keyIndex: 0,
    table: '',
    fields: {
      labels: ['编号', '部门名称', '一线员工数', '二线员工数'],
      names: ['dept_id', 'name', 'frontline', 'secondline'],
      types: ['NUMBER', 'STRING', 'NUMBER', 'NUMBER']
    }
  },
  'staff_lamp': {
    label: '员工矿灯',
    name: 'staff_lamp',
    keyIndex: 0,
    table: '',
    fields: {
      labels: ['工号', '姓名', '部门', '矿灯号'],
      names: ['staff_id', 'name', 'dept_id', 'lampNo'],
      types: ['NUMBER', 'STRING', 'SELECT', 'STRING']
    }
  },
  'coalfaceWork': {
    label: '综采面排班',
    name: 'coalfaceWork',
    keyIndex: 0,
    table: 'dat_workface_scheduling',
    fields: {
      labels: ['综采面名称', '计划开机时长（小时）', '计划刀数（刀）', '排班开始日期', '排班结束日期'],
      names: ['coalface_id', 'schedule_startup_time', 'schedule_mine_times', 'start_time', 'end_time'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'DATE', 'DATE'],
      enableNull: [false, false, false, false, false]
    }
  },
  'drivingfaceWork': {
    label: '掘进面排班',
    name: 'drivingfaceWork',
    keyIndex: 0,
    table: 'dat_workface_scheduling',
    fields: {
      labels: ['掘进面名称', '计划开机时长（小时）', '计划排数（排）', '排班开始日期', '排班结束日期'],
      names: ['drivingface_id', 'schedule_startup_time', 'schedule_tunnelling_times', 'start_time', 'end_time'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'DATE', 'DATE'],
      enableNull: [false, false, false, false, false]
    }
  },
  'coalfaceWorkUpdate': {
    label: '综采面排班',
    name: 'coalfaceWork',
    keyIndex: 0,
    table: 'dat_workface_scheduling',
    fields: {
      labels: ['综采面名称', '计划开机时长（小时）', '计划刀数（刀）', '排班日期'],
      names: ['coalface_id', 'schedule_startup_time', 'schedule_mine_times', 'schedule_date'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'DATE'],
      enableNull: [false, false, false, false]
    }
  },
  'drivingfaceWorkUpdate': {
    label: '掘进面排班',
    name: 'drivingfaceWork',
    keyIndex: 0,
    table: 'dat_workface_scheduling',
    fields: {
      labels: ['掘进面名称', '计划开机时长（小时）', '计划排数（排）', '排班日期'],
      names: ['drivingface_id', 'schedule_startup_time', 'schedule_tunnelling_times', 'schedule_date'],
      types: ['SELECT', 'NUMBER', 'NUMBER', 'DATE'],
      enableNull: [false, false, false, false]
    }
  },
  'his_startup_detail': {
    label: '开机率',
    name: 'his_startup_detail',
    keyIndex: 0,
    table: 'his_startup_detail',
    fields: {
      labels: ['工作面名称', '开始时间', '结束时间', '实际开机时长（小时）', '计划开机时长（小时）', '队组名称'],
      names: ['work_face_id', 'start_up_time', 'shut_down_time', 'real_startup_time', 'schedule_work_time', 'dept_id'],
      types: ['SELECT', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'SELECT'],
      enableNull: [false, false, false, true, true, false]
    }
  },
  'his_regular_cycle_detail': {
    label: '正规循环率',
    name: 'his_regular_cycle_detail',
    keyIndex: 0,
    table: 'his_regular_cycle_detail',
    fields: {
      labels: ['工作面名称', '开始时间', '结束时间', '实际值', '计划值', '队组名称'],
      names: ['work_face_id', 'start_time', 'end_time', 'detail_value', 'schedule_value', 'dept_id'],
      types: ['SELECT', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'SELECT'],
      enableNull: [false, false, false, true, true, false]
    }
  },
  'his_patrol_data': {
      label: '巡检记录表',
      name: 'his_patrol_data',
      keyIndex: 0,
      table: 'his_patrol_data',
      fields: {
      labels: ['巡检任务编号','巡检路径名称', '巡检点名称', '巡检点索引','进入点集时间', '离开点集时间', '巡检状态', '巡检停留状态','卡号'],
      names: ['patrol_task_id','patrol_path_id', 'patrol_point_id','idx', 'enter_time', 'leave_time', 'patrol_state_id', 'patrol_stay_state_id','card_id'],
      types: ['NUMBER', 'SELECT', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'SELECT', 'SELECT', 'NUMBER'],
      enableNull: [ false, false, false, false, false, false, false, false, false]
    }
  },
  // 'rt_person_forbid_down_mine': {
  //   label: '禁止下井人员表',
  //   name: 'rt_person_forbid_down_mine',
  //   keyIndex: 0,
  //   table: 'rt_person_forbid_down_mine',
  //   fields: {
  //     labels: ['记录保存数', '员工编号', '姓名', '部门', '禁止下井起始时间', '新增操作时间', '新增操作员'],
  //     names: ['id', 'staff_id', 'name', 'dept_id', 'start_time', 'oper_time', 'oper_user'],
  //     types: ['NUMBER', 'NUMBER', 'STRING', 'SELECT', 'DATETIME', 'DATETIME', 'STRING'],
  //     enableNull: [ true, false, false, false, false, false, false]
  //   }
  // },
  'area_reader': {
    label: '分站所属区域表',
    name: 'area_reader',
    keyIndex: 0,
    table: 'dat_reader',
    fields: {
      labels: ['区域编号', '区域名称', '分站列表'],
      names: ['area_id', 'name', 'readers'],
      types: ['NUMBER', 'STRING', 'STRING'],
      enableNull: [false, false, true]
    }
  },
  'shift_setting': {
    label: '考勤规则',
    name: 'shift_setting',
    keyIndex: 0,
    table: 'dat_setting',
    fields: {
      labels: ['编号', '名称', '考勤规则'],
      names: ['setting_id', 'name', 'value'],
      types: ['NUMBER', 'STRING', 'SELECT'],
      enableNull: [false, false, false]
    }
  },
  'reader_manager': {
    label: '分站升级',
    name: 'reader_manager',
    keyIndex: 0,
    table: 'dat_reader',
    fields: {
      labels: ['ip地址', '子网掩码'],
      names: ['ip', 'netmask'],
      types: ['STRING', 'STRING'],
      enableNull: [false, false]
    }
  }
}

export {manages}
