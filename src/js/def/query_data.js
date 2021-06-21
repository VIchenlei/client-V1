let queryData = {
  leader_arrange:{
    field:'staff_id', // sql根据字段查询数据库
    sql:`select duty_date, dst.shift_type_id, dla.shift_id, ds.staff_id as staff_id from his_leader_arrange dla, dat_shift_type dst, dat_shift s, dat_staff ds WHERE dla.staff_id = ds.staff_id and dla.shift_id = s.shift_id and s.shift_type_id = dst.shift_type_id and dla.staff_id`,
    sqlname:'leader_scheduling', // 页面标识
    name: 'leader_arrange', //页面def下name
    countSql:`select count(1) as total from his_leader_arrange dla, dat_shift_type dst, dat_shift s, dat_staff ds WHERE dla.staff_id = ds.staff_id and dla.shift_id = s.shift_id and s.shift_type_id = dst.shift_type_id and dla.staff_id`,
    searchName:'staff', // 使用xdata.metaStore.dataInArray.get(searchName) 获取数据集合
    keys:['name', 'spy', 'staff_id', 'card_id'], // 检索keys
    desc: 'name', //根据desc来进行检索
    label: '领导排班',
    placeholder: '请输入姓名' // 输入框提示
  },
  dat_vehicle_state:{
    field:'vehicle_id',
    sql:'select * from dat_vehicle_state where vehicle_id',
    sqlname:'dat_vehicle_state',
    name: 'dat_vehicle_state',
    countSql:'select count(1) as total from dat_vehicle_state where vehicle_id',
    searchName:'vehicle',
    keys:['vehicle_id', 'spy', 'name', 'vehicle_type_id'],
    desc: 'name', //根据desc来进行检索
    label: '车辆状态',
    placeholder: '请输入名称、车牌号'
  },
  his_maintenance:{
    field:'vehicle_id',
    sql:'select * from his_maintenance where vehicle_id',
    sqlname:'his_maintenance',
    name: 'his_maintenance',
    countSql:'select count(1) as total from his_maintenance where vehicle_id',
    searchName:'vehicle',
    keys:['vehicle_id', 'spy', 'name', 'maintenance_id'],
    desc: 'name', //根据desc来进行检索
    label: '车辆保养',
    placeholder: '请输入名称、车牌号'
  },
  dat_vehicle_drive:{
    field:'vehicle_id',
    sql:`select vehicle_id, enter_time, leave_time, shift_id, staff_id from dat_vehicle_drive where vehicle_id`,
    sqlname:'dat_vehicle_drive',
    name: 'dat_vehicle_drive',
    countSql:'select count(1) as total from dat_vehicle_drive where vehicle_id',
    searchName:'vehicle',
    keys:['vehicle_id', 'spy', 'name'],
    desc: 'name', //根据desc来进行检索
    label: '车辆出/回车',
    placeholder: '请输入名称、车牌号'
  },
  his_patrol_data:{
    field:'patrol_path_id',
    sql:`select * from his_patrol_data where patrol_path_id`,
    sqlname:'his_patrol_data',
    name: 'his_patrol_data',
    countSql: `select count(1) as total from his_patrol_data where patrol_path_id`,
    searchName:'patrol_path',
    keys:['patrol_path_id', 'spy', 'name','patrol_state_id','patrol_task_id'],
    desc: 'name', //根据desc来进行检索
    label: '巡检记录',
    placeholder: '请输入名称、索引'
  },
  // rt_person_forbid_down_mine:{
  //   field:'staff_id',
  //   sql:`select rp.id, rp.staff_id,start_time, end_time , oper_time,status,oper_user from rt_person_forbid_down_mine rp, dat_staff ds where rp.staff_id = ds.staff_id and status = 1 and ds.staff_id`,
  //   sqlname:'rt_person_forbid_down_mine',
  //   name: 'rt_person_forbid_down_mine',
  //   countSql: `select count(1) as total from rt_person_forbid_down_mine where status = 1;`,
  //   searchName:'staff',
  //   keys:['staff_id', 'spy', 'name'],
  //   desc: 'name', //根据desc来进行检索
  //   label: '禁止人员下井',
  //   placeholder: '请输入名称、编号'
  // }
}
export default queryData