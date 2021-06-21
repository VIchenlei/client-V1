let fuzzySearch = {
  antenna: {
    name: 'antenna',
    desc: 'name',
    label: '天线',
    placeholder: '天线、分站编号、名称',
    keys: ['name', 'antenna_id', 'reader_id', 'spy']
  },
  vehicle_type: {
    name: 'vehicle_type',
    desc: 'name',
    label: '车辆类型',
    placeholder: '车辆类型',
    keys: ['name', 'vehicle_type_id', 'vehicle_category_id', 'vehicle_level_id', 'spy']
  },
  work_face: {
    name: 'work_face',
    desc: 'name',
    label: '工作面表',
    placeholder: '编号或名称',
    keys: ['name', 'work_face_id', 'spy']
  },
  coalface_vehicle: {
    name: 'coalface_vehicle',
    desc: 'coalface_id',
    label: '采煤机与综采面绑定',
    placeholder: '编号、车编号、状态、区域',
    keys: ['coalface_id', 'vehicle_id', 'stat', 'area_id', 'spy']
  },
  drivingface_vehicle: {
    name: 'drivingface_vehicle',
    desc: 'drivingface_id',
    label: '掘进面',
    placeholder: '编号、车编号、状态、区域',
    keys: ['drivingface_id', 'vehicle_id', 'stat', 'area_id', 'spy']
  },
  card: {
    name: 'card', // 标识卡
    desc: 'card_id',
    label: '标识卡',
    placeholder: '卡号',
    keys: ['card_id', 'card_type_id', 'ident', 'spy'], // 字段，card_id = card_type_id + card_ident
  },
  month: {
    name: 'month', // 标识卡
    desc: 'id',
    label: '月报日期管理',
    placeholder: 'id、开始日期、结束日期',
    keys: ['id', 'start_time', 'end_time'], // 字段，card_id = card_type_id + card_ident
  },
  reader_path_tof_n: {
    name: 'reader_path_tof_n',
    desc: 'reader_id',
    label: '分站覆盖范围',
    placeholder: '分站编号或路径标志',
    keys: ['reader_id', 'tof_flag', 'spy']
  },
  coalface: {
    name: 'coalface',
    desc: 'coalface_id',
    label: '综采面',
    placeholder: '编号',
    keys: ['coalface_id', 'vehicle_id', 'stat', 'area_id', 'spy']
  },
  drivingface: {
    name: 'drivingface',
    desc: 'drivingface_id',
    label: '掘进面',
    placeholder: '编号',
    keys: ['drivingface_id', 'vehicle_id', 'stat', 'area_id', 'spy']
  },
  drivingface_warning_point: {
    name: 'drivingface_warning_point',
    desc: 'warning_point_id',
    label: '掘进面告警点管理',
    placeholder: '编号、名称、状态、区域',
    keys: ['drivingface_id', 'warning_point_id', 'warning_point_name', 'spy']
  },
  drivingface_worktype_permission: {
    name: 'drivingface_worktype_permission',
    desc: 'worktype_id',
    label: '掘进面工种管理',
    placeholder: '工种编号',
    keys: ['worktype_id', 'spy']
  },
  map_gis: {
    name: 'map_gis',
    desc: 'name',
    label: '地图管理',
    placeholder: '编号或名称',
    keys: ['map_id', 'name', 'spy']
  },
  geofault: {
    name: 'geofault',
    desc: 'geofault_name',
    label: '地址断层',
    placeholder: '编号或名称',
    keys: ['geofault_name', 'geofault_id', 'spy']
  },
  sensor: {
    name: 'sensor',
    desc: 'sensor_desc',
    label: '传感器管理',
    placeholder: '编号、绑定工作面',
    keys: ['sensor_id', 'sensor_desc', 'spy']
  },
  ip_address: {
    name: 'ip_address',
    desc: 'ip_address_id',
    label: 'IP地址管理',
    placeholder: '编号',
    keys: ['ip_address_id', 'spy']
  },
  sanlv_standart: {
    name: 'sanlv_standart',
    desc: 'sanlv_standart_id',
    label: '三率标准表',
    placeholder: '编号',
    keys: ['sanlv_standart_id', 'spy']
  },
  parts_type: {
    name: 'parts_type',
    desc: 'name',
    label: '车辆配件类型',
    placeholder: '编号',
    keys: ['parts_type_id', 'name', 'spy']
  },
  coalface_render: {
    name: 'coalface_render',
    desc: 'coalface_id',
    label: '综采面分站管理',
    placeholder: '编号',
    keys: ['coalface_id', 'name', 'spy']
  },
  patrol_task: {
    name: 'patrol_task',
    desc: 'patrol_task_id',
    label: '巡检排班管理',
    placeholder: '编号或名称',
    keys: ['staff_id', 'name', 'spy', 'patrol_task_id']
  },
  // his_patrol_data: {
  //   name: 'his_patrol_data',
  //   desc: 'name',
  //   label: '巡检记录管理',
  //   placeholder:'请输入巡检路径编号或名称',
  //   keys: ['spy','patrol_path_id','name','patrol_state_id','patrol_task_id']
  // },
  patrol_path_type: {
    name: 'patrol_path_type',
    desc: 'name',
    label: '巡检路线类型',
    placeholder: '编号或名称',
    keys: ['name', 'patrol_type_id', 'spy']
  },
  patrol_path_detail: {
    name: 'patrol_path_detail',
    desc: 'order_id',
    label: '巡检路线类型',
    placeholder: '编号或名称',
    keys: ['name', 'order_id', 'spy']
  },
  dept: {
    name: 'dept',
    desc: 'name',
    label: '部门',
    placeholder: '部门名称',
    keys: ['name', 'dept_id', 'spy']
  },
  dept_ck: {
    name: 'dept_ck',
    desc: 'name',
    label: '部门',
    placeholder: '部门名称',
    keys: ['name', 'dept_id', 'spy']
  },
  staff: {
    name: 'staff',
    desc: 'name',
    label: '人员',
    placeholder: '姓名',
    keys: ['name', 'spy', 'staff_id', 'card_id']
  },
  vehicle: {
    name: 'vehicle',
    desc: 'name',
    label: '车辆',
    placeholder: '车牌名称',
    keys: ['name', 'spy', 'vehicle_id']
  },
  reader: {
    name: 'reader',
    desc: 'name',
    label: '分站',
    placeholder: '分站名称',
    keys: ['reader_id', 'name', 'spy']
  },
  occupation: {
    name: 'occupation',
    desc: 'name',
    label: '职务',
    placeholder: '职务',
    keys: ['occupation_id', 'name', 'spy']
  },
  area: {
    name: 'area',
    desc: 'name',
    label: '区域',
    placeholder: '区域名称',
    keys: ['area_id', 'name', 'spy']
  },
  shift: {
    name: 'shift',
    desc: 'name',
    label: '班次',
    placeholder: '班次',
    keys: ['short_name', 'name', 'spy', 'shift_id']
  },
  user: {
    name: 'user',
    label: '用户',
    desc: 'name',
    placeholder: '用户名',
    keys: ['user_id', 'name', 'spy']
  },
  role: {
    name: 'role',
    label: '角色',
    desc: 'name',
    placeholder: '角色名',
    keys: ['role_id', 'name', 'spy']
  },
  rt_person_forbid_down_mine: {
    name: 'rt_person_forbid_down_mine',
    label: '禁止下井人员表',
    desc: 'name',
    placeholder: '名称、编号、卡号',
    keys:['name', 'spy', 'staff_id', 'card_id']
  },
  // his_leader_arrange: {
  //   name: 'his_leader_arrange',
  //   label: '领导排班',
  //   desc: 'name',
  //   placeholder: '名称、编号、卡号',
  //   keys:['name', 'spy', 'staff_id', 'card_id']
  // },
  credentials: {
    name: 'credentials',
    label: '资格证',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `credentials_id`, 'brief_name', 'spy']
  },
  parts: {
    name: 'parts',
    label: '车辆配件',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `parts_id`, 'brief_name', 'spy']
  },
  card_type: {
    name: 'card_type',
    label: '标识卡类型',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `card_type_id`, 'brief_name', 'spy']
  },
  state_card: {
    name: 'state_card',
    label: '标识卡状态',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `state_card_id`, 'brief_name', 'spy']
  },
  state_object: {
    name: 'state_object',
    label: '绑定对象状态',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `state_object_id`, 'brief_name', 'spy']
  },
  state_biz: {
    name: 'state_biz',
    label: '卡业务状态',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `state_biz_id`, 'brief_name', 'spy']
  },
  group: {
    name: 'group',
    label: '班组',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `group_id`, 'brief_name', 'spy']
  },
  worktype: {
    name: 'worktype',
    label: '工种',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `worktype_id`, 'brief_name', 'spy']
  },
  shift_type: {
    name: 'shift_type',
    label: '班制',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `shift_type_id`, 'brief_name', 'spy']
  },
  occupation_level: {
    name: 'occupation_level',
    label: '级别',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `occupation_level_id`, 'brief_name', 'spy']
  },
  education: {
    name: 'education',
    label: '学历',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `education_id`, 'brief_name', 'spy']
  },
  gis_layer: {
    name: 'gis_layer',
    label: '地图图层',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `gis_layer_id`, 'brief_name', 'spy']
  },
  landmark: {
    name: 'landmark',
    label: '地标',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `landmark_id`, 'brief_name', 'spy']
  },
  device_type: {
    name: 'device_type',
    label: '设备类型',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `device_type_id`, 'brief_name', 'spy']
  },
  device_state: {
    name: 'device_state',
    label: '设备状态',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `device_state_id`, 'brief_name', 'spy']
  },
  light: {
    name: 'light',
    label: '红绿灯',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `light_id`, 'brief_name', 'spy']
  },
  lights_group: {
    name: 'lights_group',
    label: '红绿灯组',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `lights_group_id`, 'brief_name', 'spy']
  },
  role_rank: {
    name: 'role_rank',
    label: '角色等级',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `role_rank_id`, 'brief_name', 'spy']
  },
  op_type: {
    name: 'op_type',
    label: '操作类型',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `op_type_id`, 'brief_name', 'spy']
  },
  event_level: {
    name: 'event_level',
    label: '告警级别',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `event_level_id`, 'brief_name', 'spy']
  },
  event_type: {
    name: 'event_type',
    label: '告警类型',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `event_type_id`, 'brief_name', 'spy']
  },
  sosalarm: {
    name: 'sosalarm',
    label: '声光告警',
    desc: 'sosalarm_id',
    placeholder: '编号',
    keys: [`sosalarm_id`]
  },
  setting: {
    name: 'setting',
    label: '系统类型',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `setting_id`, 'brief_name', 'spy']
  },
  rules: {
    name: 'rules',
    label: '规则',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `rules_id`, 'brief_name', 'spy']
  },
  camera: {
    name: 'camera',
    label: '视频',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `camera_id`, 'brief_name', 'spy']
  },
  camera: {
    name: 'camera',
    label: '视频',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', `camera_id`, 'brief_name', 'spy']
  },
  checkpartsitem: {
    name: 'checkpartsitem',
    label: '检查项',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'checkpartsitem_id', 'spy']
  },
  checkparts: {
    name: 'checkparts',
    label: '检查部位',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'checkparts_id', 'spy']
  },
  state_vehicle: {
    name: 'state_vehicle',
    label: '车辆维修状态',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'state_vehicle_id', 'spy']
  },
  patrol_path: {
    name: 'patrol_path',
    label: '巡检路线',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'patrol_path_id', 'spy']
  },
  patrol_state: {
    name: 'patrol_state',
    label: '巡检点状态定义',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'patrol_state_id', 'spy']
  },
  patrol_stay_state: {
    name: 'patrol_stay_state',
    label: '巡检停留状态',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'patrol_stay_state_id', 'spy']
  },
  patrol_point: {
    name: 'patrol_point',
    label: '巡检路线',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'patrol_point_id', 'spy']
  },
  patrol_point_type: {
    name: 'patrol_point_type',
    label: '巡检路线',
    desc: 'name',
    placeholder: '名称、编号、简称',
    keys: ['name', 'patrol_point_type_id', 'spy']
  },
  number_bars: {
    name: 'number_bars',
    label: '数据条数',
    desc: 'id',
    placeholder: '编号',
    keys: ['id', 'fontSize']
  },
  font_size: {
    name: 'font_size',
    label: '字体倍数',
    desc: 'id',
    placeholder: '编号',
    keys: ['id', 'fontSize']
  },
  shift_setting: {
    name: 'shift_setting',
    label: '考勤规则',
    desc: 'id',
    placeholder: '考勤规则',
    keys: ['setting_id', 'value']
  },
  area_persons_dynamic_thre: {
    name: 'area',
    label: '区域人员各时段人员上限',
    desc: 'name',
    placeholder: '区域编号、名称、简拼',
    keys: ['area_id', 'spy', 'name']
  },
  sensor_type: {
    name: 'sensor_type',
    label: '传感器类型',
    desc: 'name',
    placeholder: '传感器类型编号、名称、简拼',
    keys: ['sensor_type_id', 'spy', 'name']
  },
  goaf: {
    name: 'goaf',
    label: '采空区',
    desc: 'name',
    placeholder: '采空区编号、名称、简拼',
    keys: ['goaf_id', 'spy', 'name']
  },
  road_segment: {
    name: 'road_segment',
    label: '路径',
    desc: 'road_segment_id',
    placeholder: '路径编号',
    keys: ['road_segment_id']
  },
  tt_inspection_route_planning: {
    name: 'tt_inspection_route_planning',
    label: '人员规划路线',
    desc: 'name',
    placeholder: '名称、编号、卡号',
    keys:['name', 'spy', 'staff_id']
  },
  reader_rssi: {
    name: 'reader_rssi',
    label: '站盲区间距',
    desc: 'reader_rssi_id',
    placeholder: '站盲区间距',
    keys: ['reader_rssi_id', 'spy']
  },
}
export default fuzzySearch
