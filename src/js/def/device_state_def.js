const deviceStateDef = {
  'device': {
    name: 'device',
    label: '设备',
    table: '',
    keyIndex: 0,
    fields: {
      names: ['device_id', 'name', 'device_type_id', 'state', 'event_type_id', 'alarm_time', 'time'],
      types: ['NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'DATETIME', 'DATE'],
      labels: ['设备编号', '名称', '设备类型', '设备状态', '告警状态', '告警时间', '状态更新时间']
    }
  }
}

export default deviceStateDef
