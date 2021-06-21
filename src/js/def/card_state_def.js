const cardStateDef = {
  vehicle: {
    name: 'vehicle',
    label: '车辆',
    table: 'dat_vehicle_dync', // 动态 push 数据
    keyIndex: 0, // table中key值在 field 中的位置
    iconName: 'icon-truck',
    fields: {
      names: ['card_id', 'card_type_id', 'number', 'obj_id', 'x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'dept_id', 'state_card_id', 'state_object_id', 'state_biz_id', 'speed', 'map_pos'], // 字段
      types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'], // 字段类型
      labels: ['卡号', '卡类型', '车辆名称', '车辆编号', 'X坐标', 'Y坐标', '最后出车时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '部门', '电量', '运动状态', '状态', '速度', '位置']
    }
  },
  vehicle1: {
    name: 'vehicle',
    label: '车辆',
    table: 'dat_vehicle_dync', // 动态 push 数据
    keyIndex: 0, // table中key值在 field 中的位置
    iconName: 'icon-truck',
    fields: {
      names: ['card_type_id', 'dept_id', 'number', 'x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'state_card_id', 'state_object_id', 'state_biz_id','card_id', 'speed', 'map_pos'], // 字段
      types: ['NUMBER','NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER','NUMBER', 'NUMBER', 'STRING'], // 字段类型
      labels: ['卡类型', '部门', '车辆名称', 'X坐标', 'Y坐标', '最后出车时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域','电量', '运动状态', '状态','卡号', '速度', '位置']
    }
  },

  staff: {
    name: 'staff',
    label: '人员',
    table: 'dat_staff_dync', // 动态 push 数据
    keyIndex: 0, // table中key值在 field 中的位置
    iconName: 'icon-bizman-group',
    fields: {
      names: ['card_id', 'card_type_id', 'number', 'obj_id','x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'dept_id', 'state_card_id', 'state_object_id', 'state_biz_id', 'speed', 'map_pos'], // 字段
      types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'], // 字段类型
      labels: ['卡号', '卡类型', '姓名', '员工编号', 'X坐标', 'Y坐标', '入井时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '部门', '电量', '运动状态', '状态', '速度', '位置']
    }
  },

  staff1: {
    name: 'staff',
    label: '人员',
    table: 'dat_staff_dync', // 动态 push 数据
    keyIndex: 0, // table中key值在 field 中的位置
    iconName: 'icon-bizman-group',
    fields: {
      names: [ 'card_type_id', 'number', 'dept_id', 'x', 'y', 'occupation_id', 'worktype_id', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'state_card_id', 'state_object_id', 'state_biz_id','card_id', 'speed', 'map_pos'], // 字段
      types: [ 'NUMBER', 'STRING','NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER','NUMBER', 'STRING'], // 字段类型
      labels: [ '卡类型', '姓名','部门', 'X坐标', 'Y坐标', '职务', '工种', '入井时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '电量', '运动状态', '状态','卡号', '速度', '位置']
    }
  },

  adhoc: {
    name: 'adhoc',
    label: '自组网设备',
    table: 'dat_adhoc_dync', // 动态 push 数据
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['card_id', 'card_type_id', 'number', 'x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'dept_id', 'state_card_id', 'state_object_id', 'state_biz_id', 'speed'], // 字段
      types: ['NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER'], // 字段类型
      labels: ['卡号', '卡类型', '名称', 'X坐标', 'Y坐标', '下井时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '部门', '设备状态', '运动状态', '状态', '速度']
    }
  },

  tdvehicle: {
    name: 'tdvehicle',
    label: '当天出车车辆',
    table: 'dat_td_vehicle',
    keyIndex: 1,
    fields: {
      names: ['number', 'card_type_id', 'card_id', 'obj_id', 'x', 'y', 'down_time', 'enter_area_time', 'rec_time', 'work_time', 'map_id', 'area_id', 'dept_id', 'state_card_id', 'state_object_id', 'state_biz_id', 'speed', 'map_pos'], // 字段
      types: ['STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME', 'DATETIME', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'], // 字段类型
      labels: ['车辆名称', '卡类型', '卡号', '车辆编号', 'X坐标', 'Y坐标', '最后出车时间', '进入区域时间', '接收时间', '工作时长', '地图', '区域', '部门', '电量', '运动状态', '状态', '速度', '位置']
    }
  }
}

module.exports = cardStateDef
