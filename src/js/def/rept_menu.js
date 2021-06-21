let reptMenu = [
  {
    title: '人员报表查询',
    icon: 'icon-stats',
    expand: false,
    isShow: true,
    items: [
      { name: 'person_hour', label: '最近一小时人员出入井'},
      { name: 'person', label: '人员出入井明细' },
      { name: 'person_special', label: '人员出入井明细' },
      { name: 'person_area', label: '人员进出区域明细' },
      { name: 'person_location_area', label: '人员区域时刻' },
      { name: 'person_reader', label: '人员进出分站明细' }, // 与历史轨迹跳转分站明细name一致
      { name: 'person_absence', label: '人员未出勤明细' },
      { name: 'person_day', label: '人员考勤日报' },
      { name: 'person_month', label: '人员考勤月报' },
      { name: 'person_s_dept_day', label: '部门考勤日报' },
      { name: 'person_s_dept_month', label: '部门考勤月报' },
      { name: 'person_dept_period', label: '部门时段查询' },
      { name: 'person_well_overtime', label: '人员井下超时告警' },
      { name: 'person_area_overtime', label: '人员区域超时告警' },
      { name: 'person_well_overcount', label: '人员井下超员告警' },
      { name: 'person_area_overcount', label: '人员区域超员告警' },
      { name: 'person_call_help', label: '人员井下呼救告警' },
      { name: 'person_card_battery_alarm', label: '人卡电量低告警' },
      { name: 'person_fixed_alarm', label: '人卡静止不动告警'},
      { name: 'person_area_limited', label: '人员进入限制区域告警' },
      { name: 'person_driver_car_limited', label: '工作面司机与车卡距离告警'},
      { name: 'person_time', label: '人员井下时刻明细' },
      { name: 'person_reader_detail', label: '人员分站告警明细查询'},
      { name: 'person_lamp_number', label: '矿灯使用情况' }
      // { name: 'time_rate', label: '工时利用率日报' }, 
      // { name: 'time_rate_month', label: '工时利用率月报' }
      // { name: 'leader_day', label: '领导考勤日报' },
      // { name: 'leader_month', label: '领导考勤月报' },
      // { name: 'inspection_day', label: '巡检路线考勤日报' },
      // { name: 'inspection_mouth', label: '巡检路线考勤月报'}
    ]
  },
  {
    title: '车辆报表查询',
    icon: 'icon-vehicle',
    expand: false,
    isShow: true,
    items: [
      { name: 'whole_status', label: '整体出车情况' },
      { name: 'vehicle_updown_mine', label: '车辆出车明细' },
      { name: 'vehicle_no_updown_mine', label: '车辆未出车明细' },
      { name: 'area', label: '车辆进出区域明细' },
      { name: 'v_reader', label: '车辆进出分站明细' }, // 与历史轨迹跳转分站明细name一致
      { name: 'v_vehicle_day', label: '车辆考勤日报' },
      { name: 'v_vehicle_month', label: '车辆考勤月报' },
      // { name: 'driver_dept_day', label: '司机考勤日报' },
      // { name: 'driver_dept_month', label: '司机考勤月报' },
      // { name: 'per_mil', label: '司机里程报表' },
      { name: 'v_overspeed', label: '车辆超速告警' },
      // { name: 'vehicle_exception', label: '车卡电量低告警' },
      { name: 'v_area_limited', label: '车辆进入禁止区域告警' },
      { name: 't_s_distance_limited', label: '掘进机与分站距离超限告警'},
      { name: 'c_e_zhuiwei', label: '车辆追尾告警'},
      { name: 'c_g_limited', label: '地质断层距离告警'},
      // { name: 'vehicle_time', label: '车辆井下时刻明细' },
      // { name: 'battery_vehicle_rept', label: '车辆电池充电记录' },
      // { name: 'battery_rept', label: '车辆电池更换记录' },
      // { name: 'vehicle_check', label: '车辆保养记录' },
      // { name: 'operation_rate', label: '车辆开机率日报'},
      // { name: 'operation_rate_month', label: '车辆开机率月报'},
      // { name: 'regular_cycle', label: '正规循环率日报'},
      // { name: 'regular_cycle_month', label: '正规循环率月报'}
      // { name: 'vehicle_part', label: '车辆配件更换记录' },
      // { name: 'v_area', label: '车辆运行轨迹'},
      // { name: 'v_overcount', label: '车辆超员告警' },
      // { name: 'v_overtime', label: '车辆超时告警' },
      // { name: 'speed_detail', label: '车速明细'},
      // { name: 'v_runlight', label: '闯红灯告警' },
      // { name: 'v_dept_day', label: '部门考勤日报' },
      // { name: 'v_dept_month', label: '部门考勤月报' },
      // { name: 'vehicle_type_day_detail', label: '车辆状态日报明细表' },
      // { name: 'vehicle_type_day', label: '车辆状态日报统计表' },
      // { name: 'vehicle_type_day_detail', label: '车辆状态日报明细表' },
      // { name: 'vehicle_type_month_detail', label: '车辆状态月报明细表' },
      // { name: 'vehicle_type_month', label: '车辆状态月报统计表' },
      // { name: 'drivingface_day', label: '掘进面日报表' },
      // { name: 'drivingface_month', label: '掘进面月报表' },
      // { name: 'coalface_day', label: '综采面日报表' },
      // { name: 'coalface_month', label: '综采面月报表' }
      // { name: 'driver', label: '司机排班' }
    ]
  },
  {
    title: '设备报表查询',
    icon: 'icon-facility',
    expand: false,
    isShow: true,
    items: [
      { name: 'alarm_reader', label: '分站通信异常报警明细' },
      { name: 'alarm_reader_charge', label: '分站供电告警明细' }
      // { name: 'v_his_data', label: '分站存储历史数据' },
      // { name: 'reader_range_area', label: '分站识别区域查询'},
      // { name: 'l_exception', label: '红绿灯告警情况' }
    ]
  },
  // {
  //   title: '系统报表查询',
  //   icon: 'icon-stats',
  //   expand: false,
  //   isShow: true,
  //   items: [
  //     { name: 'operate_log', label: '操作日志' }
  //     { name: 'materiel_bar', label: '高河能源物料倒运计划表' }
  //     { name: 'operation', label: '运行日志' }
  //   ]
  // },
  {
    title: '三率报表查询',
    icon: 'icon-efficiency',
    expand: false,
    isShow: true,
    items: [
      { name: 'efficiency_overview', label: '三率总览' },
      { name: 'efficiency_manage', label: '三率管理调度日报' },
      { name: 'worktime_dept_shift', label: '队组班次工作面时长表' },
      { name: 'worktime_detail_table', label: '工时详情' },
 //     { name: 'rugular_total', label: '三率综合数据'}
    ]
  }
]

export default reptMenu