import ol from 'openlayers'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import { drawSymbol, getPolylineBYPoints, drawOLLine } from './OlMapUtils.js'
import { getMessage, clone, getRows, unique, trim } from '../utils/utils'
import '../../config/tag/role-dialog.html'

export default class OlMapRoutePlan extends OlMapWorkLayer {
  constructor (workspace, draw) {
    super(workspace)
    this.map = workspace.map
    this.draw = draw
    this.mode = null
    this.routePlan = null
    let self = this

    this.initRoutePlanLayer()
    xbus.on('MAP-DRAW-ROUTEPLAN', (msg) => {
      if (this.map.getTarget() !== 'monitormap') return
      if (this.draw.interaction) {
        this.map.removeInteraction(this.draw.interaction)
      }
      this.isEdit = msg.isEdit
      this.addInteraction()
    })

    // xbus.on('DRAW-ROUTEPLAN-UPDATE', () => {
    //   console.log('需要删除线段')
    //   self.routeSource.clear()
    // })

    //展示预定路线、越界路线
    xbus.on('MAP-SHOW-ROUTEPLAN', (msg) => {
      this.features = this.routeSource.getFeatures()
      if (this.features.length > 0) this.routeSource.clear()
      this.viewRoutePlan(msg)  //执行展示预定路线函数
      this.viewCrossPath(msg)  //执行展示越界线函数
    })

    xbus.on('REPT-SHOW-RESULT', (ds) => {
      let names = ['rpt_att_staff', 'his_location_staff_']
      if (names.includes(ds.def.name)) {
        if (ds.def.name === 'rpt_att_staff') {
          let times = []
          ds.rows.forEach(e => {
            times.push([Date.parse(e.start_time), Date.parse(e.end_time)])
          })
          
          let startTime = null, endTime = null
          if (times.length > 1) {
            for (let i = 0; i < times.length; i++) {
              if (isNaN(times[i][1])) {
                endTime = new Date().format('yyyy-MM-dd hh:mm:ss')
              }
            }
          } else {
            endTime = new Date(times[0][1]).format('yyyy-MM-dd hh:mm:ss')
          }
          startTime = new Date(times[0][0]).format('yyyy-MM-dd hh:mm:ss')
          let sql = `SELECT id, obj_id, card_type_id, ident, DATE_FORMAT(begin_time,"%Y-%m-%d %H:%i:%s") AS begin_time, DATE_FORMAT(last_time,"%Y-%m-%d %H:%i:%s") AS last_time, begin_pt FROM his_location_staff_ WHERE obj_id=${this.obj_id} AND begin_time >= "${startTime}" AND begin_time <= "${endTime}" ORDER BY begin_time`
          this.inquireDB('his_location_staff_', sql)
          
        }
        if (ds.def.name === 'his_location_staff_') {
          this.viewCrossLine(ds.rows)
        }
      }
    })
  }

  //展示越界路线
  viewCrossLine (rows) {
    let paths = clone(rows)
    for (let i = 0; i < paths.length; i++) {
      paths[i]['shortime'] = this.getWarnPosition(paths[i])
    }
    let clonePaths = clone(paths)
    clonePaths.sort(function (a, b) {
      return a.shortime - b.shortime
    })
    let index = null
    for (let i = 0; i < paths.length; i++) {
      if (paths[i].shortime === clonePaths[0].shortime) index = i
    }
    let normalPaths =  clone(paths)
    let deviatePaths =  clone(paths)
    let normalRoads = normalPaths.splice(0,index+1)
    let deviateRoads = deviatePaths.splice(index)
    this.crossAllLinePath(normalRoads,1)
    this.crossAllLinePath(deviateRoads,2)
  }
  
  crossAllLinePath (rows, index) {
    for (let i = 0; i < rows.length; i++) {
      if (i < rows.length-1) {
        let startPath = rows[i]
        let endPath = rows[i+1]
        let roads = [startPath, endPath]
        this.setCrossLinePath(roads, index)
      }
    }
  }

  setCrossLinePath (roads,index) {
    let color = index === 1 ? '#804000' : '#FF6057'
    for (let i = 0; i < roads.length; i++) {
      let x = roads[i].begin_pt.split(',')[0]
      let y = roads[i].begin_pt.split(',')[1]
      roads[i]['x'] = Number(x)
      roads[i]['y'] = Number(y)
    }
    if (this.checked) {
      let path = getPolylineBYPoints(roads), className = 'track-whole', PatrolPath = 'PatrolPath'
      let line = this.drawOLLine(this.routeSource, path.pointCol, roads[0].id, color)
    }
  }

  //根据告警时间查找距离告警时间最近的位置
  getWarnPosition (row) {
    let time = null
    let beginTime = Date.parse(row.begin_time)
    let warnTime = Date.parse(this.attDate)
    time = Math.abs(warnTime-beginTime)
    return time
  }

  //展示预定路线
  viewRoutePlan (msg) {
    this.checked = msg.checked
    let store = xdata.metaStore
    let staffs = Array.from(store.staffs.values()).filter(item => item.card_id === msg.id)[0]
    let staffId = staffs.staff_id
    let lines = store.data.tt_inspection_route_planning.get(staffId)
    let routePlans = lines.route_planning
    let roadIdArr = []
    let routePlan = routePlans.split(';')
    for (let i = 0; i < routePlan.length; i++) {
      roadIdArr.push(trim(routePlan[i].split(',')[0]))
    }
    let roads = []
    roadIdArr.forEach(e => {
      roads.push(store.data.road_segment.get(Number(e)))
    })

    let color = '#ffcc33'
    for (let i = 0; i < roads.length; i++) {
      let singleRoad = []
      for (let j = 0; j < 2; j++) {
        let point = j === 1 ? roads[i].bpoint.split(',') : roads[i].epoint.split(',')
        let obj = {
          road_segment_id: roads[i].road_segment_id,
          x: Number(point[0]),
          y: Number(point[1])
        }
        singleRoad.push(obj)
      }
      if (msg.checked) {
        let path = getPolylineBYPoints(singleRoad), className = 'track-whole', PatrolPath = 'PatrolPath'
        let line = this.drawOLLine(this.routeSource, path.pointCol, roads[i].road_segment_id, color)
      }
    }
  }

  //查询考勤表获取下井起始结束时间
  viewCrossPath (msg) {
    this.attDate = msg.attDate
    let store = xdata.metaStore
    let staffs = Array.from(store.staffs.values()).filter(item => item.card_id === msg.id)[0]
    let staffId = staffs.staff_id
    this.obj_id = staffId
    // 根据日期查找下井起始结束时间 ${attDate.split(' ')[0]}
    let sql = `SELECT card_id, staff_id, shift_id, DATE_FORMAT(start_time,"%Y-%m-%d %H:%i:%s") AS start_time, DATE_FORMAT(end_time,"%Y-%m-%d %H:%i:%s") AS end_time, att_date FROM rpt_att_staff WHERE staff_id=${staffId} AND att_date="${this.attDate.split(' ')[0]}"`
    console.log(sql)
    this.inquireDB('rpt_att_staff', sql)
  }

  drawOLLine(routeSource, _point, name, color) {
    let point = _point
    let linestring = new ol.geom.LineString(point) // 坐标数组

    var lineFeature = new ol.Feature({
        geometry: linestring,
        id: name,
        finished: false
    })
    lineFeature.setId(`road${name}`)
    lineFeature.setStyle(new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: color,
        width: 3
      })
    }))
    // 2、生成轨迹
    let startMarker = new ol.Feature({
        geometry: new ol.geom.Point(point[0])
    })
    let endMarker = new ol.Feature({
        geometry: new ol.geom.Point(point[point.length - 1])
    })
    routeSource.addFeature(lineFeature)
    routeSource.addFeature(startMarker)
    routeSource.addFeature(endMarker)
    return { lineFeature: lineFeature, lineLength: linestring.getLength() }
  }

  initRoutePlanLayer () {
    this.routeSource = new ol.source.Vector()
    this.routeLayer = new ol.layer.Vector({
      source: this.routeSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 3
        })
      })
    })

    let self = this
    this.map.addEventListener('dblclick', function (e) {
      if (!self.routePlan) return
      if (!self.isEdit) {
        let store = xdata.metaStore
        let name = 'tt_inspection_route_planning'
        let table = {
          def: store.defs[name],
          rows: store.dataInArray.get(name),
          maxid: store.maxIDs[name]
        }
        let rows = getRows(null, table.def, table.maxid)
        let msg = getMessage('INSERT', rows, table.def, table.maxid)
        msg.rows.forEach(e => {
          if (e.field_name === 'route_planning') e.field_value = self.routePlan
        })
        self.showMetaDialog(msg)
      } else {
        xbus.trigger('UPDATE-ROLE-ROWS', {values: self.routePlan})
      }
      self.routePlan = null
      self.routeSource.clear()
      if (self.mode) {
        self.mode = null
        return false
      }
    }, false)
    this.map.addLayer(this.routeLayer)
  }

  drawstart (evt) {
    this.mode = 'drawing'
  }

  drawend (evt) {
    let pathGather = clone(Array.from(xdata.metaStore.data.road_segment.values()))
    let sketch = evt.feature
    let coord = null
    let geom = sketch.getGeometry()
    let wkt = new ol.format.WKT()
    let wktGeo = wkt.writeGeometry(geom)
    let shortRoads = []
    let path = wktGeo.slice(11,-2).split(',').map((item,index)=>{
      item = item.split(' ')
      item[0] = Number(Number(item[0]).toFixed(1))
      item[1] = Number(Number(item[1]).toFixed(1))
      return item
    })
    let self = this
    for (let i = 0; i < path.length; i++) {
      if (i<path.length -1) { 
        let obj = {
          start_point:{
            x: path[i][0],
            y: path[i][1]
          },
          end_point:{
            x: path[i+1][0],
            y: path[i+1][1]
          }
        } 
        let a = obj.start_point.x-obj.end_point.x
        let b = obj.start_point.y-obj.end_point.y
        let lineNum = 10  //开始点结束点线段距离等分成n段
        let line = Math.sqrt(a*a + b*b)/lineNum  //获取等分线段长度
        let coord = []
        for (let j = 0; j < lineNum; j++) {
          if (j === 0) coord.push([obj.start_point.x, obj.start_point.y])
          let x1 = obj.start_point.x + (obj.end_point.x-obj.start_point.x)*(j+1)/lineNum
          let y1 = obj.start_point.y + (obj.end_point.y-obj.start_point.y)*(j+1)/lineNum
          coord.push([x1,y1])
        }
        let singleShortPath = this.getCoverLine(coord, pathGather)
        shortRoads = shortRoads.concat(singleShortPath)
      } 
    }

    //查找覆盖路径去除重复的路径信息
    let key = 'road_segment_id'
    if (!shortRoads) return
    shortRoads = unique(shortRoads, key)

    let routePlan = ''
    for (let i = 0; i < shortRoads.length; i++) {
      if (i === 0) {
        coord = this.getStartAndEndPath(path[i][0],path[i][1],shortRoads[i].bpoint.x,shortRoads[i].bpoint.y,shortRoads[i].epoint.x,shortRoads[i].epoint.y)
        routePlan+=`${shortRoads[i].road_segment_id},,${coord.x},${-coord.y},${shortRoads[i].epoint.x},${-shortRoads[i].epoint.y};`
      } else if ( 0 < i && i < shortRoads.length-1) {
        routePlan+=`${shortRoads[i].road_segment_id},;`
      } else if (i === shortRoads.length-1 ) {
        coord= this.getStartAndEndPath(path[path.length-1][0],path[path.length-1][1],shortRoads[i].bpoint.x,shortRoads[i].bpoint.y,shortRoads[i].epoint.x,shortRoads[i].epoint.y)
        if (Number(shortRoads[i].bpoint.x) <= Number(coord.x) || Number(shortRoads[i].bpoint.y) <= Number(coord.y)) {
          routePlan+=`${shortRoads[i].road_segment_id},,${shortRoads[i].bpoint.x},${-shortRoads[i].bpoint.y},${coord.x},${-coord.y}`
        } else {
          routePlan+=`${shortRoads[i].road_segment_id},,${coord.x},${-coord.y},${shortRoads[i].bpoint.x},${-shortRoads[i].bpoint.y}`
        } 
      } 
    }
    this.routePlan = routePlan
    // if (!this.isEdit) {
    //   let store = xdata.metaStore
    //   let name = 'tt_inspection_route_planning'
    //   let table = {
    //     def: store.defs[name],
    //     rows: store.dataInArray.get(name),
    //     maxid: store.maxIDs[name]
    //   }
    //   let rows = getRows(null, table.def, table.maxid)
    //   let msg = getMessage('INSERT', rows, table.def, table.maxid)
    //   msg.rows.forEach(e => {
    //     if (e.field_name === 'route_planning') e.field_value = routePlan
    //   })
    //   this.showMetaDialog(msg)
    // } else {
    //   xbus.trigger('UPDATE-ROLE-ROWS', {values: routePlan})
    // }
    this.map.removeInteraction(this.draw.interaction)
  }

  //查找一条线段覆盖的多条路径
  getCoverLine (coord, pathGather) {
    let singleShortPath = []
    for (let i = 0; i < coord.length; i++) {
      if (i < coord.length -1) { 
        let obj = {
          start_point:{
            x: coord[i][0],
            y: coord[i][1]
          },
          end_point:{
            x: coord[i+1][0],
            y: coord[i+1][1]
          }
        }
        let shortPath = this.getshortPath(obj, pathGather)
        singleShortPath.push(shortPath)
      }
    }
    let key = 'road_segment_id'
    singleShortPath = unique(singleShortPath, key)
    return singleShortPath
  }

  //弹出录入对话框
  showMetaDialog (msg) {
    if (this.metaDialog) {
      this.metaDialog.unmount(true)
    }
    this.metaDialog = riot.mount('role-dialog', { message: msg })[0]
  }

  addInteraction () {
    let self = this
    let type = 'LineString'
    this.draw.interaction = new ol.interaction.Draw({
      source: this.routeSource,
      type: type,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#0099ff',
          width: 3
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    })

    this.map.addInteraction(this.draw.interaction)
    this.draw.interaction.addEventListener('drawstart', function (evt) { self.drawstart(evt) }, false)
    this.draw.interaction.addEventListener('drawend', function (evt) { self.drawend(evt) }, false)
  }

  // 获取传入直线的最近的路径
  getshortPath (pointObj, pathGather) {
    let roadPathGather = clone(pathGather)
    roadPathGather=roadPathGather.map(item =>{
      let bpoint = item.bpoint.split(',')
      item.bpoint= {
        x: Number(Number(bpoint[0]).toFixed(1)),
        y: -Number(Number(bpoint[1]).toFixed(1)),
      }
      let epoint = item.epoint.split(',')
      item.epoint= {
        x: Number(Number(epoint[0]).toFixed(1)),
        y: -Number(Number(epoint[1]).toFixed(1)),
      }
      let disAS = this.pointToLineDistance(pointObj.start_point.x,pointObj.start_point.y,item.bpoint.x,item.bpoint.y,item.epoint.x,item.epoint.y)[0]
      let disAE = this.pointToLineDistance(pointObj.end_point.x,pointObj.end_point.y,item.bpoint.x,item.bpoint.y,item.epoint.x,item.epoint.y)[0]
      item.distance = disAS+disAE
      return item
    })

    roadPathGather.sort(function (a,b) {
      return a.distance - b.distance
    })
    return roadPathGather[0]
  }

  //计算开始点、结束点到路径的距离
  getStartAndEndPath (xx, yy, x1, y1, x2, y2) {
    return this.pointToLineDistance (xx, yy, x1, y1, x2, y2)[1]
  }

  /*求点到直线的距离函数
  * xx,yy 所画线段x,y
  */
  pointToLineDistance (xx, yy, x1, y1, x2, y2) {
    let ang1, ang2, ang, m;
    let result = 0;

    // 分别计算三条边的长度
    const a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy));
    if (a === 0) {
      return [0, {
        x: x1,
        y: y1
      }];
    }
    const b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy));
    if (b === 0) {
      return [0, {
        x: x2,
        y: y2
      }];
    }
    const c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    // 如果线段是一个点则退出函数并返回距离
    if (c === 0) {
      result = a;
      return [result, {
        x: x1,
        y: y1
      }];
    }

    // 如果点(xx,yy到点x1,y1)这条边短
    if (a < b) {
      // 如果直线段AB是水平线。得到直线段AB的弧度
      if (y1 === y2) {
        if (x1 < x2) {
          ang1 = 0;
        } else {
          ang1 = Math.PI;
        }
      } else {
        m = (x2 - x1) / c;
        if (m - 1 > 0.00001) {
          m = 1;
        }

        ang1 = Math.acos(m);
        if (y1 > y2) {
          ang1 = Math.PI * 2 - ang1;
        } // 直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度
      }

      m = (xx - x1) / a;
      if (m - 1 > 0.00001) {
        m = 1;
      }

      ang2 = Math.acos(m);
      if (y1 > yy) {
        ang2 = Math.PI * 2 - ang2;
      } // 直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度

      ang = ang2 - ang1;
      if (ang < 0) {
        ang = -ang;
      }

      if (ang > Math.PI) {
        ang = Math.PI * 2 - ang;
      }

      // 如果是钝角则直接返回距离
      if (ang > Math.PI / 2) {
        return [a, {
          x: x1,
          y: y1
        }];
      }

      // 返回距离并且求得当前距离所在线段的坐标
      if (x1 === x2) {
        return [b * Math.sin(ang), {
          x: x1,
          y: yy
        }];
      } else if (y1 === y2) {
        return [b * Math.sin(ang), {
          x: xx,
          y: y1
        }];
      }

      // 直线的斜率存在且不为0的情况下
      let x = 0,
        y = 0;
      const k1 = ((y2 - y1) / (x2 - x1));
      const kk = -1 / k1;
      const bb = yy - xx * kk;
      const b1 = y2 - x2 * k1;
      x = (b1 - bb) / (kk - k1);
      y = kk * x + bb;
      return [a * Math.sin(ang), {
        x:Number(x.toFixed(1)),
        y:Number(y.toFixed(1))
      }];
    }
    // 如果两个点的纵坐标相同，则直接得到直线斜率的弧度
    if (y1 === y2) {
      if (x1 < x2) {
        ang1 = Math.PI;
      } else {
        ang1 = 0;
      }
    } else {
      m = (x1 - x2) / c;
      if (m - 1 > 0.00001) {
        m = 1;
      }
      ang1 = Math.acos(m);
      if (y2 > y1) {
        ang1 = Math.PI * 2 - ang1;
      }
    }
    m = (xx - x2) / b;
    if (m - 1 > 0.00001) {
      m = 1;
    }

    ang2 = Math.acos(m); // 直线(x2-x1)-(xx,yy)斜率的弧度
    if (y2 > yy) {
      ang2 = Math.PI * 2 - ang2;
    }

    ang = ang2 - ang1;
    if (ang < 0) {
      ang = -ang;
    }

    if (ang > Math.PI) {
      ang = Math.PI * 2 - ang;
    } // 交角的大小

    // 如果是对角则直接返回距离
    if (ang > Math.PI / 2) {
      return [b, {
        x: x2,
        y: y2
      }];
    }

    // 如果是锐角，返回计算得到的距离,并计算出相应的坐标
    if (x1 === x2) {
      return [b * Math.sin(ang), {
        x: x1,
        y: yy
      }];
    } else if (y1 === y2) {
      return [b * Math.sin(ang), {
        x: xx,
        y: y1
      }];
    }

    // 直线的斜率存在且不为0的情况下
    let x = 0,
      y = 0;
    const k1 = ((y2 - y1) / (x2 - x1));
    const kk = -1 / k1;
    const bb = yy - xx * kk;
    const b1 = y2 - x2 * k1;
    x = (b1 - bb) / (kk - k1);
    y = kk * x + bb;
    return [b * Math.sin(ang), {
      x:Number(x.toFixed(1)),
      y:Number(y.toFixed(1))
    }];
  }

  inquireDB(name, sql) {
    let message = {
      cmd: 'query',
      data: {
        name: name,
        sql: sql,
      }
    }
    xbus.trigger('REPT-FETCH-DATA', {
      req: message,
      def: {
        name: name
      }
    })
  }

}