import { trim, getRows, getMessage, compare } from '../js/utils/utils.js'
function show(ele, dlBgEle) {
  ele = ele.classList
  dlBgEle = dlBgEle.classList
  dlBgEle.remove('zoomNone')
  dlBgEle.add('zoomToOut')
  ele.add('zoomIn')
  ele.remove('zoomOut')
}

function formatFieldValue (type, value) {
  let ret = null
  switch (type) {
    case 'NUMBER':
    case 'SELECT':
      ret = +value // Number
      break
    case 'geom':
    case 'POLYGON':
      ret = value ? 'GEOMFROMTEXT(' + value + ')' : ret// 空间几何
      break
    default:
      value = value && trim(value)
      ret = `"${value}"` // String
      break
  }
  return ret
}

//提示文字 2019-05-20 lmj
function testUnenableNullData (tips) {
  let tipTxt = '请把必填字段填写完整'
  if(tips) tipTxt = tips
  let msg = {
    value: 'failure',
    tip: tipTxt
  }
  window.hintip.open(msg)
}

function metaUpdateRes(res, topicName, cmd, nameList) {
  let _nameList = nameList ? nameList : []
  let dlg_tips = null
  let updateRes = null
  if (res.data.name === topicName || _nameList.includes(res.data.name)) {
    if (res.code === 0) {
      let resultText = null
      switch (cmd) {
        case 'INSERT':
          resultText = '添加成功'
          break
        case 'UPDATE':
          resultText = '修改成功'
          break
        case 'DELETE':
          resultText = '删除成功'
          break
      }
      dlg_tips = resultText
      updateRes = true
    } else {
      dlg_tips = res.msg
      updateRes = false
    }
    let msg = {
      value: res.code === 0 ? 'success' : 'failure',
      tip: dlg_tips
    }
    window.hintip.open(msg)
    return updateRes
  }
}

//判断是否更新成功 2019-05-21 lmj
function testForm(tips,root) {
  let existIllegalValue = root.querySelector('.info')
  if(existIllegalValue){
    testUnenableNullData(tips)
    return true
  } else {
    return false
  }
}

function isReadonly(tableName,fieldName,tableKeyName,cmd) {
  if (cmd === 'INSERT') return ''
  if (cmd === 'DELETE') return 'readonly'
  if (cmd === 'UPDATE') {
    if (fieldName === tableKeyName) return 'readonly'
    if (tableName === 'his_regular_cycle_detail' && fieldName === 'detail_value' || tableName === 'his_startup_detail' && fieldName === 'real_startup_time' || tableName === 'his_regular_cycle_detail' && fieldName === 'schedule_value' || tableName === 'his_startup_detail' && fieldName === 'schedule_work_time' || tableName === 'dat_card' && fieldName === 'ident' || tableName === 'dat_reader_path_tof_n' && fieldName === 'tof_flag') return 'readonly'
    if (fieldName === 'pwd') return xdata.roleID === 1 ? '' : 'readonly'
    if (fieldName === 'id' && (tableName === 'font_size' || tableName === 'number_bars')) return 'readonly'
  }    
}

function isDisabled(tableName, fieldName, tableKeyName, cmd, fieldValue) {  
    if (cmd === 'INSERT') return ''
    if (cmd === 'DELETE') return 'disabled'
    if (fieldName === tableKeyName) return 'disabled'
    if (tableName === 'his_startup_detail' || tableName === 'his_startup_detail') return 'disabled'
    if (tableName === 'dat_card' && fieldName === 'card_type_id') return 'disabled'
    if (tableName === 'his_leader_arrange' && fieldName === 'shift_type_id') return 'disabled'
    if (tableName === 'dat_area' && fieldName === 'area_type_id' && fieldValue === 0) return 'disabled' 
    if (tableName === 'dat_user') return xdata.roleID === 1 ? '' : 'disabled'
  }

/**
 * @description: 获取下标
 */
function getLandIdx (res,name){
    let index
    res.forEach((e,i) => {
        if(e === name) {
            index = i
        }
    })
    return index
}

/**
 * @description: 获取天线 分站覆盖范围需要编辑的数据
 * @param {type} 
 * @return: 
 */
function getInfo (msg, value, cmd, key, compareField) {
    let result = []
    let _rows = msg.rows.filter(item => item[key] === value)
    if (compareField) _rows = _rows.sort(compare(compareField))
    for (let i = 0; i < _rows.length; i++) {
        let eitem = {}
        eitem['row'] = _rows[i]
        let rows = getRows(eitem, msg.def, msg.maxid)
        let _msg = getMessage(cmd, rows, msg.def, msg.maxid)
        result.push(_msg)
    }
    return result
}
/**
 * @description: 根据角度为0时计算 以分站为中心点圆上的坐标点 
 */
function getReaderCoord (x, y, r, angle) {
    // y = y
    let al = angle ? Number(angle) : 0
    let _r = 0.5 //天线半径默认2米,换算到地图上比例尺为1
    let x1 = x + _r * Math.cos((al * Math.PI) / 180)
    let y1 = y + _r * Math.sin((al * Math.PI) / 180)
    x1 = x1.toFixed(1)
    y1 = y1.toFixed(1)
    return { x: Number(x1), y: Number(y1) }
}
/**
 * @description: 根据角度转换canvas坐标 根据分站天线获得初始化角度需要减去90度 
 */
function getAntennaCoord (x, y, r, angle) {
    angle = angle ? Number(angle) : 0
    if ((x === y) && x === 60) angle = -angle
    let _r = r ? r : 2 //天线半径默认2米
    let x1 = x + _r * Math.cos((angle * Math.PI) / 180)
    let y1 = y + _r * Math.sin((angle * Math.PI) / 180)
    x1 = x1.toFixed(1)
    y1 = y1.toFixed(1)
    return { x: Number(x1), y: Number(y1) }
}
/**
 * @description: 根据角度为0时的坐标与天线的坐标计算天线的角度
 */
function getAantennaAngle (x1, y1, x2, y2 ) { // x y 为(bx-ax,by-ay)
    // let xrad = Math.atan2(y,x) // y在前 x在后
    // let angle = xrad / Math.PI * 180
    // angle = angle.toFixed(0)
    if ((x1 === y1) && x1 === 60) {
      y2 = -y2
      y1 = -y1
    }

    var angle = Math.floor(Math.atan2(y2-y1,x2-x1)*180/Math.PI);//将弧度转换成角度
 
   
    // var x = Math.abs(x1-x2)
    // var y = Math.abs(y1-y2)
    // var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
    // var cos = y/z;
    // var radina = Math.acos(cos);//用反三角函数求弧度
    // var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

    // if(x2>x1 && y2>y1){//鼠标在第四象限
    //     angle = 180 - angle;
    // }

    // if(x2==x1 && y2>y1){//鼠标在y轴负方向上
    //     angle = 180;
        
    // }

    // if(x2>x1 && y2==y1){//鼠标在x轴正方向上
    //     angle = 90;
    // }

    // if(x2<x1 && y2>y1){//鼠标在第三象限
    //     angle = 180+angle;
    // }

    // if(x2<x1 && y2==y1){//鼠标在x轴负方向
    //     angle = 270;
    // }

    // if(x2<x1 && y2<y1){//鼠标在第二象限
    //     angle = 360 - angle;
    // }
    return angle
}

/**
 * @description: 根据天线坐标获取转换后canvas坐标集合
 */
function getCanvasList (rcoords, antenna, cmd){
    let angleZeroCoord = []
    let canCoords = []
    if (antenna.length > 0) {
        antenna.forEach((e,i) => {
            let coords = []
            e.rows.forEach(el => {
                if (el.field_name === 'x' || el.field_name === 'y') {
                  if (cmd !== 'INSERT') {
                    coords.push(el.field_name === 'x' ? el.field_value : -el.field_value)
                  } else {
                    coords.push(el.field_value)
                  }
                }
            })
            angleZeroCoord.push(getAantennaAngle(rcoords[0], rcoords[1], coords[0], coords[1]))
 
            canCoords.push(getAntennaCoord(60,60,50,angleZeroCoord[i]))
        })
    }
    return canCoords
}
function getInsertMsg (def,maxid) {
    let rows = getRows(null, def, maxid)
    let msg = getMessage('INSERT', rows, def, maxid)
    return msg
}

function getModifyInsertMsg (msg,cmsg) {
    let rows1 = msg.rows
    let rows2 = cmsg.rows
    for (let i = 0; i < rows1.length; i++) {
        for (let j = 0; j < rows2.length; j++) {
            if((rows1[i].field_name === 'coalface_id' || rows1[i].field_name === 'drivingface_id') && rows2[j].field_name === 'work_face_id'){
                rows2[j].field_value = rows1[i].field_value
            } 
            if(rows2[j].field_name === 'vehicle_id'){
                rows2[j].field_value = 0
            } 
            if(rows1[i].field_name === rows2[j].field_name && (rows2[j].field_name === 'coalface_id' || rows2[j].field_name === 'drivingface_id')){
                rows2[j].field_value = rows1[i].field_value
            } 
            
        }
    }
    return cmsg

  }
//计算天数差的函数，通用  
function getDays(date1, date2) {    //date1和date2是2002-12-18格式  
    var aDate, oDate1, oDate2, iDays
    aDate = date1.split("-")
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])    //转换为12-18-2002格式  
    aDate = date2.split("-")
    oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24)    //把相差的毫秒数转换为天数  
    return iDays
}

/**
 * @description: 红绿灯基本信息 更改数据结构  获取下标
 */    
function getIdx (msg,name){
    let rows = msg.rows
    let index
    rows.forEach((e,i) => {
        if(e.field_name === name) {
            index = i
        }
    })
    return index
}

/**
 * @description: 根据分站覆盖范围开始坐标x值大小进行排序 
 */
function pathCompare(property,desc) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        if(desc==true){
            // 升序排列
            return value1 - value2;
        }else{
            // 降序排列
            return value2 - value1;
        }
    }
}


function getReaderMsg (def,maxid){
    let rows = getRows(null, def, maxid)
    let msg = getMessage('INSERT', rows, def, maxid)
    return msg
}

/**
 * @description: 进行分站编辑时候 未配置天线 给默认的天线
 */
function getModifyReaderMsg(msg, amsg, index) {
    let rows1 = msg.rows
    let rows2 = amsg.rows
    for (let i = 0; i < rows1.length; i++) {
        for (let j = 0; j < rows2.length; j++) {
            if (rows1[i].field_name === rows2[j].field_name && rows2[j].field_name === 'reader_id') {
                rows2[j].field_value = rows1[i].field_value
            }
            if (rows1[i].field_name === rows2[j].field_name && rows2[j].field_name === 'x') {
                rows2[j].field_value = rows1[i].field_value
            }
            if (rows1[i].field_name === rows2[j].field_name && rows2[j].field_name === 'y') {
                rows2[j].field_value = rows1[i].field_value
            }
            if (rows2[j].field_name === 'idx') {
                rows2[j].field_value = index
            }
        }
    }
    return amsg
}

//新增、编辑保存时判断日期格式是否正确
function checkDate(fieldType, fieldName, fieldValue) {
  let value = null
  if (fieldType === 'DATETIME' || fieldType === 'DATE') {
    let value = fieldValue.replace('T', ' ')
    value = new Date(value).getTime()
    if (isNaN(value) || value<0) return false
  }
  return true
}

export {show, formatFieldValue, testUnenableNullData, metaUpdateRes, testForm, isReadonly, isDisabled, getLandIdx, getInfo, getReaderCoord, getAantennaAngle, getCanvasList, getInsertMsg, getModifyInsertMsg, getDays, getIdx, pathCompare, getReaderMsg, getModifyReaderMsg, checkDate }