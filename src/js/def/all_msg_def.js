let allMsg = {
  'staff': {
    table: {
      names: ['staff_id', 'name', 'dept_id', 'dept_id_ck', 'worktype_id', 'occupation_id', 'lampNo', 'certification', 'blood', 'birthday', 'card_id', 'marry_id', 'education_id', 'telephone', 'address'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING'], // 字段类型
      labels: ['员工编号', '姓名', '部门', '虚拟部门', '工种', '职务', '灯架号', '身份证号', '血型', '出生日期', '卡号', '婚姻状况', '学历', '联系电话', '地址']
    }
  },
  'vehicle': {
    table: {
      names: ['vehicle_id', 'name', 'vehicle_type_id', 'card_id', 'dept_id', 'group_id', 'shift_type_id'],
      types: ['NUMBER', 'STRING', 'SELECT', 'NUMBER', 'SELECT' , 'SELECT', 'SELECT'],
      labels: ['车辆编号', '名称', '类型','卡号', '部门', '组号', '班次']
    }
  },
  'credentials_staff': {
    table: {
      names: ['numberstaff', 'staff_id', 'credentials_id', 'credentials_number', 'get_credentials_time', 'expire_time', 'warn_id'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'NUMBER', 'DATE', 'DATE','SELECT'],
      labels: ['员工编号', '员工姓名', '证件类型', '证件编号', '取证时间', '到期时间', '是否提醒'],
    }
  }
}

let anyMsg = {
  'staff': {
    table: {
      names: ['staff_id', 'name', 'dept_id_ck', 'worktype_id', 'occupation_id', 'lampNo', 'certification', 'blood', 'birthday', 'card_id', 'marry_id', 'education_id', 'telephone', 'address'], // 字段
      types: ['NUMBER', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING', 'STRING', 'STRING', 'SELECT', 'SELECT', 'SELECT', 'STRING', 'STRING'], // 字段类型
      labels: ['员工编号', '姓名', '部门', '工种', '职务', '灯架号', '身份证号', '血型', '出生日期', '卡号', '婚姻状况', '学历', '联系电话', '地址']
    }
  },
  'vehicle': {
    table: {
      names: ['vehicle_id', 'name', 'vehicle_type_id', 'card_id', 'dept_id', 'group_id', 'shift_type_id'],
      types: ['NUMBER', 'STRING', 'SELECT', 'NUMBER', 'SELECT' , 'SELECT', 'SELECT'],
      labels: ['车辆编号', '名称', '类型','卡号', '部门', '组号', '班次']
    }
  },
  'credentials_staff': {
    table: {
      names: ['numberstaff', 'staff_id', 'credentials_id', 'credentials_number', 'get_credentials_time', 'expire_time','warn_id'],
      types: ['NUMBER', 'SELECT', 'SELECT', 'NUMBER', 'DATE', 'DATE','SELECT'],
      labels: ['员工编号', '员工姓名', '证件类型', '证件编号', '取证时间', '到期时间','是否提醒'],
    }
  }
}

export {allMsg, anyMsg}
