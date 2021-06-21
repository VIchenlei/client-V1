const personForbid = {
  'rt_person_forbid_down_mine': {
    label: '禁止下井人员表',
    name: 'rt_person_forbid_down_mine',
    keyIndex: 0,
    table: 'rt_person_forbid_down_mine',
    fields: {
      labels: ['员工编号', '姓名', '部门'],
      names: ['staff_id', 'name', 'dept_id'],
      types: ['NUMBER', 'STRING', 'SELECT'],
      enableNull: [false, false, false]
    }
  }
}

export default personForbid