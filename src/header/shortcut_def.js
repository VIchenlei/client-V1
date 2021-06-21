// menuID与dat_menu表关联，顺序一一对应
let shortcutItems = [
  {
    name: 'alarm',
    iconName: 'icon-warning',
    label: '告警',
    onmobile: true,
    isShow: true,
    menuID: 'KJ-A00'
  },
  // {
  //   name: 'personCards',
  //   iconName: 'icon-cards',
  //   label: '一人带多卡',
  //   onmobile: false,
  //   isShow: false,
  //   menuID: 'KJ-B00'
  // },
  {
    name: 'location',
    iconName: 'icon-location-4',
    label: '取消定位',
    onmobile: true,
    isShow: true,
    menuID: 'KJ-C00'
  }, {
    name: 'sendcall',
    iconName: 'icon-megaphone-1',
    label: '发起呼叫',
    onmobile: true,
    isShow: false,
    menuID: 'KJ-D00'
  }, {
    name: 'callList',
    iconName: 'icon-stop-call',
    label: '停止呼叫',
    onmobile: true,
    isShow: false,
    menuID: 'KJ-E00'
  }, {
    name: 'handupMine',
    iconName: 'icon-street-view',
    label: '手动升井',
    onmobile: false,
    isShow: false,
    menuID: 'KJ-F00'
  }, {
    name: 'leave',
    iconName: 'icon-directions_run',
    label: '一键撤离',
    onmobile: true,
    isShow: false,
    menuID: 'KJ-G00'
  }, {
    name: 'staffcurve',
    iconName: 'icon-staff-curve',
    label: '人员数量历史曲线',
    onmobile: false,
    isShow: false,
    menuID: 'KJ-H00'
  },
  {
    name: 'geowarn',
    iconName: 'icon-geofault',
    label: '地质断层告警设置',
    onmobile: false,
    isShow: false,
    menuID: 'KJ-I00'
  },
  //  {
  //   name: 'spread',
  //   iconName: 'icon-person',
  //   label: '时点查询',
  //   onmobile: false
  // },
  {
    name: 'aboutus',
    iconName: 'icon-about',
    label: '关于',
    onmobile: true,
    isShow: true,
    menuID: 'KJ-J00'
  }
  // rule 在最后
  // {
  //   name: 'rule',
  //   iconName: 'icon-rule',
  //   label: '规则控制',
  //   onmobile: false,
  //   isShow: false,
  //   menuID: 'KJ-K00'
  // }
]

export default shortcutItems
