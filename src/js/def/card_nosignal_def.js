const cardnosignal = {
  staff: {
    name: 'staff',
    label: '人员',
    table: 'dat_staff_dync', // 动态 push 数据
    keyIndex: 0, // table中key值在 field 中的位置
    iconName: 'icon-bizman-group',
    fields: {
      names: ['obj_id', 'card_id', 'map_id', 'object_id', 'dept_id', 'occupation_id', 'map_pos', 'state_biz', 'state_card', 'down_time', 'work_time'], // 字段
      types: ['NUMBER', 'NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'DATETIME', 'DATETIME'], // 字段类型
      labels: ['员工编号', '卡号', '地图名称', '姓名', '部门', '职务', '位置', '状态', '电量状态', '入井时间', '工作时长']
    }
  }
}

export default cardnosignal
