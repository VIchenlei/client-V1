let childTag = {
  credentials: {
    name: 'credentials_staff',
    label: '资格证信息管理',
    table: 'dat_credentials_staff',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['staff_id', 'name', 'dept_id'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT'], // 字段类型
      labels: ['员工编号', '姓名', '部门']
    }
  },
  dat_credentials_staff: {
    name: 'credentials_staff',
    label: '资格证信息管理',
    table: 'dat_credentials_staff',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['staff_id', 'credentials_id', 'credentials_number', 'get_credentials_time', 'expire_time','warn_id'], // 字段
      types: ['NUMBER', 'SELECT', 'NUMBER', 'DATE', 'DATE','SELECT'], // 字段类型
      labels: ['员工编号', '证件类型', '证件编号', '取证时间', '到期时间','是否提醒'],
      enableNull: [false, false, false, true, true, true, true]
    }
  }
}

export {childTag}
