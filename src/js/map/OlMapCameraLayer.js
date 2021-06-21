import OlMapWorkLayer from './OlMapWorkLayer.js'
import ol from 'openlayers'
import io from 'socket.io-client'
import { testMapID } from '../utils/utils.js'

export default class OlMapCameraLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)

    this.map = workspace.map
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this
    xbus.on('MAP-INIT-CAMERA', (msg) => {
      self.initLabelLayers()
      this.vectorLayer.setVisible(false)
    })

    xbus.on('MAP-SHOW-CAMERA', (msg) => {
      if (msg.mapType === this.mapType) {
        window.cameraLayerShow = msg.isVisible
        if(!this.vectorLayer){
          self.initLabelLayers()
        }
        if (msg.isVisible) {
          this.vectorLayer.setVisible(true)
        } else {
          this.vectorLayer.setVisible(false)
        }
      }
    })

    xbus.on('MAP-LOAD-SUCESS',()=>{
      this.initLabelLayers()
      let show = window.cameraLayerShow
      this.vectorLayer.setVisible(show)
    })

    xbus.on('START-PLAY-VEDIO', (msg) => {
      let id = msg.feature.getId()
      let data = xdata.metaStore.data.camera.get(id)
      let str = data && 'rtsp://' + data.user + ':' + data.password + '@' + data.ip + ':' + data.port + '/' + data.codec + '/' + data.channel + '/' + data.subtype + '/av_stream'
      console.log('rtspStr', str)
      // riot.mount('camera-area', { evt: msg.evt,data: data })[0]
      this.openVlc(str)
    })
  }

  openVlc (str) {
    let socket = io.connect('http://127.0.0.1:3000')
    if (!socket.connected) {
      socket.emit('chat message', str)
    }
    socket.on('reconnecting', (time) => {
      time === 2 ? socket.close() : console.warn('正在重连第' + time + '次...')
    })
    socket.on('disconnect', (error) => {
      console.log('error', error)
    })
    socket.on('error', (error) => {
      console.log(error)
    })
  }

  initLabelLayers () {
    let featureArr = []
    let carmeras = xdata.metaStore.dataInArray.get('camera')
    let curMapId = xdata.metaStore.defaultMapID
    if (carmeras && carmeras.length > 0) {
      for (var i = 0; i < carmeras.length; i++) {
        if (!testMapID(carmeras[i].map_id, curMapId)) continue
        this.drawlabel(featureArr, carmeras[i].camera_id, carmeras[i].x, carmeras[i].y, carmeras[i].angle)
      }
    }

    this.vectorSource = new ol.source.Vector({
      features: featureArr
    })

    this.vectorLayer = new ol.layer.Vector({
      source: this.vectorSource
    })

    this.map.addLayer(this.vectorLayer)
  }

  drawlabel (featureArr, id, x, y, angle) {
    let label = new ol.geom.Point([x, -y]), rotate, src = '../img/cameraright.png'
    rotate = angle
    // switch (angle) {
    //   case '东':
    //     rotate = 80
    //     break
    //   case '西':
    //     rotate = -80
    //     break
    //   case '南':
    //     rotate = 0
    //     break
    //   case '北':
    //     rotate = 0
    //     src = '../img/cameraleft.png'
    //     break
    //   default:
    //     console.warn('unknow direction config，please check config!')
    //     break
    // }
    let feature = new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
      name: 'camera',
      population: 4000,
      rainfall: 500,
      'data-type': 'camera'
    })
    // console.log('rotation', rotate)
    feature.setId(id)
    feature.setStyle(this.setFeatureStyle(feature, src, rotate))
    feature.setGeometry(label)
    featureArr.push(feature)
  }

  setFeatureStyle (feature, src, rotate) {
    return new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: src,
        rotation: rotate,
        scale: 0.14,
        rotateWithView: true
      }))
    })
  }
}
