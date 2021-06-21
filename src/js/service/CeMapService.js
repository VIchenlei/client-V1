import CeMapWorkspace from '../map/CeMapWorkspace.js'
import { mercatorToCatesian3 } from '../map/CeMapUtils.js'

var Cesium = window.Cesium
export default class CeMapService {
  /**
   * 初始化
   */
  constructor () {
    this.viewerID = -1
    this.viewer = null
    this.workspace = null
    this.ellipsoidProvider = new Cesium.EllipsoidTerrainProvider()
    xbus.on('terrainControl', (msg) => {
      if (msg.isVisible) {
        this.loadTerrain(this.viewer)
      } else {
        this.viewer.terrainProvider = this.ellipsoidProvider
      }
    })

    xbus.on('space_pos', (msg) => {
      this.flyToCoordinate(msg.lon, msg.lat, msg.height)
    })
  }

  /**
 * 坐标定位
 * @param lon
 * @param lat
 */
  flyToCoordinate (lon, lat, height) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-30),
        roll: 0.0
      },
      complete: this.completePos()
    })
  }
  /**
 * 完成定位
 */
  completePos () {
    this.loadImagery(this.viewer)
    this.viewer.sceneMode = Cesium.SceneMode.COLUMBUS_VIEW
  }
  /**
   * 创建cesium viewer
   */
  createViewer (containerName) {
    let container = document.querySelector('#' + containerName)
    this.viewer = new Cesium.Viewer(container, {
      animation: false,
      baseLayerPicker: true,
      fullscreenButton: false,
      sceneModePicker: false,
      timeline: false,
      navigationHelpButton: false
      // sceneMode: Cesium.SceneMode.COLUMBUS_VIEW
    })
    // this.viewer.extend(Cesium.viewerCesiumNavigationMixin, {})
    // this.loadImagery(this.viewer)
    // this.loadGeojson(this.viewer, '/data/geojson/putonglumian84.geojson', Cesium.Color.WHITE.withAlpha(0.2))
    // this.loadGeojson(this.viewer, '/data/geojson/zhuhang84.geojson', Cesium.Color.BLUE.withAlpha(0.2))
    // this.loadGeojson(this.viewer, '/data/geojson/gongzuomian84.geojson', Cesium.Color.WHITE.withAlpha(0.5))
  //  initCameraView
    this.initCameraView(this.viewer)
    // this.createTooltip(this.viewer)
    this.loadSpecialScene(this.viewer)
    this.workspace = new CeMapWorkspace(this.viewer, this.viewerID)
  }
  /**
   *loading terrain
   * @param {*} viewer
   */
  loadTerrain (viewer) {
    let cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
      url: '/data/terrain_tiles',
      requestWaterMask: true,
      requestVertexNormals: true
    })
    viewer.terrainProvider = cesiumTerrainProviderMeshes
  }

  /**
   *loading imagery
   * @param {*} viewer
   */
  loadImagery (viewer) {
    let imageryDef = {
      url: 'http://local.beijingyongan.com:8091/geoserver/GeoHe/wms',
      layers: 'GeoHe:daohedaping2',
      parameters: {
        transparent: false,
        gridSet: 'gaohemap',
        format: 'image/png'
      }
    }
    viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider(imageryDef))
  }

 /**
  * 加载矢量数据
  * @param {*} viewer
  * @param {*} jsonpath
  */
  loadGeojson (viewer, jsonpath, color) {
    let promise = Cesium.GeoJsonDataSource.load(jsonpath)
    promise.then(function (dataSource) {
      viewer.dataSources.add(dataSource)

        // Get the array of entities
      let entities = dataSource.entities.values

        // let colorHash = {};
      for (let i = 0; i < entities.length; i++) {
            // For each entity, create a random color based on the state name.
            // Some states have multiple entities, so we store the color in a
            // hash so that we use the same color for the entire state.
        let entity = entities[i]
            // var name = entity.name;
            // let color = Cesium.Color.WHITE.withAlpha(0.2);

            // Set the polygon material to our random color.
        entity.polygon.material = color
            // Remove the outlines.
        entity.polygon.outline = false

            // Extrude the polygon based on the state's population.  Each entity
            // stores the properties for the GeoJSON feature it was created from
            // Since the population is a huge number, we divide by 50.
        entity.polygon.extrudedHeight = 3.0
      }
    }).otherwise(function (error) {
          // Display any errrors encountered while loading.
      window.alert(error)
    })
  }

  /**
   * Create an initial camera view
   * @param {*} viewer
   */
  initCameraView (viewer) {
    let scene = viewer.scene
    let initialPosition = new Cesium.Cartesian3.fromDegrees(112.925939530983, 36.25579663462959, 50000)
    let homeCameraView = {
      destination: initialPosition
    }
    // Set the initial view
    scene.camera.setView(homeCameraView)

    // Add some camera flight animation options
    homeCameraView.duration = 2.0
    homeCameraView.maximumHeight = 2000
    homeCameraView.pitchAdjustHeight = 2000
    homeCameraView.endTransform = Cesium.Matrix4.IDENTITY
    // Override the default home button
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
      e.cancel = true
      viewer.scene.camera.flyTo(homeCameraView)
    })
  }

  /**
   * create mouse position tooltip
   */
  createTooltip (viewer) {
    var entity = viewer.entities.add({
      label: {
        show: false,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0)
      }
    })

    var scene = viewer.scene
    var handler
    // Mouse over the globe to see the cartographic position
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
    handler.setInputAction(function (movement) {
      var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid)
      if (cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5)
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5)

        entity.position = cartesian
        entity.label.show = true
        entity.label.text = 'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' + '\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0'
      } else {
        entity.label.show = false
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * load special scene,such as 供电站、水泵等
   */
  loadSpecialScene (viewer) {
    let gaohePos = Cesium.Cartesian3.fromDegrees(112.997259468689, 36.14970839030099, 0)
    let guchengPos = Cesium.Cartesian3.fromDegrees(112.925939530983, 36.25579663462959, 0)
    let wangzhuangPos = Cesium.Cartesian3.fromDegrees(113.04732515211481, 36.36608493615906, 0)
    let yuwuPos = Cesium.Cartesian3.fromDegrees(112.85964605297092, 36.365557359087724, 0)

    viewer.entities.add({
      id: 'wangzhuang_pos',
      type: 'pos',
      position: wangzhuangPos,
      billboard: {
        image: '/img/meikuang.png',
        height: 80,
        width: 80.0

      },
      label: {text: '王庄'}

    })

    viewer.entities.add({
      id: 'gaohe_pos',
      type: 'pos',
      position: gaohePos,
      billboard: {
        image: '/img/meikuang.png',
        height: 80,
        width: 80
      },
      label: {text: '高河'}
    })

    viewer.entities.add({
      id: 'gucheng_pos',
      type: 'pos',
      position: guchengPos,
      billboard: {
        image: '/img/meikuang.png',
        height: 80,
        width: 80
      },
      label: {text: '古城'}
    })

    viewer.entities.add({
      id: 'yuwu_pos',
      type: 'pos',
      position: yuwuPos,
      billboard: {
        image: '/img/meikuang.png',
        height: 80,
        width: 80
      },
      label: {text: '余吾'}
    })

    viewer.entities.add({
      position: mercatorToCatesian3(4659, 181),
      billboard: {
        image: '/img/1.png',
        height: 40,
        width: 40,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    viewer.entities.add({
      position: mercatorToCatesian3(4658, 217),
      billboard: {
        image: '/img/2.png',
        height: 40,
        width: 40,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    viewer.entities.add({
      position: mercatorToCatesian3(4715, 368),
      billboard: {
        image: '/img/3.png',
        height: 40,
        width: 40,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    viewer.entities.add({
      position: mercatorToCatesian3(4671, -138),
      billboard: {
        image: '/img/4.png',
        height: 40,
        width: 40,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })

    let handler = this.viewer.screenSpaceEventHandler
    handler.setInputAction(function (evt) {
      let pickedPrimitive = this.viewer.scene.pick(evt.position)
      let pickedEntity = Cesium.defined(pickedPrimitive) ? pickedPrimitive.id : undefined
      if (Cesium.defined(pickedEntity) && pickedEntity.type && pickedEntity.type === 'pos') {
        switch (pickedEntity.id) {
          case 'gucheng_pos':
            msg = {
              lon: 0.05,
              lat: 0.005,
              height: 10000
            }

            xbus.trigger('space_pos', msg)
            break
          case 'wangzhuang_pos':
            msg = {
              lon: 0.05,
              lat: 0.005,
              height: 10000
            }

            xbus.trigger('space_pos', msg)
            break
          case 'gaohe_pos':
            msg = {
              lon: 0.05,
              lat: -0.035,
              height: 1500
            }
            this.flyToCoordinate(msg)
            break
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }
}
