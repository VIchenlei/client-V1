let config = {
  sensor: {
    def: {
      name: 'sensor',
      label: '传感器表',
      table: 'dat_sensor',
      keyIndex: 0,
      fields: {
        names: ['sensor_id', 'sensor_type_id', 'data_source', 'work_face_id', 'driver_alarm_threshold', 'alarm_threshold', 'readers', 'drivers', 'x', 'y', 'z', 'sensor_desc'],
        types: ['NUMBER', 'SELECT', 'NUMBER', 'SELECT', 'NUMBER', 'NUMBER', 'STRING', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING'],
        labels: ['编号', '传感器类型', '数据源', '绑定工作面', '通知司机告警阈值', '撤离告警阈值', '绑定分站', '绑定司机', '坐标x', '坐标y', '坐标z', '备注'],
        enableNull: [false, false, false, false, false, false, true, true, true, true, true, true]
      }
    }
  },
  font_size: {
    def: {
      name: 'font_size',
      label: '字体大小',
      table: 'font_size',
      keyIndex: 0,
      fields: {
        names: ['id', 'fontSize'],
        types: ['NUMBER', 'NUMBER'],
        labels: ['编号', '字体倍数'],
        enableNull: [false, false]
      }
    }
  },
  number_bars: {
    def: {
      name: 'number_bars',
      label: '数据条数',
      table: 'number_bars',
      keyIndex: 0,
      fields: {
        names: ['id', 'dataNumber'],
        types: ['NUMBER', 'NUMBER'],
        labels: ['编号', '数据条数'],
        enableNull: [false, false]
      }
    }
  }
}

export {config}