import { drawSymbol } from './OlMapUtils.js'
import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'
import { getRows, getMessage } from '../utils/utils.js'
import { getIdx } from '../../config/utils.js'
const defColorArr = ['红','黄','绿','闪烁']//用来处理判断是否输出warn

export default class OlMapTrafficLightsLayer extends OlMapWorkLayer {
    constructor (workspace,draw) {
      super(workspace)
      this.map = workspace.map
      this.draw = draw
      this.snap = null
      this.source = null
      this.mapID = workspace.mapID
      this.trafficLightsLayer = workspace.trafficLightsLayer
  
      // 在地图上面增加图层
      this.initLayersList()
      this.groups = new Map() // 保存 device group 的 DOM 对象，用于后续修改状态，避免 DOM 搜索
      this.overlayGroups = new Map()
      this.registerGlobalEventHandlers()
      this.initDrawTrafficLisght()
    }

    registerGlobalEventHandlers (){
      xbus.on('MAP-SHOW-LIGHTS',(msg) => {//图层控制
        if (msg.mapType === 'MONITOR') {
          if (msg.isVisible) {
            this.removeOrAddOverlayHide('remove')
            this.trafficLightsLayer.setVisible(true)
          } else {
            this.removeOrAddOverlayHide('add')
            this.trafficLightsLayer.setVisible(false)
          }
        }
      })

      xbus.on('LIGHTS-STATE-UPDATE',(data)=>{
        this.drawLightsAndChangeState(data)
      })
       //登录的时候会有全量数据过来，直接画红绿灯，也可以初始化所有的灯为默认值
        xbus.on('MAP-SHOW-ONELIGHT', (msg) => {
            let overlay = this.map.getOverlayById('lightFlash' + 1)
        //   let index = getIdx(msg.light_msg,'light_id')
        //   let value = msg.light_msg.rows[0].field_value
        //   console.log(index)
        //   let data =  xdata.metaStore.data.light && Array.from(xdata.metaStore.data.light.values()).map(item =>[item.lights_group_id,item.light_id,3,'',0])
        //   data = data.filter(item => item[1] === value)
        //   console.log(data)
        })
        //新建红绿灯
        xbus.on('MAP-lightsEdit', (msg) => {  
            if (this.map.getTarget() !== 'monitormap') return
            this.source = new ol.source.Vector()
            this.tool = msg.tool.getAttribute('name')
            this.initInteractions()    
        })
    }
    /**
     * 加载交互绘制控件函数
     */
    initInteractions () {
        if (this.draw) {
        this.map.removeInteraction(this.draw.interaction)
        }
        if (this.snap) {
        this.map.removeInteraction(this.snap)
        }
        if (this.modify) {
        this.map.removeInteraction(this.modify)
        }
        this.addInteractions()
    }
    /**
     * 加载交互绘制控件函数
     */
    addInteractions () {
        this.draw.interaction = new ol.interaction.Draw({
        source: this.source,
        type: /** @type {ol.geom.GeometryType} */ ('Point')
        })
        this.map.addInteraction(this.draw.interaction)
        // this.snap = new ol.interaction.Snap({ source: this.source })
        // this.map.addInteraction(this.snap)
        let self = this
        this.draw.interaction.addEventListener('drawend', (evt) => {
        this.feature = evt.feature
        let wkt = new ol.format.WKT()
        let wktGeo = wkt.writeGeometry(this.feature.getGeometry())

        let name2 = 'landmark'
        if(this.tool === 'edit_forbid_bstation' || this.tool === 'pick_coordinate'){
            name2 = 'reader'
        }
        let store = xdata.metaStore
        let table = {
            def: store.defs[name2],
            rows: store.dataInArray.get(name2),
            maxid: store.maxIDs[name2]
        }

        let atable1
        let atable2
        let ptable
        let amsg = []
        let pmsg = []
        

        let geom = "'" + wktGeo + "'"
        let valueGeom = { geom: geom }
        let values = null
        let rows2 = this.getRows(table, values, valueGeom, wktGeo)
        let msg3 = getMessage('INSERT', rows2, table.def, table.maxid)

        if(name2 === 'reader'){
            atable1 = {
                def: store.defs['antenna'],
                rows: store.dataInArray.get('antenna'),
                maxid: store.maxIDs['antenna']
            }
            atable2 = {
                def: store.defs['antenna'],
                rows: store.dataInArray.get('antenna'),
                maxid: store.maxIDs['antenna']+1
            }
            ptable = {
                def: store.defs['reader_path_tof_n'],
                rows: store.dataInArray.get('reader_path_tof_n'),
                maxid: store.maxIDs['reader_path_tof_n']
            }
            let amsg1 = this.getReaderMsg(atable1.def,atable1.maxid)
            let amsg2 = this.getReaderMsg(atable2.def,atable2.maxid)
            amsg.push(this.getModifyReaderMsg(msg3,amsg1,1))
            amsg.push(this.getModifyReaderMsg(msg3,amsg2,2))
            pmsg.push(this.getReaderMsg(ptable.def,ptable.maxid))
        }
        name2 === 'reader' ? this.showReaderDialog(msg3,amsg,pmsg) : this.showMetaDialog(msg3)
        this.map.removeInteraction(this.draw.interaction)
        })
    }
    removeOrAddOverlayHide(type) {
      let overlays = document.getElementsByClassName('lightFlash')
      if(overlays && overlays.length > 0){
        for(let i=0,len = overlays.length; i<len; i++){
          type === 'remove' ?  overlays[i].classList.remove('hide') : overlays[i].classList.add('hide') 
        }
      }
    }

    drawLightsAndChangeState(data){
      //todo: 判断是否被画，被画后执行改变状态函数,或者可以用groups存起来，减少遍历
      // let lightsData = Array.from(xdata.metaStore.data.light.values())
      // console.log('data------',data)
      for(let i=0,len = data.length; i<len; i++){
        let lightData = xdata.metaStore.data.light.get(data[i][1]),x = lightData && lightData.x, y = lightData && lightData.y,state,stateData,stateName
        name = lightData && lightData.name
        stateData = xdata.metaStore.data.device_state.get(data[i][2])
        stateName = stateData && defColorArr.includes(stateData.name) && stateData.name
        if(!stateName){
          console.warn('unknow light state,pleace check device_state config!')
          continue
        }
        if(!this.setStateAndNeedRedraw(data[i],stateName,x,y)) continue //不需要重画就改变状态
        if(stateName==='闪烁'){
          this.mapAddOverlay(data[i],x,y)
          this.overlayGroups.set(data[i][1],true)
        }else{
          let attrs = {
            'groupId': data[i][0],
            'data-id': data[i][0] + '-' + data[i][1],
            'id': data[i][1],
            'data-type': 'lights',
            'data-subtype': 'traffic-lights', //设备类型名
            'stateCtrl': data[i][4],
            'ctrlUser': data[i][3],
            x: x,
            y: y,
            class: '',
            state: stateName
          }
          drawSymbol(attrs, this.lightsSource, this.map)
        }
      }
    }

    setStateAndNeedRedraw(data,stateName,x,y){
      let feature = this.lightsSource.getFeatureById(data[0] + '-' + data[1]),src
      let overlay = this.overlayGroups.get(data[1])
      if(!overlay && !feature) return true//都没有,即新画

      if(feature){//如果有，改状态,也有可能是改为overlay，改后不需要重画
        if(stateName === '闪烁'){
          this.mapAddOverlay(data,x,y)
          this.overlayGroups.set(data[1],true)
          this.lightsSource.removeFeature(feature)
        }else{
          if(stateName === '红') src = `../../img/lightred.png`
          if(stateName === '绿') src = `../../img/lightgreen.png`
          if(stateName === '黄') src = `../../img/lightyellow.png`
          let style = {image: new ol.style.Icon({src: src,scale: 0.08})}
          let attributes = {
            'groupId': data[0],
            'data-id': data[0] + '-' + data[1],
            'id': data[1],
            'data-type': 'lights',
            'data-subtype': 'traffic-lights', //设备类型名
            'stateCtrl': data[4],
            'ctrlUser': data[3],
            x: x,
            y: y,
            class: '',
            state: stateName
          }
          feature.setProperties(attributes)
          feature.setStyle(new ol.style.Style(style))
        }
        return false 
      }

      if(overlay){//原来是overlay,需要改为feature,需要重画
        this.removeOverlay(data) 
        return true 
      }
    }

    removeOverlay(data){
      let overlay = this.map.getOverlayById('lightFlash' + data[1])
      overlay && this.map.removeOverlay(overlay)
    }

    mapAddOverlay (data,x,y) {
      let curLayerShow = this.trafficLightsLayer.getVisible()
      let div = document.createElement('div')
      curLayerShow ? div.setAttribute('class','lightFlash') : div.setAttribute('class','lightFlash hide')
      div.setAttribute('id',data[1])
      div.setAttribute('groupId',data[0])
      div.setAttribute('ctrlUser',data[3])
      div.setAttribute('stateCtrl',data[4])

      let pointOverlay = new ol.Overlay({
        element: div,
        positioning: 'center-center',
        id: 'lightFlash' + data[1],
        stopEvent: false
      })

      div.addEventListener("click",this.showTips.bind(this,div,'overlay'))
      this.map.addOverlay(pointOverlay)
      pointOverlay.setPosition([x, -y])
    }

    initLayersList () {
      this.lightsSource = new ol.source.Vector()
      this.trafficLightsLayer = new ol.layer.Vector({
        source: this.lightsSource,
        style: new ol.style.Style({
          zIndex: 3
        })
      })
  
      this.trafficLightsLayer.setVisible(false)
      this.map.addLayer(this.trafficLightsLayer)
      this.isReaderDrawed = false
  
      this.registerEventHandler(this.map, this.trafficLightsLayer)
  
      return this.trafficLightsLayer
    }
  
    registerEventHandler (map, layer) {
      if (map == null) return
  
      this.map.addEventListener('click', (evt) => {
        let feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
  
        if (feature && feature.getProperties()['data-type'] === 'lights') {
          this.showTips(feature,'feature',evt)
        }
      })
    }

    showTips(ele,type,evt){
      let msg 
      if(type === 'feature'){
        msg = {
          groupId: ele.getProperties()['groupId'],
          lightId: ele.getProperties()['id'],
          stateName: ele.getProperties()['state'],
          ctrlUser: ele.getProperties()['ctrlUser'],
          stateCtrl: ele.getProperties()['stateCtrl'],
          evt: evt                
        }
      }else if(type === 'overlay'){
        msg = {
          groupId: Number(ele.getAttribute('groupId')),
          lightId: Number(ele.getAttribute('id')),
          stateName: '闪烁',
          ctrlUser: ele.getAttribute('ctrlUser'),
          stateCtrl: Number(ele.getAttribute('stateCtrl')),
          evt: evt     
        }
      }else{
        console.warn('unKnown click type!')
      }
      xbus.trigger('LIGHT-TIPS-UPDATE',msg)
    }

    initDrawTrafficLisght(){
      let data =  xdata.metaStore.data.light && Array.from(xdata.metaStore.data.light.values()).map(item =>[item.lights_group_id,item.light_id,3,'',0])
      data && this.drawLightsAndChangeState(data)
    }
}