let toolbarItems = [ {
  name: 'vehicle',
  iconName: 'icon-vehicle-big',
  label: '显示/隐藏车辆',
  cont: '车辆',
  class: 'active'
}, {
  name: 'staff',
  iconName: 'icon-staff-big',
  label: '显示/隐藏人员',
  cont: '人员',
  class: 'active'
}, {
  name: 'visual',
  iconName: 'icon-visual',
  label: '图层显隐',
  cont: '图层显隐',
  class: ''
}, {
  name: 'magnifier',
  iconName: 'icon-search-bar',
  label: '自定义区域搜索人或车',
  cont: '自定义区域搜索人或车',
  class: ''
}, {
  name: 'measure',
  class: 'measure',
  iconName: 'icon-measure',
  label: '测量',
  cont: '测量'
}, {
  name: 'edit_map',
  iconName: 'icon-coordinate',
  label: '坐标',
  cont: '坐标'
}, 
{
  name: 'visualarea',
  iconName: 'icon-area',
  label: '显示区域',
  cont: '显示区域'
}, 
{
  name: 'switch_map',
  iconName: 'icon-switch-map',
  label: '切换地图',
  cont: '切换地图'
}
]

let visual = [{
  name: 'reader',
  iconName: 'icon-bstation',
  label: '显示/隐藏分站',
  cont: '分站',
  class: ''
}, 
{
  name: 'power',
  iconName: 'icon-bstation-2',
  label: '显示/隐藏电源',
  cont: '电源',
  class: ''
}, 
{
  name: 'fade_area',
  iconName: 'icon-area-2',
  label: '显示/隐藏盲区',
  cont: '盲区显示',
  class: ''
},
// {
//   name: 'traffic_lights',
//   iconName: 'icon-traffic-light',
//   label: '显示/隐藏红绿灯',
//   cont: '红绿灯',
//   class: ''
// },
{
  name: 'camera',
  iconName: 'icon-camera',
  label: '显示/隐藏摄像头',
  cont: '摄像头',
  class: ''
}, 
// {
//   name: 'area',
//   iconName: 'icon-area',
//   label: '显示/隐藏区域',
//   cont: '区域',
//   class: ''
// }, 
{
  name: 'landmark',
  iconName: 'icon-landmarker',
  label: '显示/隐藏地标',
  cont: '地标',
  class: ''
}, 
// {
//   name: 'gas',
//   iconName: 'icon-gas',
//   label: '显示/隐藏瓦斯',
//   cont: '气体数据',
//   class: ''
// }, 
// {
//   name: 'wind',
//   iconName: 'icon-wind',
//   label: '显示/隐藏通风数据',
//   cont: '通风数据',
//   class: ''
// }, {
//   name: 'temperature',
//   iconName: 'icon-temperature',
//   label: '显示/隐藏温度数据',
//   cont: '温度数据',
//   class: ''
// }, {
//   name: 'bzlx_hz',
//   class: 'bzlx_hz',
//   iconName: 'icon-fire-hedging',
//   label: '火灾避灾路线',
//   cont: '火灾避灾路线'
// }, {
//   name: 'bzlx_sz',
//   class: 'bzlx_sz',
//   iconName: 'icon-water-hedging',
//   label: '水灾避灾路线',
//   cont: '水灾避灾路线'
// }, 
{
  name: 'reset',
  iconName: 'icon-self-adaption',
  label: '实际大小',
  cont: '全图',
  class: ''
}, {
  name: 'fault',
  iconName: 'icon-line',
  label: '显示/隐藏断层',
  cont: '断层',
  class: ''
}, {
  name: 'underground',
  iconName: 'icon-line',
  label: '显示/隐藏三线',
  cont: '三线',
  class: ''
}, {
  name: 'area_person',
  iconName: 'icon-area-person',
  label: '显示/隐藏区域人员',
  cont: '区域人员',
  class: 'active'
}
]

let visualarea = [{
  name: 'area_1',
  iconName: 'icon-area',
  label: '显示/隐藏普通区域',
  cont: '普通区域',
  class: ''
}, {
  name: 'area_3',
  iconName: 'icon-area',
  label: '显示/隐藏禁入区域',
  cont: '禁入区域',
  class: ''
}, {
  name: 'area_5',
  iconName: 'icon-area',
  label: '显示/隐藏猴车区域',
  cont: '猴车区域',
  class: ''
}, {
  name: 'area_6',
  iconName: 'icon-area',
  label: '显示/隐藏考勤区域',
  cont: '考勤区域',
  class: ''
}, {
  name: 'area_1001',
  iconName: 'icon-area',
  label: '显示/隐藏特殊区域',
  cont: '特殊区域',
  class: ''
}, {
  name: 'area_2000',
  iconName: 'icon-area',
  label: '显示/隐藏工作面区域',
  cont: '工作面区域',
  class: ''
}]

let magnifier = [{
  name: 'rect_query_vehicle',
  class: 'rect_query_vehicle',
  iconName: 'icon-geometry-vehicle',
  label: '矩形查车',
  cont: '矩形查车'
}, {
  name: 'circle_query_vehicle',
  class: 'circle_query_vehicle',
  iconName: 'icon-circle-vehicle',
  label: '圆形查车',
  cont: '圆形查车'
}, {
  name: 'poly_query_vehicle',
  class: 'poly_query_vehicle',
  iconName: 'icon-draw-polygon-vehicle',
  label: '多边形查车',
  cont: '多边形查车'
}, {
  name: 'rect_query_staff',
  class: 'rect_query_staff',
  iconName: 'icon-geometry-staff',
  label: '矩形查人',
  cont: '矩形查人'
}, {
  name: 'circle_query_staff',
  class: 'circle_query_staff',
  iconName: 'icon-circle-staff',
  label: '圆形查人',
  cont: '圆形查人'
}, {
  name: 'poly_query_staff',
  class: 'poly_query_staff',
  iconName: 'icon-draw-polygon-staff',
  label: '多边形查人',
  cont: '多边形查人'
}]

let measure = [{
  name: 'measure_length',
  class: 'measure-length',
  iconName: 'icon-measure',
  label: '长度',
  cont: '长度'
}, {
  name: 'measure_area',
  class: 'measure-area',
  iconName: 'icon-acreage',
  label: '面积',
  cont: '面积'
}, {
  name: 'edit_area',
  class: 'measure-area',
  iconName: 'icon-edit-area',
  label: '新增区域',
  cont: '新增区域'
}, {
  name: 'edit_landmark',
  class: 'measure-area',
  iconName: 'icon-edit-land',
  label: '新增地标',
  cont: '新增地标'
}, {
  name: 'edit_forbid_area',
  class: 'measure-area',
  iconName: 'icon-edit-area',
  label: '新增禁区',
  cont: '新增禁区'
}, {
  name: 'edit_forbid_bstation',
  class: 'measure-bstation',
  iconName: 'icon-bstation',
  label: '新增分站',
  cont: '新增分站'
}, {
  name: 'edit_goaf',
  class: 'measure-bstation',
  iconName: 'icon-bstation',
  label: '新增采空区',
  cont: '新增采空区'
}, {
  name: 'edit_route_plan',
  class: 'measure-bstation',
  iconName: 'icon-bstation',
  label: '设定路线',
  cont: '设定路线'
}
// {
//     name: 'edit_lights',
//     class: 'measure-lights',
//     iconName: 'icon-bstation',
//     label: '新增红绿灯',
//     cont: '新增红绿灯'
// }
]

let ThreedbarItems = [{
  name: 'gaohe_pos',
  iconName: 'icon-coordinate',
  label: '高河',
  cont: '高河'
}, {
  name: 'gucheng_pos',
  iconName: 'icon-coordinate',
  label: '古城',
  cont: '古城'
}, {
  name: 'wangzhuang_pos',
  iconName: 'icon-coordinate',
  label: '王庄',
  cont: '王庄'
}, {
  name: 'gaohe_dem',
  iconName: 'icon-visual',
  label: '地形显隐',
  cont: '地形显隐'
}
]
export { toolbarItems, visual, magnifier, measure, ThreedbarItems, visualarea}
