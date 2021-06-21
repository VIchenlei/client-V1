let metaMenu = [{
    title: '组织管理',
    icon: 'icon-menu2',
    expand: false,
    isShow: true,
    items: [{
        name: 'dept_ck',
        label: '虚拟部门管理'
      },{
        name: 'dept',
        label: '部门管理'
      },
      {
        name: 'group',
        label: '班组管理'
      },
      {
        name: 'worktype',
        label: '工种管理'
      },
      {
        name: 'occupation',
        label: '职务管理'
      },
      {
        name: 'shift_type',
        label: '班制管理'
      },
      {
        name: 'shift',
        label: '班次管理'
      },
      {
        name: 'shift_setting',
        label: '考勤管理'
      },
      {
        name: 'occupation_level',
        label: '级别管理'
      },
      {
        name: 'education',
        label: '学历管理'
      }
    ]
  }, {
    title: '地图管理',
    icon: 'icon-map',
    isShow: true,
    items: [
      // { name: 'map', label: '地图管理' },
      {
        name: 'map_gis',
        label: '地图'
      },
      {
        name: 'gis_layer',
        label: '地图图层管理'
      },
      {
        name: 'area',
        label: '分区管理'
      },
      {
        name: 'area_persons_dynamic_thre',
        label: '区域人员停留上限管理'
      },
      {
        name: 'landmark',
        label: '地标管理'
      },
      {
        name: 'geofault',
        label: '地质断层管理'
      },
      {
        name: 'goaf',
        label: '采空区管理'
      }
      // { name: 'workface_sensor', label: '工作面传感器管理' }
    ]
  },
  {
    title: '设备管理',
    icon: 'icon-mange',
    isShow: true,
    items: [{
        name: 'device_type',
        label: '设备类型管理'
      },
      {
        name: 'device_state',
        label: '设备状态管理'
      },
      {
        name: 'reader',
        label: '分站管理'
      },
      {
        name: 'area_reader',
        label: '分站所属区域管理'
      },
      {
        name: 'reader_rssi',
        label: '分站盲区间距管理'
      },
      // {
      //   name: 'antenna',
      //   label: '天线管理'
      // },
      // {
      //   name: 'reader_path_tof_n',
      //   label: '分站覆盖范围'
      // },
      {
        name: 'sensor_type',
        label: '传感器类型管理'
      },
      // { name: 'light', label: '红绿灯管理' },
      // { name: 'lights_group', label: '红绿灯组管理' },
      // { name: 'lights_binding', label: '红绿灯组绑定' },
      {
        name: 'sensor',
        label: '传感器管理'
      },
      {
        name: 'reader_manager',
        label: '分站升级'
      }

    ]
  }, {
    title: '系统管理',
    icon: 'icon-setting-1',
    isShow: true,
    items: [{
        name: 'user',
        label: '用户管理'
      },
      {
        name: 'role',
        label: '角色管理'
      },
      {
        name: 'role_rank',
        label: '角色等级管理'
      },
      // { name: 'access', label: '权限管理' },
      {
        name: 'op_type',
        label: '操作类型管理'
      },
      {
        name: 'event_level',
        label: '告警级别'
      },
      {
        name: 'event_type',
        label: '告警类型'
      },
      {
        name: 'sosalarm',
        label: '声光告警'
      },
      {
        name: 'setting',
        label: '系统设置'
      },
      // { name: 'rules', label: '规则管理' },
      {
        name: 'camera',
        label: '视频管理'
      },
      {
        name: 'ip_address',
        label: 'IP地址管理'
      },
      {
        name: 'sanlv_standart',
        label: '三率标准表'
      },
      {
        name: 'month',
        label: '月考勤日期管理'
      }
    ]
  }, {
    title: '系统报表',
    icon: 'icon-stats',
    isShow: true,
    items: [{
        name: 'operate_log',
        label: '操作日志'
      },
      {
        name: 'his_staff_change',
        label: '历史人员变更'
      }
    ]
  }, {
    title: '信息管理',
    icon: 'icon-efficiency',
    isShow: true,
    items: [{
        name: 'dept_info',
        label: '部门信息管理'
      },
      {
        name: 'occupation_info',
        label: '职务信息管理'
      }
    ]
  }, {
    title: '配置项',
    icon: 'icon-poll',
    isShow: true,
    items: [{
        name: 'font_size',
        label: '字体大小管理'
      },
      {
        name: 'number_bars',
        label: '数据条数管理'
      }
    ]
  }
]

export default metaMenu
