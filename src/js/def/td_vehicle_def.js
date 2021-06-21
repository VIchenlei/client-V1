const tdvehicle = {
  name: 'tdvehicle',
  label: '当天出车情况',
  fields: {
    names: ['vehicle_id', 'name', 'start_time', 'end_time', 'work_time'],
    types: ['NUMBER', 'STRING', 'STRING', 'STRING', 'STRING'],
    labels: ['车牌名称', '司机', '出车时间', '回车时间', '工作时长（小时）']
  }
}

export default tdvehicle