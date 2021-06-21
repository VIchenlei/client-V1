let basicMsg = {
  'staff': {
    table: {
      names: ['staff_id', 'name', 'ident', 'dept_id', 'dept_id_ck'],
      types: ['NUMBER', 'STRING', 'NUMBER', 'SELECT', 'SELECT'],
      labels: ['员工编号', '姓名', '卡号', '部门', '虚拟部门']
    }
  },
  'vehicle': {
    table: {
      names: ['vehicle_id', 'name', 'ident', 'dept_id'],
      types: ['NUMBER', 'STRING', 'NUMBER', 'SELECT'],
      labels: ['车辆编号', '车辆名称', '卡号', '部门']
    }
  }
}

export {basicMsg}
