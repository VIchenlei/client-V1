// 定义 PUSH 消息的数据结构
// PUSH 过来的消息，数据统一采用数组的形式。所以在读取的时候，需要严格的字段顺序

// 卡状态数组的数据结构
const CARD = {
  card_id: 0,
  card_type_id: 1,  // 卡类型：staff, 人卡； vehicle, 车卡
  object_id: 2,   // 卡绑定对象的编号，比如：车是 车牌号；人是 身份证。
  obj_id: 3, // 人员、车辆编号 人：staff_id 车：vehicle_id
  x: 4,
  y: 5,
  down_time: 6,
  enter_area_time: 7,
  rec_time: 8,
  work_time: 9,
  map_id: 10,
  area_id: 11,
  dept_id: 12,
  state_card: 13,
  state_object: 14,
  state_biz: 15,
  speed: 16,
  mark_id: 17,
  mark_direction: 18,
  mark_distance: 19,
  occupation_level_id: 20,
  td_vehicle: 21,
  set_move: 22, // 最后一位，server端添加，是否做动画
  end_time: 23 // 卡当前点的结束时间，用来计算动画时间
}
export { CARD }
