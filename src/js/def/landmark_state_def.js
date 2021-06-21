const landmarkStateDef = {
  'landmark': {
    name: 'landmarker',
    label: '地标信息',
    table: '',
    keyIndex: 0,
    fields: {
      names: ['landmark_id', 'name', 'x', 'y', 'z'],
      types: ['NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'NUMBER'],
      labels: ['地标编号', '地标名称', '坐标x', '坐标y', '坐标z']
    }
  }
}

export default landmarkStateDef
