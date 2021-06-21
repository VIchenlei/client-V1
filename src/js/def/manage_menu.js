// menuID与dat_menu表关联，顺序一一对应
let manageMenu = [
  {
    title: '人员管理',
    icon: 'icon-account',
    menuID: 'MA-A00',
    isShow: true,
    items: [
      { name: 'staff', label: '人员基本信息管理' },
      { name: 'staff-level', label: '员工级别管理' },
      { name: 'staff-lamp', label: '员工矿灯管理' }
    ]
  },
  {
    title: '资格证管理',
    icon: 'icon-newspaper',
    menuID: 'MA-B00',
    isShow: true,
    items: [
      { name: 'credentials', label: '资格证类型管理' }
      // { name: 'credentials_staff', label: '资格证信息管理' }
    ]
  },
  {
    title: '排班管理',
    icon: 'icon-arrange',
    menuID: 'MA-C00',
    expand: false,
    isShow: true,
    items: [
      { name: 'driver', label: '司机排班' },
      { name: 'leader_scheduling', label: '领导排班' }
    ]
  },
  {
    title: '车辆管理',
    icon: 'icon-truck',
    menuID: 'MA-D00',
    isShow: true,
    items: [
      { name: 'vehicle_type', label: '车辆类型管理' },
      { name: 'vehicle', label: '车辆基本信息管理' },
      // { name: 'parts', label: '车辆配件管理' },
      // { name: 'parts_type', label: '车辆配件类型管理' },
      // { name: 'checkpartsitem', label: '车辆检查项' },
      // { name: 'checkparts', label: '车辆检查部位' },
      // { name: 'state_vehicle', label: '车辆状态维护' },
      // { name: 'battery', label: '电池充电状态记录' },
      // { name: 'battery_vehicle', label: '电池更换状态记录' },
      // { name: 'his_maintenance', label: '车辆保养管理' },
      // { name: 'dat_vehicle_state', label: '车辆状态管理' },
      // { name: 'dat_vehicle_drive', label: '车辆出/回车管理' }
    ]
  },
  // {
  //   title: '物料运输',
  //   icon: 'icon-material-vehicle-1',
  //   menuID: 'MA-E00',
  //   expand: false,
  //   isShow: true,
  //   items: [
  //     { name: 'materPPT', label: '物料运输流程图' },
  //     { name: 'materiel_bar', label: '物料倒运计划表' },
  //     { name: 'materiel_submitted', label: '物料报送审批计划表' },
  //     { name: 'special_vehicle_plan', label: '特种车计划' }
  //   ]
  // },
  // {
  //   title: '消耗统计',
  //   icon: 'icon-hammer',
  //   menuID: 'MA-F00',
  //   expand: false,
  //   isShow: true,
  //   items: [
  //     { name: 'parts_record', label: '配件消耗记录' },
  //     { name: 'his_vehicle_oilwear', label: '胶轮车柴油消耗记录' }
  //   ]
  // },
  {
    title: '标识卡管理',
    icon: 'icon-card',
    menuID: 'MA-G00',
    isShow: true,
    items: [
      { name: 'card_type', label: '标识卡类型管理' },
      { name: 'state_card', label: '标识卡状态管理' },
      { name: 'state_object', label: '绑定对象状态管理' },
      { name: 'state_biz', label: '卡业务状态管理' },
      { name: 'card', label: '标识卡注册管理' }
    ]
  },
  {
    title: '工作面管理',
    icon: 'icon-hammer',
    menuID: 'MA-H00',
    expand: false,
    isShow: true,
    items: [
      { name: 'work_face', label: '工作面管理' }
    ]
  },
  {
    title: '综采面管理',
    icon: 'icon-hoist-2',
    menuID: 'MA-I00',
    isShow: true,
    items: [
      { name: 'coalface', label: '综采面管理' },
      // { name: 'coalface_render', label: '综采面分站管理' },
    //   { name: 'coalface_vehicle', label: '综采面采煤机管理' },
      { name: 'coalface_work', label: '综采面作业计划' }
    ]
  },
  {
    title: '掘进面管理',
    icon: 'icon-crane-6',
    menuID: 'MA-J00',
    isShow: true,
    items: [
      { name: 'drivingface', label: '掘进面管理' },
      // { name: 'drivingface_render', label: '掘进面分站管理' },
    //   { name: 'drivingface_warning_point', label: '掘进面告警点管理' },
    //   { name: 'drivingface_vehicle', label: '掘进面掘进机管理' },
      // { name: 'drivingface_worktype_permission', label: '掘进面工种管理' },
      { name: 'drivingface_work', label: '掘进面作业计划' }
    ]
  }, 
  {
    title: '三率管理',
    icon: 'icon-stats',
    menuID: 'MA-K00',
    isShow: true,
    items: [
      { name: 'sanlv_schedule', label: '三率结果值' }
    ]
  },
  // {
  //   title: '巡检管理',
  //   icon: 'icon-poll',
  //   menuID: 'MA-L00',
  //   isShow: true,
  //   items: [
  //     { name: 'patrol_task', label: '巡检排班管理' },
  //     { name: 'patrol_data', label: '巡检记录管理' },
  //     { name: 'patrol_path_type', label: '巡检路线类型管理'},
  //     { name: 'patrol_path', label: '巡检路线管理' },
  //     { name: 'patrol_point', label: '巡检点管理' },
  //     { name: 'patrol_point_type', label: '巡检点类型管理' },
  //     { name: 'patrol_path_detail', label: '巡检路线点信息管理' },
  //     { name: 'patrol_state', label: '巡检点状态定义管理' },
  //     { name: 'patrol_stay_state', label: '巡检点停留状态定义管理' }
  //   ]
  // },
   {
    title: '禁止人员下井管理',
    icon: 'icon-account',
    menuID: 'MA-M00',
    isShow: true,
    items: [
      { name: 'rt_person_forbid_down_mine', label: '禁止人员下井管理' }
    ]
  },
  {
    title: '路径管理',
    icon: 'icon-line',
    menuID: 'MA-P00',
    isShow: true,
    items: [
      { name: 'road_segment', label: '路径集' },
      { name: 'tt_inspection_route_planning', label: '人员路线规划' }
    ]
  }
]

export default manageMenu
