/*

格式化 SVG 地图：
1. 确保最外层的 <svg> 元素 id 为 svgmap，即：<svg id="svgmap" ...>
2. 地图数据必须包含在一个 <g> 元素内，建议包含在 <g id="viewport"> 内；（地图数据不包括 defs、style）
3. 确保从地图数据所在的 <g> 至最外层的 <svg> 元素上，都没有 viewBox 属性（因为 viewBox 属性对内层地图进行的转换，会影响后面的坐标计算）；

*/
import ol from 'openlayers'
import {ZOOM_LEVEL} from '../def/map_def.js'
import {mapIcon} from '../def/map_icon.js'
import echarts from 'echarts'
// const ICON_FILE = '/icons/icons.svg'

// const SVGNS = 'http://www.w3.org/2000/svg'
// const XLINKNS = 'http://www.w3.org/1999/xlink'

// const SYMBOL_WIDTH = 5
// const SYMBOL_HEIGHT = 5
const areas = [1, 6, 27]
let vehiclePoint = mapIcon.vehiclePoint
let vehicleIcon = mapIcon.vehicle
let staffIcon = mapIcon.staff
let trackIcon = mapIcon.track
const MONKEYID = 7
const CMJTYPE = 25
const JJJTYPE = 26

/**
 * [buildPathDef 根据数组，组织开放的 path 字符串]
 * @param  {[Array]} data [坐标数组]
 * @return {[Object]}      [ 包括：{data: [], hopCount: number, path: pathstring}]
 */
function getPolylineBYPoints (data, special) {
  if (!data || data.length <= 0) {
    return { data: null, hopCount: 0, path: '' }
  }
  let pointList = new Array()
  let hopCount = data.length
  for (let i = 0; i < hopCount; i++) {
    let item = data[i]
    let x = item.x
    let y = item.y
    if (special) {
      let coordinates = item[special] && item[special].split(',')
      x = Number(coordinates[0])
      y = Number(coordinates[1])
    }
    pointList.push([x, -y])
  }
  return { data: data, hopCount: hopCount, pointCol: pointList }
}

function drawOLLine (layerSource, id, polCol, className, PatrolPath, row) {
  // layerSource.clear()
  let linestring = new ol.geom.LineString(polCol) // 坐标数组
  // var lineFeature = new ol.Feature(linestring,null,style_line);
  var lineFeature = new ol.Feature({
    geometry: linestring,
    finished: false
  })

  if (PatrolPath === 'PatrolPath') { // 巡检
    lineFeature.setId('hisTrackLine')
    lineFeature.setStyle(trackIcon['route'])
  } else if (PatrolPath === 'firstName') {
    lineFeature.setId('firstLine')
    lineFeature.setStyle(trackIcon['route'])
  } else if (PatrolPath === 'secondName') {
    lineFeature.setId('secondLine')
    lineFeature.setStyle(trackIcon['patrolPath'])
  } else {
    lineFeature.setStyle(trackIcon['patrolPath'])
    lineFeature.setId('hisTrackLinePatrolPath')
  }

  // 2、生成轨迹
  let startMarker = new ol.Feature({
    geometry: new ol.geom.Point(polCol[0])
  })
  let endMarker = new ol.Feature({
    geometry: new ol.geom.Point(polCol[polCol.length - 1])
  })
  if (PatrolPath === 'secondName') {
    startMarker.setStyle(trackIcon['start'])
    endMarker.setStyle(trackIcon['end'])
  } else {
    startMarker.setStyle(trackIcon['startMarker'])
    endMarker.setStyle(trackIcon['endMarker'])
  }

  if (row) {
    startMarker.setProperties({
      'id': id,
      'msg': row,
      'data-type': 'startMarker'
    })
    endMarker.setProperties({
      'id': id,
      'msg': row,
      'data-type': 'endMarker'
    })
  }
  layerSource.addFeature(lineFeature)
  layerSource.addFeature(startMarker)
  layerSource.addFeature(endMarker)
  return { lineFeature: lineFeature, lineLength: linestring.getLength() }
}

function workFace (attributes) { // 控制工作面图标显隐
  let cardID = attributes['data-id']
  let cardObj = xdata.metaStore.getCardBindObjectInfo(cardID)

  if (cardObj && cardObj.vehicle_id) {
    let vId = cardObj.vehicle_id
    let drivingFaceCard = xdata.metaStore.dataInArray.get('drivingface_vehicle')
    let coalFaceCard = xdata.metaStore.dataInArray.get('coalface_vehicle')

    drivingFaceCard = drivingFaceCard && drivingFaceCard.filter(item => item.vehicle_id === vId)
    coalFaceCard = coalFaceCard && coalFaceCard.filter(item => item.vehicle_id === vId)

    if ((drivingFaceCard && drivingFaceCard.length > 0) || (coalFaceCard && coalFaceCard.length > 0)) {
      return 'hidecard'
    } else {
      return 'showcard'
    }
  } else {
    return 'showcard'
  }
}

function convertSVGPath2Coord (pathString, split, substring, isreverse) {
  let coordinates = []
  split = split || ' '
  let paths = pathString.split(split)
  for (let path of paths) {
    let point = path.split(',')
    let x = substring ? Number(point[0]) : Number(point[0].substring(1))
    let y = isreverse ? Number(point[1]) : -Number(point[1])
    if (isNaN(x) || isNaN(y)) return coordinates
    coordinates.push([x, y])
  }

  return coordinates
}

/**
 * append a symbol to the canvas
 *
 * @method drawSymbol
 *
 * @param  {[type]}     canvas     [description]
 * @param  {[type]}     iconName  [description]
 * @param  {[type]}     attributes [description]
 *
 * @return {[Element]}                [返回被添加的对象]
 */
function drawSymbol (attributes, source, map, type) {
  // 添加Features
  let geo = type === 'uncover' ? createPosition(attributes) : new ol.geom.Point([attributes.x, -attributes.y])

  if (attributes.geom) {
    let wkt = new ol.format.WKT()
    geo = wkt.readGeometry(attributes.geom)
  }

  let feature = new ol.Feature(geo)
  feature.setId(attributes['data-id'])
  feature.setProperties(attributes)

  let dataType = attributes['data-subtype']
  let state = attributes['card_state']
  let viewZoom = map.getView().getZoom()
  switch (dataType) {
    case 'vehicle':
      feature.setStyle(createLabelStyle(feature, type, viewZoom, '', map))
      break
    case 'staff':
      feature.setStyle(createLabelStyleStaff(feature, type, state, viewZoom, map))
      break
    case 'landmark':
      feature.setStyle(mapIcon.landmark)
      break
    case 'workFace':
      feature.setStyle(mapIcon.workface)
      break
    case 'fadeArea':
      createFadeAreaFeature(map, source, attributes)
      break
    default:
      feature.setStyle(createDevice(feature, dataType))
      break
  }
  feature.getStyle() && source.addFeature(feature)

  return feature
}

// 非覆盖区域 给点
function createPosition (attributes) {
  let ret = null
  let areaID = attributes['card_area']
  if (xdata.metaStore.data.area_ex) {
    let area = xdata.metaStore.data.area_ex.get(areaID)
    if (area) {
      if (!area.point.includes(' ')) {
        return
      }
      let paths = area.point.split(' ')
      let x = Number(paths[0].split(',')[0].substring(1))
      let m = Number(paths[1].split(',')[1])
      let n = Number(paths[0].split(',')[1])
      let attrY = Math.random() * (m - n) + n
      ret = new ol.geom.Point([x, -attrY])
    } else {
      ret = new ol.geom.Point([attributes.x, -attributes.y])
    }
  }

  return ret
}

function createLabelStyle (feature, type, viewZoom, rotation, map) {
  rotation = rotation || 0
  let featureId = feature.getId()
  let mapTarget = map.getTarget()
  let vehicle = xdata.metaStore.getCardBindObjectInfo(featureId)
  let vehicleType = vehicle && vehicle.vehicle_type_id
  if (vehicle || mapTarget === 'trackmap') {
    let vType = feature.get('name')
    let category = vehicle && xdata.metaStore.getVehicleCategoryByTypeID(vehicle.vehicle_type_id)
    let view = map.getView()
    if (category || (vehicle && !vehicle.vehicle_type_id && vType === 'tunnellerFace') || mapTarget === 'trackmap') {
      if (viewZoom < ZOOM_LEVEL.SMALL) { // 16
        view.setProperties({zoomLevel: 'SMALL'})
        return getTypeIconPoint(category, rotation, type)
      } else if (viewZoom < ZOOM_LEVEL.MIDDLE) { // 18
        view.setProperties({zoomLevel: 'MIDDLE'})
        return getTypeIconVehicle(category, feature, type, rotation)
      } else {
        if (vehicleType === CMJTYPE || vehicleType === JJJTYPE) {
          return specialScale(viewZoom, feature, vehicleType)
        } else {
          view.setProperties({zoomLevel: 'MAX'})
          return getTypeIconBg(category, feature, type, rotation, viewZoom)
        }
      }
    } else {
      console.warn('Can NOT find vehicle_category by vehicle_type_id : ', vehicle.vehicle_type_id)
    }
  } else {
    console.warn('unprefect data!')
  }
}

function getTypeIconPoint (category, rotation, type) {
  let color = 'yellow'
  return new ol.style.Style({
    image: new ol.style.Icon({
      src: vehiclePoint[color].img,
      rotation: rotation,
      scale: 0.015
    })
  })
}

function getTypeIconVehicle (category, feature, type, rotation) {
  let vehicleRotation = rotation
  if (rotation && type !== 'hidecard') {
    vehicleRotation = rotation
  } else {
    let areaID = feature.get('card_area')
    let area = xdata.metaStore.data.area
    area = area && area.get(areaID)
    if (area) {
      vehicleRotation = area.angle
    }
  }

  let p = {
    rotation: vehicleRotation,
    rotateWithView: true,
    scale: 0.18
  }
  let workfaceState = feature.get('workface_state')
  let vehicleTypeID = feature.get('vehicle_type_id')
  if (vehicleTypeID == CMJTYPE) {
    p.src = workfaceState === 1 ? vehicleIcon.cmjON.img : vehicleIcon.cmj.img
    p.scale = 0.05
    p.rotation = 0
  } else if (vehicleTypeID == JJJTYPE) {
    p.src = workfaceState === 1 ? vehicleIcon.tunnelON.img : vehicleIcon.tunnel.img
    // p.rotation = rotation ? rotation : -45.55
    p.scale = 0.03
  } else {
    switch (type) {
      case 'unregistered': // 未绑定车辆
        p.src = vehicleIcon.unregistered.img
        break
      case 'nosignal': // 没接收到信号
        // p.src = vehicleIcon.nosignal.img
        // break
      default: // 正/静/非覆盖/胶轮车硐室
        let carcolor = category ? category.color : 'green'
        p.src = vehicleIcon[carcolor + 'car'].img
        p.scale = 0.2
    }
  }

  return new ol.style.Style({
    image: new ol.style.Icon(p)
  })
}

function specialScale (viewZoom, feature, type) {
  let areaID = feature.get('card_area')
  let area = xdata.metaStore.data.area.get(areaID)
  let rotation = area ? area.angle : -1.570796
  let p = {
    rotation: type === CMJTYPE ? 0 : rotation,
    rotateWithView: true
    // src: type === CMJTYPE ? vehicleIcon.cmj.img : vehicleIcon.tunnel.img
  }
  let workfaceState = feature.get('workface_state')
  if (workfaceState) {
    p.src = type === CMJTYPE ? vehicleIcon.cmjON.img : vehicleIcon.tunnelON.img
  } else {
    p.src = type === CMJTYPE ? vehicleIcon.cmj.img : vehicleIcon.tunnel.img
  }
  if (viewZoom >= 18 && viewZoom <=19) {
    p.scale = 0.05
  } else if (viewZoom > 19 && viewZoom <= 20) {
    p.scale = 0.1
  } else {
    p.scale = 0.3
  }
  return new ol.style.Style({
    image: new ol.style.Icon(p)
  })
}

function getTypeIconBg (category, feature, type, rotation, viewZoom) {
  let vehicleRotation = rotation
  let carcolor = category ? category.color : 'green'
  if (rotation) {
    vehicleRotation = rotation
  } else {
    let areaID = feature.get('card_area')
    let area = xdata.metaStore.data.area.get(areaID)
    if (area) {
      vehicleRotation = area.angle
    }
  }

  let p = {
    rotation: vehicleRotation,
    rotateWithView: true
  }
  let t = {
    font: '12px',
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -35
  }
  let vehicleTypeID = feature.get('vehicle_type_id')
  if (vehicleTypeID == CMJTYPE) {
    p.src = vehicleIcon.cmj.img
    p.scale = 0.3
    p.rotation = 0
    return new ol.style.Style({
      image: new ol.style.Icon(p)
    })
  } else if (vehicleTypeID == JJJTYPE) {
    p.src = vehicleIcon.tunnel.img
    p.rotation = -45.55
    if (window.workFaceLayer) {
      p.scale = viewZoom / 100
    } else {
      p.scale = 0.08
    }
    return new ol.style.Style({
      image: new ol.style.Icon(p)
    })
  }
  switch (type) {
    case 'special': // 胶轮车硐室
      p.src = type === 'special' ? vehicleIcon[carcolor + 'car'].img : vehicleIcon.nosignal.img
      p.scale = 0.2
      return new ol.style.Style({
        image: new ol.style.Icon(p)
      })
    case 'nosignal': // 未接收到信号
      // p.src = type === 'special' ? vehicleIcon[category.color + 'car'].img : vehicleIcon.nosignal.img
      // p.scale = 0.2
      // return new ol.style.Style({
      //   image: new ol.style.Icon(p)
      // })
    case 'unregistered': // 未注册卡
    case 'uncover': // 非覆盖区域 无速度
    default: // 正常 有速度
      p.src = type === 'unregistered' ? vehicleIcon.unregistered.img : vehicleIcon[carcolor + 'car'].img
      p.scale = type === 'unregistered' ? 0.2 : 0.28
      if (type === 'unregistered') { // 未注册卡 卡号
        t.text = String(feature.get('data-id'))
      } else if (type === 'uncover') { // 非覆盖区域 无速度
        t.text = String(feature.get('data-number'))
      } else { // 正常 有速度
        t.text = String(feature.get('data-number')) + '|' + feature.get('card-speed') + 'Km/h'
      }
      let cardId = String(feature.get('data-id'))
      t.text = addPersonNum(cardId, t.text)
      return new ol.style.Style({
        image: new ol.style.Icon(p),
        text: new ol.style.Text(t)
      })
  }
}

function addPersonNum (cardID, text) {
  if (!text) {
    return
  }
  let sum = xdata.PersonOnCarStore.personOnCarSum.get(cardID)
  sum = sum ? ',' + sum + '人' : ''
  return text + sum
}

function personOnCar (cardID) {
  let hasThisCard = xdata.PersonOnCarStore.personOnCar.get(cardID)
  return hasThisCard || false
}

function personOutCar (cardID) {
  let hasThisCard = xdata.PersonOnCarStore.presonOutCar.get(cardID)
  return hasThisCard || false
}

function createLabelStyleStaff (feature, type, state, viewZoom, map) {
  let id = feature.get('data-id')
  let name = null
  let names = xdata.metaStore.getCardBindObjectInfo(id)
  let view = map.getView()
  if (names) {
    name = String(names.name)
  } else {
    name = String(id)
  }
  let p = {
    scale: 0.12,
    rotateWithView: true
  }
  let t = {
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -45
  }
  let playtype = feature.get('playtype')
  if (playtype === 'HISTORY') {
    p.scale = 0.12
    t.text = `${name}|${feature.get('card-speed')}Km/h`
    if (state === MONKEYID) {
      p.src = staffIcon.monkey.img
    } else {
      p.src = staffIcon.normal.img
    }
  } else if (viewZoom < ZOOM_LEVEL.STAFFLEAVE) { // 小圆点
    view.setProperties({zoomLevel: 'STAFFSMALL'})
    p.src = (type === 'nosignal' && state !== MONKEYID) ? staffIcon.nosignalpoint.img : staffIcon.point.img
    p.scale = 0.015
    t.name = ''
    // if (viewZoom >= ZOOM_LEVEL.MIDDLE) {
    //   // t.text = name
    // }
  } else {
    if (viewZoom >= 21 && viewZoom < 22) {
      p.scale = 0.08
    } else {
      p.scale = 0.12
    }
    view.setProperties({zoomLevel: 'MAX'})
    if (state === MONKEYID) {
      p.src = staffIcon.monkey.img
    } else {
      p.src = type === 'nosignal' ? staffIcon.nosignal.img : staffIcon.normal.img
      // t.text = `${name}|${feature.get('card-speed')}Km/h`
    }
    t.text = type === 'nosignal' ? `${name}` : `${name}|${feature.get('card-speed')}Km/h` // 只有正常状态显示速度
    // t.text = `${name}`
  }
  // t.text = name
  return new ol.style.Style({
    image: new ol.style.Icon(p),
    text: new ol.style.Text(t)
  })
}

function createFadeAreaFeature (map,source,attributes) {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let distanceCount = attributes.distanceCount
  let fadeValue = attributes.fadeValue
  distanceCount.sort(function (a,b) {
    return a[0] - b[0]
  })
  let minDistanceArr = distanceCount[0]
  let maxDistanceArr = distanceCount[distanceCount.length -1]
  let maxDistance = maxDistanceArr[0]/2
  let sourceProj = map.getView().getProjection()
  for(let i = distanceCount.length -1; i >= 0; i-- ) {
    let distanceObj = distanceCount[i]
    let countNum = -distanceObj[1]
    let distance = distanceObj[0]/2
    let centerradius = new ol.geom.Circle([attributes.x,-attributes.y],distance)
    centerradius = centerradius.clone().transform(sourceProj, 'EPSG:3857')
    let feature = new ol.Feature({geometry: centerradius})
    feature.setId(attributes['data-id'] + '-' + i)
    feature.set('readerId',attributes['data-id'])
    feature.setProperties(attributes)
    let color = countNum > fadeValue ? '#00ff00' : '#666666'
    feature.setStyle(new ol.style.Style({
      fill:new ol.style.Fill({
        color:color
      }),
    }))
    feature.getStyle() && source.addFeature(feature)
  }
}

function getDeviceText(id) {
  if (!id) return ''
  let t
  let briefName = xdata.metaStore.data.reader.get(id).brief_name
  if (briefName) {
    t = {
      text: briefName,
      font: '12px',
      fill: new ol.style.Fill({color: 'red'}),
      stroke: new ol.style.Stroke({lineCap: 'square', color: '#fff', miterLimit: 20, width: 10}),
      offsetY: -25
    }
  }
  return t
}

function createDevice (feature, dataType) {
  let state = feature.get('state'), id = feature.get('id'), t, style, eventTypeID = feature.get('event_type')
  let p = {rotateWithView: true}
  switch (dataType) {
    case 'reader-v':
    case 'reader':
      t = getDeviceText(id)
      p.src = `../../img/${state === 0 ? 'reader' : Number(eventTypeID) === 33 ? 'chargereader' : 'unnormal'}.png`
      p.scale = 0.08
      break
    case 'virtual_reader': 
      t = getDeviceText(id)
      p.src = `../../img/virtualreader.png`
      p.scale = 0.08
      break
    case 'traffic':
      p.src = `../../img/${state === 0 ? 'traffic' : 'untraffic'}.png`
      p.scale = 0.1
      break
    case 'traffic-lights':
      if (state === '红') p.src = `../../img/lightred.png`
      if (state === '绿') p.src = `../../img/lightgreen.png`
      if (state === '黄') p.src = `../../img/lightyellow.png`
      p.scale = 0.08
      break
    case 'power':
      p.src = `../../img/power.png`
      p.scale = 0.5
      break
    default:
      console.warn('UNKNOWN device type : ', dataType)
      return null
  }
  style = t ? {image: new ol.style.Icon(p), text: new ol.style.Text(t)} : {image: new ol.style.Icon(p)}
  return new ol.style.Style(style)
}

/**
 *
 * @param {*装载的dom} canvaCharts
 * @param {*横坐标的数组数据} datax
 * @param {*纵坐标的数组数据} datay
 * @param {*标题党} titleText
 * @param {*} name
 */
function drawLineChart (canvaCharts, datax, datay, titleText, name, minTime, maxTime) {
  if (!canvaCharts) return
  window.xhint.close()
  let myChart
  if (!echarts.getInstanceByDom(canvaCharts)) {
    myChart = echarts.init(canvaCharts)
  } else {
    myChart = echarts.getInstanceByDom(canvaCharts)
  }

  let option = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%']
      }
    },
    title: {
      left: 'center',
      text: titleText
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'time',
      min: new Date(minTime),
      max: new Date(maxTime),
      boundaryGap: false,
      data: datax
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      min: 'dataMin'
    },
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }, {
      start: 0,
      end: 10,
      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    }],
    series: [
      {
        name: name,
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          normal: {
            color: 'rgb(255, 70, 131)'
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgb(255, 158, 68)'
            }, {
              offset: 1,
              color: 'rgb(255, 70, 131)'
            }])
          }
        },
        data: datay
      }
    ]
  }
  myChart.setOption(option)
}

/**
 * 加载交互绘制控件函数
 */
function initInteractions(map, draw, snap, modify, cb, originObj) {
  if (draw) {
    map.removeInteraction(draw.interaction)
  }
  if (snap) {
    map.removeInteraction(snap)
  }
  if (modify) {
    map.removeInteraction(modify)
  }
  addInteractions(map, draw, cb, originObj)
}

/**
 * 加载交互绘制控件函数
 */
function addInteractions (map, draw, cb, originObj) {
  let source = new ol.source.Vector()
  draw.interaction = new ol.interaction.Draw({
    source: source,
    type: /** @type {ol.geom.GeometryType} */ ('Polygon')
  })
  map.addInteraction(draw.interaction)
  typeof cb === 'function' && cb.call(originObj, draw.interaction)
}

function getRows(table, values, path) {
  values = values ? values.row : null
  let rows = []
  let length = table.def.fields.names.length
  for (let i = 0; i < length; i++) {
    let v = values ? values[table.def.fields.names[i]] : ''
    if (!values && i == table.def.keyIndex) {
    // 新增记录，id 为 最大id+1
      v = table.maxid ? table.maxid + 1 : 0
    }
    if (table.def.fields.names[i] === 'name') {
      v = '新添加数据'
    }
    if (table.def.fields.names[i] === 'path' && path) {
      v = path[table.def.fields.names[i]]
    }
    let row = {
      field_name: table.def.fields.names[i],
      field_value: v,
      field_type: table.def.fields.types[i],
      field_label: table.def.fields.labels[i],
      field_enableNull: table.def.fields.enableNull[i]
    }
    rows.push(row)
  }
  return rows
}

export { drawSymbol, drawLineChart, getPolylineBYPoints, drawOLLine, createLabelStyle, getTypeIconPoint, workFace, convertSVGPath2Coord, addPersonNum, personOnCar, personOutCar, createPosition, createLabelStyleStaff, initInteractions, getRows }
