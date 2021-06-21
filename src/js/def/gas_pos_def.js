const gasDef = [// 气体数据配置
  {
    id: 16001,
    name: 'W3305辅运顺槽工作面瓦斯',
    unit: '', // 单位
    x: 2952,
    y: 387,
    type: 'T'
  },
  {
    id: 16002,
    name: 'W3305辅运顺槽回风流瓦斯',
    unit: '',
    x: 2952,
    y: 138,
    type: 'T'
  },
  {
    id: 16003,
    name: 'W3305辅运顺槽工作面机载瓦斯',
    unit: '',
    x: 2952,
    y: 255,
    type: 'T'
  },
  {
    id: 1103,
    name: '东翼辅运大巷CO',
    unit: '',
    x: 4727,
    y: -506,
    type: 'CO'
  },
  {
    id: 16004,
    name: 'W3305辅运顺槽回风流CO',
    unit: '',
    x: 2954,
    y: 140,
    type: 'CO'
  },
  {
    id: 1104,
    name: '电车充电硐室氢气',
    unit: '',
    x: 4715,
    y: -368,
    type: 'H2'
  }
]

const windDef = [// 通风
  {
    id: 2308,
    name: '北辅运大巷风速',
    unit: '',
    x: 4586,
    y: 75,
    type: 'F'
  },
  {
    id: 2307,
    name: '北翼进风大巷风速',
    unit: '',
    x: 4563,
    y: 100,
    type: 'F'
  },
  {
    id: 802,
    name: '西翼辅运大巷风速',
    unit: '',
    x: 4726.6,
    y: -29.8,
    type: 'F'
  },
  {
    id: 819,
    name: '副井底行人道（东）风速',
    unit: '',
    x: 4712,
    y: -209,
    type: 'F'
  },
  {
    id: 2301,
    name: '南翼辅运大巷口风速',
    unit: '',
    x: 4822,
    y: 67,
    type: 'F'
  },
  {
    id: 16005,
    name: 'W3305辅运顺槽主风筒',
    unit: '',
    x: 2950,
    y: 250,
    type: 'FT'
  },
  {
    id: 16006,
    name: 'W3305辅运顺槽副风筒',
    unit: '',
    x: 2954,
    y: 250,
    type: 'FT'
  }
  // {
  //   id: 16012,
  //   name: 'W3305辅运顺槽主风机1',
  //   unit: '',
  //   x: '',
  //   y: '',
  //   type: 'FJ'
  // },
  // {
  //   id: 16013,
  //   name: 'W3305辅运顺槽主风机2',
  //   unit: '',
  //   x: '',
  //   y: '',
  //   type: 'FJ'
  // },
  // {
  //   id: 16014,
  //   name: 'W3305辅运顺槽副风机1',
  //   unit: '',
  //   x: '',
  //   y: '',
  //   type: 'FJ'
  // },
  // {
  //   id: 16016,
  //   name: 'W3305辅运顺槽副风机2',
  //   unit: '',
  //   x: '',
  //   y: '',
  //   type: 'FJ'
  // }
]

const temperatureDef = [// 温度
  {
    id: 206,
    name: '副井底温度',
    unit: '',
    x: 4711,
    y: -196,
    type: 'WD'
  },
  {
    id: 4205,
    name: '主井底温度',
    unit: '',
    x: 4739,
    y: -241,
    type: 'WD'
  },
  {
    id: 818,
    name: '胶轮车加油硐室温度',
    unit: '',
    x: 4703,
    y: -0.5,
    type: 'WD'
  },
  {
    id: 804,
    name: '西翼辅运大巷温度',
    unit: '',
    x: 4726.8,
    y: -83,
    type: 'WD'
  },
  {
    id: 4505,
    name: '西翼胶带大巷温度',
    unit: '',
    x: 4758,
    y: -83,
    type: 'WD'
  },
  {
    id: 2303,
    name: '南翼辅运大巷口温度',
    unit: '',
    x: 4940,
    y: 155,
    type: 'WD'
  },
  {
    id: 2305,
    name: '北翼辅运大巷口温度',
    unit: '',
    x: 4709,
    y: -75,
    type: 'WD'
  },
  {
    id: 16007,
    name: 'W3305辅运顺槽回风流温度',
    unit: '',
    x: 2952,
    y: 191,
    type: 'WD'
  }
]

// 工作面二维
const workfaceGas = {
  '16001': {
    id: 16001,
    name: 'W3305辅运顺槽工作面瓦斯',
    unit: '%', // 单位
    type: 'T',
    datatype: 'NUMBER',
    spyname: 'gas',
    img: '/img/methane.png'
  },
  '16002': {
    id: 16002,
    name: 'W3305辅运顺槽回风流瓦斯',
    unit: '%',
    type: 'T',
    datatype: 'NUMBER',
    spyname: 'mashgas',
    img: '/img/mashgas.png'
  },
  '16003': {
    id: 16003,
    name: 'W3305辅运顺槽工作面机载瓦斯',
    unit: '%',
    type: 'T',
    datatype: 'NUMBER',
    spyname: 'jizaigas',
    img: '/img/ch4.png'
  },
  '16004': {
    id: 16004,
    name: 'W3305辅运顺槽回风流CO',
    unit: '%',
    type: 'CO',
    datatype: 'NUMBER',
    spyname: 'co',
    img: '/img/co.png'
  },
  '16005': {
    id: 16005,
    name: 'W3305辅运顺槽主风筒',
    unit: '',
    type: 'FT',
    datatype: 'TURNOFF',
    spyname: 'hostair',
    img: ''
  },
  '16006': {
    id: 16006,
    name: 'W3305辅运顺槽副风筒',
    unit: '',
    type: 'FT',
    datatype: 'TURNOFF',
    spyname: 'viceair',
    img: ''
  },
  '16007': {
    id: 16007,
    name: 'W3305辅运顺槽回风流温度',
    unit: '℃',
    type: 'WD',
    datatype: 'NUMBER',
    spyname: 'temp',
    img: '/img/temperature.png'
  },
  '16012': {
    id: 16012,
    name: 'W3305辅运顺槽主风机1',
    unit: '',
    type: 'FJ',
    datatype: 'TURNOFF'
  },
  '16013': {
    id: 16013,
    name: 'W3305辅运顺槽主风机2',
    unit: '',
    type: 'FJ',
    datatype: 'TURNOFF'
  },
  '16014': {
    id: 16014,
    name: 'W3305辅运顺槽副风机1',
    unit: '',
    type: 'FJ',
    datatype: 'TURNOFF'
  },
  '16016': {
    id: 16016,
    name: 'W3305辅运顺槽副风机2',
    unit: '',
    type: 'FJ',
    datatype: 'TURNOFF'
  },
  '14911': {
    id: 14911,
    name: 'W3305胶带顺槽掘进机开停',
    unit: '',
    type: 'FJ',
    datatype: 'TURNOFF',
    spyname: 'drivevehicle'
  },
  '14912': {
    id: 14912,
    name: 'W3305胶带顺槽皮带开停',
    unit: '',
    type: 'FJ',
    datatype: 'TURNOFF',
    spyname: 'belt'
  }
}
export { gasDef, windDef, temperatureDef, workfaceGas }
