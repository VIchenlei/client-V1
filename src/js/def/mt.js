let allMt = {
  staff_staff_extend: {
    name: 'staff/staff_extend',
    label: '员工信息管理',
    table: 'dat_staff/dat_staff_extend',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['staff_id', 'name', 'dept_id', 'dept_id_ck', 'worktype_id', 'occupation_id', 'lampNo', 'certification', 'blood', 'birthday', 'card_id', 'marry_id', 'education_id', 'telephone', 'address'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING'], // 字段类型
      labels: ['员工编号', '姓名', '部门', '虚拟部门', '工种', '职务', '灯架号', '身份证号', '血型', '出生日期', '卡号', '婚姻状况', '学历', '联系电话', '地址'],
      enableNull: [false, false, true, true, true, true, true, false, true, true, false, true, true, true, true]
    }
  },
  vehicle_vehicle_extend: {
    name: 'vehicle/vehicle_extend',
    label: '车辆信息管理',
    table: 'dat_vehicle/dat_vehicle_extend',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['vehicle_id', 'name', 'vehicle_type_id', 'card_id', 'dept_id', 'group_id', 'shift_type_id'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT'], // 字段类型
      labels: ['车辆编号', '名称', '类型', '卡号', '部门', '组号', '班次'],
      enableNull: [false, false, false, false, true, true, true]
    }
  }
}

let anyMt = {
  staff_staff_extend: {
    name: 'staff/staff_extend',
    label: '员工信息管理',
    table: 'dat_staff/dat_staff_extend',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['staff_id', 'name', 'dept_id_ck', 'worktype_id', 'occupation_id', 'lampNo', 'certification', 'blood', 'birthday', 'card_id', 'marry_id', 'education_id', 'telephone', 'address'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING'], // 字段类型
      labels: ['员工编号', '姓名', '部门', '工种', '职务', '灯架号', '身份证号', '血型', '出生日期', '卡号', '婚姻状况', '学历', '联系电话', '地址'],
      enableNull: [false, false, true, true, true, true, false, true, true, false, true, true, true, true]
    }
  },
  vehicle_vehicle_extend: {
    name: 'vehicle/vehicle_extend',
    label: '车辆信息管理',
    table: 'dat_vehicle/dat_vehicle_extend',
    keyIndex: 0, // table中key值在 field 中的位置
    fields: {
      names: ['vehicle_id', 'name', 'vehicle_type_id', 'card_id', 'dept_id', 'group_id', 'shift_type_id'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'SELECT'], // 字段类型
      labels: ['车辆编号', '名称', '类型', '卡号', '部门', '组号', '班次'],
      enableNull: [false, false, false, false, true, true, true]
    }
  }
}
export {allMt,anyMt}
