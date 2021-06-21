import echarts from 'echarts'
/**
 * 获取饼状图的配置项
 * @param {[type]} option 传入的配置项
 */
function pieOption (option) {
  let config = {
    title: {
      text: option.text,
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    color: ['#9999ff', '#99ffff', '#ff99cc'],
    series: [
      {
        name: option.name,
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: option.data,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  return config
}

/**
 * 获取柱状图的配置项
 * @param {[type]} option 传入的配置项
 */
function barOption (option) {
  let config = {
    title: {
      text: option.title
    },
    tooltip: {
      trigger: 'axis'
    },
    color: ['#9999ff', '#99ffff', '#ff99cc'],
    legend: {
      data: option.legend
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true
        }
      }
    },
    calculable: true,
    xAxis: [
      {
        type: 'category',
        data: option.data,
        boundaryGap: ['0%', '100%']
        // min: option.data[0],
        // max: option.data[option.data.length-1]
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }, {
        start: 0,
        end: 100,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      }
    ],
    series: option.series
  }
  return config
}

/**
 * 获取折线图的配置项
 * @param {[type]} option 传入的配置项
 */

function lineOption (option) {
  let config = {
    title: {
      text: option.text
    },
    tooltip: {
      trigger: 'axis'
    },
    color: ['#9999ff', '#99ffff', '#ff99cc'],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {
          show: true
        }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: option.data
    },
    yAxis: {
      name: option.unit,
      type: 'value'
    },
    series: option.series
  }
  return config
}

/**
 * 获取堆叠柱状图的配置项
 */
function stackBarOption (option) {
  let config = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    legend: {
      data: option.legend
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      containLabel: true
    },
    color: ['#89aef8', '#83e6ff', '#fa8fc2'],
    xAxis: [{
      name: '日期',
      type: 'category',
      data: option.data
    }],
    yAxis: [{
      name: option.unit,
      type: 'value'
    }],
    series: option.series
  }
  return config
}

// 获取光滑折线图配置项
function smoothLineOption (option) {
  let config = {
    title: {
      text: `${option.title}距离折线图`,
      textStyle: {
        fontSize: 14,
        fontWeight: 400
      }
    },
    tooltip: {
      axisPointer: {
        type: 'cross'
      },
      formatter: function (params) {
        let key = params.seriesName.split('@')
        let row = option.row.get(key[1])
        let time = params.data[0]
        let curData = row.get(time)
        let curTime = curData.uwb_timestamp
        let startTime = new Date(curTime).getTime() - 15 * 60 * 1000
        startTime = new Date(startTime).format('hh:mm')
        return `${key[0]}:<br/>在${startTime}到${time}时间段内，<br/>共监测到距离较近的次数：${curData.uwb_ctindex}次，<br/>平均距离：${params.data[1]}米`
      }
    },
    xAxis: {
      name: 't',
      type: 'category',
      data: option.time
    },
    yAxis: {
      name: 'm',
      type: 'value'
    },
    series: option.series
  }
  return config
}

/**
 * 获取人员历史数据折线图
 */
function staffcharts(options) {
  let config = {
    grid: {
      bottom: 80
    },
    dataZoom: [
      {
          show: true,
          realtime: true,
          start: 80,
          end: 100
      },
      {
          type: 'inside',
          realtime: true,
          start: 65,
          end: 85
      }
    ],
    xAxis: {
        type: 'category',
        data: options.record.map(function (str) {
          return str.replace(' ', '\n')
        })
    },
    yAxis: {
        type: 'value'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        return `${params[0].axisValue}：${params[0].data}人`
      }
    },
    series: [{
        data: options.data,
        type: 'line'
    }]
  }
  return config
}

function efficiencyDept (option) {
  let time = option.time
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  let xmax = new Date(year, month, 0).getDate()
  let max = option.max ? option.max : 100
  let config = {
    color: ['#26cc41', '#ff8d48', '#0167ff'],
    title: {
      text: option.title,
      textStyle: {
        // fontSize: 14,
        fontWeight: 400
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        return `${data[0]}日：${data[1]}%`
      }
    },
    legend: {
      data: option.legend,
      right: '5%',
      textStyle: option.textStyle
    },
    xAxis: {
        min: 1,
        max: xmax,
        type: 'value',
        axisLine: option.axisLine,
        splitLine: {
          show: false
        },
        axisLabel: {
          fontSize: 12
        }
    },
    yAxis: {
        min: 0,
        max: max,
        type: 'value',
        axisLine: option.axisLine,
        splitLine: {
          lineStyle: {
            color: '#999',
            opacity: 0.6
          }
        },
        axisLabel: {
          fontSize: 12,
          rotate: -45
        }
    },
    series: option.series
  }
  return config
}

// 柱状图
function efficiencyDeptBar(option) {
  let year = new Date().getFullYear()
  let month = new Date().getMonth() - 1
  let xmax = new Date(year, month, 0).getDate()
  let max = option.max ? option.max : 100
  let config = {
    color: ['#26cc41', '#ff8d48', '#0167ff'],
    title: {
      text: option.title,
      textStyle: {
        // fontSize: 14,
        fontWeight: 400
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        return `${data[0]}日：${data[1]}%`
      }
    },
    legend: {
      data: option.legend,
      right: '5%',
      textStyle: {
        color: '#fff',
        fontSize: 12
      }
    },
    xAxis: {
      min: 1,
      max: xmax,
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      min: 0,
      max: max,
      type: 'value',
      axisLine: {
        lineStyle: {
            color: '#fff'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#999',
          opacity: 0.6
        }
      },
      axisLabel: {
        fontSize: 12,
        rotate: -45
      }
    },
    series: option.series
  }
  return config
}

// 仪表盘
function gauge(option) {
  let config = {
    tooltip : {
        formatter: "{a} <br/>{b} : {c}%"
    },
    series: [{
      name:option.title,
      type:'gauge',
      min:0,
      max:option.max,
      axisLine: {            // 坐标轴线
        lineStyle: {       // 属性lineStyle控制线条样式
          color: [[0.09, '#ff8d48'],[0.82, '#d7f20c'],[1, '#26cc41']],
          width: 5,
          shadowColor : '#fff', //默认透明
          shadowBlur: 10
        }
      },
      axisLabel: {            // 坐标轴小标记
        show: false,
        textStyle: {       // 属性lineStyle控制线条样式
          color: '#fff',
          shadowColor : '#fff', //默认透明
          shadowBlur: 10,
          fontSize: 12
        }
      },
      splitLine: {           // 分隔线
        length :10,         // 属性length控制线长
        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
          width:1,
          color: '#fff',
          shadowColor : '#fff', //默认透明
          shadowBlur: 10
        }
      },
      detail: {
        formatter: '',
        textStyle: {
          color: '#fff',
          fontSize: 14
        }
      },
      title: {
        textStyle: {
          color: '#fff'
        }
      },
      pointer: {
        width: 4
      },
      data: option.data
    }]
  }
  return config
}

// 面积图
function efficiencyDeptArea (option) {
  let time = option.time
  let year = new Date().getFullYear()
  let month = new Date().getMonth() - 1
  let xmax = new Date(year, month, 0).getDate()
  let config = {
    color: ['#26cc41', '#ff8d48', '#0167ff'],
    title: {
      text: option.title,
      textStyle: {
        fontSize: 12,
        fontWeight: 400
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        return `${data[0]}日：${data[1]}%`
      }
    },
    legend: {
      data: option.legend,
      right: '5%',
      textStyle: option.textStyle
    },
    xAxis: {
        min: 0,
        max: xmax,
        type: 'value',
        axisLine: option.axisLine,
        splitLine: {
          show: false
        }
    },
    yAxis: {
        min: 0,
        max: 100,
        type: 'value',
        axisLine: option.axisLine,
        splitLine: {
          lineStyle: {
            color: '#999',
            opacity: 0.6
          }
        }
    },
    series: option.series
  }
  return config
}

function efficiencyDeptY (option) {
  let time = option.time
  let year = new Date().getFullYear()
  let month = time ? parseInt(time) + 1 : new Date().getMonth() + 1
  let xmax = new Date(year, month-1, 0).getDate()
  let ymax = option.max ? option.max : 100
  // let ymin = option.min ? option.min : 70
  let ymin = 0
  let splitNum = parseInt(ymax - ymin)/10
  let xdata = ['']
  for (let i=1;i <= xmax;i++){
    xdata.push((month < 11? (month !== 1 ?'0' + (month-1) : 12) : month-1) + '-' + (i < 10? '0' + i : i))
  }
  let max = option.max ? option.max : 100
  let config = {
    title: {
      text: option.title,
      x: 'center',
      top:'90%',
      textStyle: {
          fontSize: 14,
          fontFamily: 'Microsoft YaHei',
          color: '#333333'
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        let name = params.seriesId
        return `${data[0]}日：${data[1].toFixed(2)}%`
      }
    },
    legend: {
      data: option.legend,
      right: '5%'
    },
    xAxis: {
      name: '天数',
      nameTextStyle: {
        padding: [20, 0, 0, 0]
      },
      min: 1,
      data: xdata,
      type: 'category',
      splitLine: {show: false},
      axisLine: {
        lineStyle: {
            color: '#000000',
        }
      },
      axisTick:{
        length: 0
      }
    },
    yAxis: [{
      name: '开机率/正规循环率',
      id: 'probability',
      min: ymin,
      max: ymax,
      type: 'value',
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      // splitNumber: splitNum,
      splitLine: {
        lineStyle:{
            color:['#ffffff']
        }
      },
      axisTick:{
        length: 0
      },
      nameGap:10
    },{
      name: '工时利用率',
      id: 'time',
      min: 0,
      max: option.worktimeMax,
      type: 'value',
      splitLine: {
        lineStyle:{
            color:['#3c3c3c']
        }
      },
    }],
    series: option.series
  }
  return config
}


function efficiencyLineDept (option) {
  let time = option.time
  let isShow = option.isShow
  let year = new Date().getFullYear()
  let month = time ? parseInt(time) + 1 : new Date().getMonth() + 1
  let xmax = new Date(year, month-1, 0).getDate()
  let ymax = option.max ? option.max : 100
  let ymin = option.min || option.min === 0 ? option.min : 70
  let rightMax = option.rightMax ? Math.ceil(option.rightMax) : 100
  let splitNum = parseInt(ymax - ymin)/10
  let xdata = ['']
  for (let i=1;i <= xmax;i++){
    xdata.push((month < 11? (month !== 1 ?'0' + (month-1) : 12) : month-1) + '-' + (i < 10? '0' + i : i))
  }
  let max = option.max ? option.max : 100
  let config = {
    title: {
      text: option.title,
      x: 'center',
      top:'90%',
      textStyle: {
          fontSize: 14,
          fontFamily: 'Microsoft YaHei',
          color: '#333333'
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        let name = params.seriesId
        return params.seriesId === 'roadworktime' || params.seriesId === 'faceworktime' ? `${data[0]}日：${data[1]}小时` : `${data[0]}日：${data[1].toFixed(2)}%`
      }
    },
    legend: {
      data: option.legend,
      right: '5%'
    },
    xAxis: {
      name: '天数',
      nameTextStyle: {
        padding: [25, 10, 0, 0]
      },
      min: 1,
      data: xdata,
      type: 'category',
      splitLine: {show: false},
      axisLine: {
        lineStyle: {
            color: '#000000',
        }
      },
      axisTick:{
        length: 0
      }
    },
    yAxis: [
      {
        name: '率值(%)',
        min: ymin,
        max: ymax,
        type: 'value',
        axisLine: {
          lineStyle: {
              color: '#000000',//左边线的颜色
          }
        },
        // splitNumber: splitNum,
        splitLine: {
          lineStyle:{
              color:['#c3c3c3']
          }
        },
        axisTick:{
          length: 0
        },
        nameGap:10
      },
      {
        name: '  时长(h)',
        show: isShow,
        min: 0,
        max: rightMax,
        type: 'value',
        axisLine: {
          lineStyle: {
              color: '#000000',//左边线的颜色
          }
        },
        splitNumber: 10,
        splitLine: {show: false},
        axisTick:{
          length: 0
        },
        nameGap:10
      }
    ],
    series: option.series
  }
  return config
}

//饼状图
function efficiencyOverview (option) {
  
  let config = {
    title: {
      text: option.title,
      x: 'center',
      top:'90%',
      textStyle: {
          fontSize: 14,
          fontFamily: 'Microsoft YaHei',
          color: '#333333'
      }
    },
    tooltip : {
      formatter: function (params) {
        var data = params.data || [0, 0]
        return `${data.name}：${data.value.toFixed(2)}%`
      }
    },
    visualMap: {
        show: false,
        min: 1,
        max: 100,
        inRange: {
            colorLightness: [0, 1]
        }
    },
    series: option.series
  }
  return config
}

//车辆开关状态图
function efficiencyBoot (option) {
  let year = option.year ? option.year.split('-')[0] : new Date().getFullYear()
  let config = {
    // backgroundColor: '#f2f2f2',
    grid: {
      show: true,
      left: '7%',
      top: '0',
      right: '10%',
      bottom: '0',
      containLabel: true, 
      backgroundColor:'#d8d8d8',
      height:50
    },  
    title: {
      text: option.title,
      x: 'center',
      top:'70%',
      textStyle: {
        fontSize: 14,
        fontFamily: 'Microsoft YaHei',
        color: '#333333'
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        return params.seriesId === 'open' ? `${data[0]}时刻：车辆开机` : `${data[0]}时刻：车辆关机`
      }
    },
    xAxis: {
      type: 'time',
      min: `${year}-${option.time} 00:00:00`,
      max: `${year}-${option.time} 23:59:59`,
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      axisLabel: {
        show: true,
        formatter: function (value, index) {
          if (index % 2 === 0 && window.isPC) {
            return new Date(value).format('hh:mm')+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index === 0) {
            return ''+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index % 2 === 0) {
            return new Date(value).format('h')
          } else {
            return ''
          }
        }
      },
      splitNumber: 48,
      splitLine: {show: false}
    },
    yAxis: {
      show: false,
      type: 'value',
      data: [0, 0.05],
      boundaryGap: false,
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      splitLine: {
        lineStyle:{
            color:['#f5f5f5']
        }
      }
    },
    series: option.series
  }
  return config
}

//真实车辆开关状态图
function efficiencyCarBoot (option) {
  let config = {
    grid: {
      show: true,
      left: '7%',
      top: '0',
      right: '10%',
      bottom: '0',
      containLabel: true, 
      backgroundColor:'#d8d8d8',
      height:50
    },  
    title: {
      text: option.title,
      x: 'center',
      top:'70%',
      textStyle: {
        fontSize: 14,
        fontFamily: 'Microsoft YaHei',
        color: '#333333'
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        return params.seriesIndex === 0 ? `${data[0]}时刻至${data[1]}：车辆启动` : `${data[0]}时刻至${data[1]}：车辆停止`
      }
    },
    xAxis: {
      type: 'time',
      min: `2018-${option.time} 00:00:00`,
      max: `2018-${option.time} 23:59:59`,
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      axisLabel: {
        show: true,
        formatter: function (value, index) {
          if (index % 2 === 0 && window.isPC) {
            return new Date(value).format('hh:mm')+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index === 0) {
            return ''+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index % 2 === 0) {
            return new Date(value).format('h')
          } else {
            return ''
          }
        }
      },
      splitNumber: 48,
      splitLine: {show: false}
    },
    yAxis: {
      show: false,
      type: 'value',
      data: [0, 0.05],
      boundaryGap: false,
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      splitLine: {
        lineStyle:{
            color:['#f5f5f5']
        }
      }
    },
    series: option.series
  }
  return config
}

//真实车辆开关状态图
function efficiencyCarBoot (option) {
  let config = {
    grid: {
      show: true,
      left: '7.7%',
      top: '0',
      right: '10%',
      bottom: '0',
      containLabel: true, 
      backgroundColor:'#d8d8d8',
      height:50
    },  
    title: {
      text: option.title,
      x: 'center',
      top:'70%',
      textStyle: {
        fontSize: 14,
        fontFamily: 'Microsoft YaHei',
        color: '#333333'
      }
    },
    tooltip: {
      formatter: function (params) {
        var data = params.data || [0, 0]
        return params.seriesIndex === 0 ? `${data[0]}时刻至${data[1]}：车辆启动` : `${data[0]}时刻至${data[1]}：车辆停止`
      }
    },
    xAxis: {
      type: 'time',
      min: `2018-${option.time} 00:00:00`,
      max: `2018-${option.time} 23:59:59`,
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      axisLabel: {
        show: true,
        formatter: function (value, index) {
          if (index % 2 === 0 && window.isPC) {
            return new Date(value).format('hh:mm')+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index === 0) {
            return ''+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index % 2 === 0) {
            return new Date(value).format('h')
          } else {
            return ''
          }
        }
      },
      splitNumber: 48,
      splitLine: {show: false}
    },
    yAxis: {
      show: false,
      type: 'value',
      data: [0, 1],
      boundaryGap: false,
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      splitLine: {
        lineStyle:{
            color:['#f5f5f5']
        }
      }
    },
    series: option.series
  }
  return config
}

//瓦斯浓度以及位移量
function efficiencygas (option) {

  console.log(option.series)
  let ymax = option.max
  let ymin = option.min
  let year = option.year ? option.year.split('-')[0] : new Date().getFullYear()
  let config = {
    title: {
      text: option.title,
      x:'center',
      y:'bottom',
      textStyle: {
          fontSize: 14,
          fontFamily: 'Microsoft YaHei',
          color: '#333333'
      }
    },
    tooltip: {
      formatter: function (params) {
        if (params.seriesName == '机器位置(m)') {
          var data = params.data || [0, 0, 0]
          return data[2] && `${data[0]}时刻移动速度为：${data[2]}`
        }
      },
      axisPointer: {
        type: 'cross'
      }
    },
    legend: option.legend,
    xAxis: [{
      type: 'time',
      splitLine: {show: false},
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      min: `${year}-${option.time} 00:00:00`,
      max: `${year}-${option.time} 23:59:59`,
      axisPointer: {
        label: {
          show: true,
          formatter: function (params) {
            return new Date(params.value).format('hh:mm:ss')
          }
        }
      },
      axisLabel: {
        show: true,
        formatter: function (value, index) {
          if (index % 2 === 0 && window.isPC) {
            return new Date(value).format('hh:mm')+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index === 0) {
            return ''+"\n"+new Date(value).format('MM-dd')
          } else if (!window.isPC && index % 2 === 0) {
            return new Date(value).format('h')
          } else {
            return ''
          }
        }
      },
      splitNumber: 48,
    }],
    yAxis:[ 
      {
        type: 'value',
        name: '瓦斯浓度',
        min: 0,
        max: 0.8,
        splitNumber:10,
        axisLine: {
          lineStyle: {
              color: '#000000',//左边线的颜色
          }
        },
        splitLine: {
          lineStyle:{
              color:['#c3c3c3']
          }
        },
        axisTick:{
          length: 0
        },
        nameGap:10
      },
      {
        type: 'value',
        name: '机器位置(m)',
        min: ymin,
        max: ymax,
        splitNumber:10,
        axisLine: {
          lineStyle: {
            color: '#000000',//左边线的颜色
          }
        },
        splitLine: {show: false},
        axisTick:{
          length: 0
        },
        nameGap:10,
        axisPointer: {
          label: {
            show: true,
            formatter: function (params) {
              return `${params.value.toFixed(2)}米`
            }
          }
        }
      },
      {
        show: false,
        type: 'category',
        boundaryGap: false,
        axisLine: {
            lineStyle: {
              color: '#ff8d48',//左边线的颜色
            }
        },
        splitLine: {
            lineStyle:{
              color:['#ff8d48']
            }
        }
      }
    ],
    series: option.series
  }
  return config
}

function rateBar (option) {
  let sanlv = {'dept_boot': 1, 'dept_worktime': 2, 'dept_rugular': 3}
  let key = option.key
  let sanlvID = sanlv[key]
  let sanlvStandart = xdata.metaStore.data.sanlv_standart
  let data = sanlvStandart && sanlvStandart.get(Number(sanlvID))
  let excellent = data ? Number(data.Excellent_Standart) : 60 // 优秀
  let bad = data ? Number(data.Bad_Standart) : 30 // 差

  let config = {
    grid:{
      top:10
    },
    tooltip: {
      formatter: function (params) {
        return `队组名：${params.name}  数值：${params.data}%`
      }
      // },
      // position: function (point) {
      //   return ['50%', '20%'];
      // }
    },
    xAxis: {
      // name: '队组',
      type: 'category',
      data: option.xAxis,
      axisLine: {
        lineStyle: {
            color: '#a9a9a9',
        }
      },
      axisLabel: {
        // show: false
        formatter: function (value) {
          return value.split("").join("\n")
        }
      }
    },
    yAxis: {
      // name: '(机率%)',
      type: 'value',
      axisLine: {
        lineStyle: {
            color: '#a9a9a9',
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(153,153,153,0.6)'
        }
      }
    },
    series: [{
      data: option.yAxis,
      type: 'bar',
      barWidth: 5,
      itemStyle: {
        normal: {
          color: function (params) {
            let data = params.data
            if (data < bad) {
              return '#ff8d48'
            } else if (data >= bad && data < excellent) {
              return '#d7f20c'
            } else {
              return '#26cc41'
            }
          }
        },
        emphasis: {color: '#2378f7'}
      },
      markLine: {
        silent: true,
        data: [
          {type : 'average', name: '', yAxis: excellent}
        ],
        itemStyle:{
          normal: {
              color: '#ff8d48',
              lineStyle: {color: '#ff8d48'}
          }
        }
      }
    }, {
      type: 'bar',
      markLine: {
        silent: true,
        data: [
          {type : 'average', name: '', yAxis: bad}
        ],
        lineStyle: {
          color: '#26cc41'
        }
      }
    }]
  }
  return config
}
function mrateBar (option) {
  let sanlv = {'dept_boot': 1, 'dept_worktime': 2, 'dept_rugular': 3}
  let key = option.key
  let sanlvID = sanlv[key]
  let sanlvStandart = xdata.metaStore.data.sanlv_standart
  let data = sanlvStandart && sanlvStandart.get(Number(sanlvID))
  let excellent = data ? Number(data.Excellent_Standart) : 60 // 优秀
  let bad = data ? Number(data.Bad_Standart) : 30 // 差

  let config = {
    grid: {
      show: true,
      left: '5%',
      top: '5',
      right: '7%',
      bottom: '0',
      containLabel: true, 
      height:100
    },
    title: {
      text: option.title,
      x: 'center',
      top:'80%',
      textStyle: {
        fontSize: 14,
        fontFamily: 'Microsoft YaHei',
        color: '#333333'
      }
    },
    xAxis: {
      // name: '队组',
      type: 'category',
      data: option.xAxis,
      axisLine: {
        lineStyle: {
            color: '#000000',
        }
      },
      axisLabel: {
        // show: false
        rotate: -30,
        formatter: function (value) {
          value = value.replace(/队/g, "").replace(/组/g, "")
          return value
        }
      }
    },
    yAxis: {
      // name: '(机率%)',
      type: 'value',
      axisLine: {
        lineStyle: {
            color: '#000000',
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(153,153,153,0.6)'
        }
      }
    },
    series: [{
      data: option.yAxis,
      type: 'bar',
      barWidth: 5,
      itemStyle: {
        normal: {
          color: function (params) {
            let data = params.data
            if (data < bad) {
              return '#ff8d48'
            } else if (data >= bad && data < excellent) {
              return '#d7f20c'
            } else {
              return '#26cc41'
            }
          }
        },
        emphasis: {color: '#2378f7'}
      },
      markLine: {
        silent: true,
        data: [
          {type : 'average', name: '', yAxis: excellent}
        ],
        lineStyle: {
          color: '#ff8d48'
        }
      }
    }, {
      type: 'bar',
      markLine: {
        silent: true,
        data: [
          {type : 'average', name: '', yAxis: bad}
        ],
        lineStyle: {
          color: '#26cc41'
        }
      }
    }]
  }
  return config
}
function mgauge(option) {
  let config = {
    title: {
      text: option.title,
      x: 'center',
      top:'80%',
      textStyle: {
        fontSize: 12,
        fontFamily: 'Microsoft YaHei',
        color: '#333333'
      }
    },
    tooltip : {
        formatter: "{a} <br/>{b} : {c}%"
    },
    series: [{
      name:option.title,
      type:'gauge',
      min:0,
      max:option.max,
      axisLine: {            // 坐标轴线
        lineStyle: {       // 属性lineStyle控制线条样式
          color: [[0.09, '#ff8d48'],[0.82, '#d7f20c'],[1, '#26cc41']],
          width: 5,
          shadowColor : '#fff', //默认透明
          shadowBlur: 10
        }
      },
      axisLabel: {            // 坐标轴小标记
        show: false,
        textStyle: {       // 属性lineStyle控制线条样式
          color: '#fff',
          shadowColor : '#fff', //默认透明
          shadowBlur: 10,
          fontSize: 12
        }
      },
      splitLine: {           // 分隔线
        length :10,         // 属性length控制线长
        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
          width:1,
          color: '#fff',
          shadowColor : '#fff', //默认透明
          shadowBlur: 10
        }
      },
      detail: {
        formatter: '',
        textStyle: {
          color: '#fff',
          fontSize: 14
        }
      },
      title: {
        textStyle: {
          color: '#fff'
        }
      },
      pointer: {
        width: 4
      },
      data: option.data
    }]
  }
  return config
}

function calendar(option) {
  let numType = option.type === 1 ? '刀' : '排'
  let config = {
    calendar: [{
      left: 'center',
      top: 'middle',
      cellSize: [140, 100],
      yearLabel: {show: false},
      orient: 'vertical',
      dayLabel: {
        firstDay: 1,
        nameMap: 'cn'
      },
      monthLabel: {
        show: false
      },
      range: option.time
    }],
    series: [{
      type: 'scatter',
      coordinateSystem: 'calendar',
      symbolSize: 1,
      label: {
        normal: {
          show: true,
          formatter: function (params) {
            var d = echarts.number.parseDate(params.value[0]);
            let name = null
            let unit = null
            if (option.name === 'sanlv_schedule') {
              name = '实际数值：'
              unit = ''
            } else {
              name = '计划开机时长：'
              unit = '小时'
            }
            return `${d.getDate()}\n\n${name}${params.value[2]}${unit}\n\n`
            // return d.getDate() + '\n\n' + name + params.value[2] + '小时' + '\n\n';
          },
          textStyle: {
            color: '#000'
          }
        }
      },
      data: option.data
    }, 
    {
        type: 'scatter',
        coordinateSystem: 'calendar',
        symbolSize: 1,
        label: {
          normal: {
            show: option.name === 'sanlv_schedule' ? false : true,
            formatter: function (params) {
              return '\n\n\n' + option.title + '：' + params.value[3] + numType;
            },
            textStyle: {
              fontSize: 14,
              fontWeight: 700,
              color: '#a00'
            }
          }
        },
        data: option.data
    },{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: option.data
    }]
  }
  return config
}

//综合数据图表
function rugulartotal (option) {
  let ymax = option.max
  let ymin = option.min
  let config = {
    title: [
      {
        text: option.title.deptName,
        x:'center',
        y:'bottom',
        textStyle: {
            fontSize: 14,
            fontFamily: 'Microsoft YaHei',
            color: '#333333'
        }
      },
      {
        text: option.title.complexName,
        top:'8%',
        left:'center',
        textStyle: {
            fontSize: 14,
            fontWeight:'400',
            fontFamily:'sans-serif'
        }
      },
      {
        text: option.title.carHeader,
        right:'3%',
        top: '8%',
        textStyle: {
          fontSize: 12,
          fontWeight:'400',
        }
      },
      {
        text: option.title.carEnd,
        right:'3%',
        top: '75%',
        textStyle: {
          fontSize: 12,
          fontWeight:'400',
        }
      },
      {
        text: option.title.total,
        right:'1%',
        top: '85%',
        textStyle: {
          fontSize: 12,
          fontWeight:'400',
        }
      }
    ],
    tooltip: {
      formatter: function (params) {
        if (params.seriesName == '机器位置(m)') {
          var data = params.data || [0, 0, 0]
          return data[2] && `${data[0]}时刻移动速度为：${data[2]}`
        }
      },
      axisPointer: {
        type: 'cross'
      }
    },
    legend: option.legend,
    xAxis: [{
      type: 'time',
      splitLine: {show: false},
      axisLine: {
        lineStyle: {
            color: '#000000',//左边线的颜色
        }
      },
      min: `${option.time} 00:00:00`,
      max: `${option.time} 23:59:59`,
      axisPointer: {
        label: {
          show: true,
          formatter: function (params) {
            return new Date(params.value).format('hh:mm:ss')
          }
        }
      },
      axisLabel: {
        show: true,
        formatter: function (value, index) {
          if(index%2 === 0){
            return new Date(value).format('hh:mm')+"\n"+new Date(value).format('MM-dd')
          }else{
            return ''
          }
        }
      },
      splitNumber: 48,
    }],
    yAxis:[ 
      {
        type: 'value',
        name: '瓦斯浓度',
        min: 0,
        max: 0.8,
        splitNumber:10,
        axisLine: {
          lineStyle: {
              color: '#000000',//左边线的颜色
          }
        },
        splitLine: {
          lineStyle:{
              color:['#f5f5f5']
          }
        },
        axisTick:{
          length: 0
        },
        nameGap:10
      },
      {
        type: 'value',
        name: '机器位置(m)',
        min: ymin,
        max: ymax,
        splitNumber:10,
        axisLine: {
          lineStyle: {
            color: '#000000',//左边线的颜色
          }
        },
        splitLine: {show: false},
        axisTick:{
          length: 0
        },
        nameGap:10,
        axisPointer: {
          label: {
            show: true,
            formatter: function (params) {
              return `${params.value.toFixed(2)}米`
            }
          }
        }
      },
      {
        show: false,
        type: 'category',
        boundaryGap: false,
        axisLine: {
            lineStyle: {
              color: '#ff8d48',//左边线的颜色
            }
        },
        splitLine: {
            lineStyle:{
              color:['#ff8d48']
            }
        }
      }
    ],
    series: option.series
  }
  return config
}

/**
 * 获取电量折线图
 */
function batcharts(options) {
  let config = {
    title: {
      text: options.title
    },
    color: ['#0167ff'],
    grid: {
      bottom: 80
    },
    dataZoom: [
      {
          show: true,
          realtime: true,
          start: 0,
          end: 100
      },
      {
          type: 'inside',
          realtime: true,
          start: 65,
          end: 85
      }
    ],
    xAxis: {
      type: 'time',
      min: options.record.shift(),
      max: options.record.pop(),
      axisLabel: {
        show: true,
        formatter: function (value) {
          return `${new Date(value).format('yyyy-MM-dd hh:mm:ss')}`
        }
      },
      axisTick:{
        alignWithLabel: true
      }
    },
    yAxis: {
      name: '电量(%)',
      type: 'value',
      min:0,
      max:100
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        if (params && params.length === 1) {
          return `时间：${params[0].data[0]}，电量：${params[0].data[1]}%`
        } else if (params && params.length === 3) {
          return `时间：${params[0].data[0]}，电量：${params[0].data[1]}%`
        }
      }
    },
    series: options.series, 
    visualMap: {
      show: false,
      seriesIndex: 0,
      pieces: 
      [{
          gt: 0,
          lte: 20,
          color: '#ff0000'
      }, {
          gt: 20,
          lte: 100,
          color: '#0167ff'
      }]
    }
  }
  return config
}

export { pieOption, barOption, lineOption, stackBarOption, smoothLineOption, staffcharts, efficiencyDept, gauge, efficiencyDeptBar, efficiencyOverview, efficiencyBoot, efficiencygas,efficiencyLineDept, rateBar, efficiencyDeptY, mrateBar, mgauge, calendar, efficiencyCarBoot, rugulartotal, batcharts}
