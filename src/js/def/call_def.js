let callDef = {
  name: 'call',
  label: '呼叫',
  fields: {
    names: ['call_id', 'call_type_id', 'user_id', 'targets', 'executors', 'detail', 'start_time', 'stop_time', 'stopped_by', 'state'],
    types: ['NUMBER', 'NUMBER', 'STRING', 'STRING', 'STRING', 'STRING', 'DATETIME', 'DATETIME', 'STRING', 'STRING'],
    labels: ['呼叫编号', '呼叫类型', '发起者', '呼叫对象', '执行分站', '详情', '开始时间', '终止时间', '终止者', '状态']
  }
}

export default callDef
