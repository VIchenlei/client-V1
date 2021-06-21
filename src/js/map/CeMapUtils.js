
const MONKEYID = 7
const STATICID = 0

/**
 * append a symbol to the canvas
 * @method drawSymbol
 *
 * @param {*} attributes
 * @param {*} viewer
 */
function drawSymbol (attributes, viewer, type) {
  let label = null
  let model = null

  let id = attributes['data-id']
  let state = attributes['card_state']
  let dataType = attributes['data-subtype']
  
  let position = { x: attributes.x, y: -attributes.y }
  let catesianPos = mercatorToCatesian3(position.x, position.y)
  let orientation = formatModelOrientation(catesianPos, type)

  if(dataType === 'vehicle'){
    label = createLabelStyleVehicle(attributes)
    model = createVehicleModel(type)
  }else if(dataType === 'staff'){
    label = createLabelStyleStaff(id)
    model = createStaffModel(state)
  }
  let modelEntity = viewer.entities.add(new Cesium.Entity({
    label: label,
    id: id,
    properties: attributes,
    position: catesianPos,
    orientation: orientation,
    model: model
  }))
  modelEntity.mercatorPos = position
  return modelEntity
}

function createVehicleModel(type) {
  let model = null
  if(type === 'hidecard'){
    model = {
      url: '/model/vehicle.gltf',
      minimumPixelSize: 64,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  }else {
    model = {
      uri: '/model/che.gltf',
      minimumPixelSize: 5,
      maximumScale: 0.0003,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  }
  return model
}

function createStaffModel(state) {
  let model = null
  if(state === MONKEYID){
    model = {
      uri: '/model/monster.gltf',
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  }else if(state === STATICID){
    model = {
      uri: '/model/static.gltf',
      scale: 0.03,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  }else{
    model = {
      uri: '/model/kg.gltf',
      scale: 0.03,
      runAnimations: true,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
    // model = scene.primitives.add(Cesium.Model.fromGltf({
    //   url: '/model/kg.gltf',
    //   modelMatrix: matrix,
    //   scale: 0.05,
    //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    // }))

    // model.readyPromise.then(function (model) {
    //   model.activeAnimations.addAll({
    //     speedup: 0.5,
    //     loop: Cesium.ModelAnimationLoop.REPEAT
    //   })
    // })
  }
  return model
}


// function createVehicleEntity (scene, matrix, type) {
//   let model = null
//   if (type === 'hidecard') {
//     model = scene.primitives.add(Cesium.Model.fromGltf({
//       url: '/model/vehicle.gltf',
//       modelMatrix: matrix,
//       minimumPixelSize: 64,
//       heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
//     }))
//   } else {
//     model = scene.primitives.add(Cesium.Model.fromGltf({
//       url: '/model/che.gltf',
//       modelMatrix: matrix,
//       minimumPixelSize: 5,
//       maximumScale: 0.0005,
//       heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
//     }))
//   }
//   return model
// }

// function createStaffEntity (scene, matrix) {
//   let model = scene.primitives.add(Cesium.Model.fromGltf({
//     url: '/model/kg.gltf',
//     modelMatrix: matrix,
//     scale: 0.05,
//     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
//   }))

//   model.readyPromise.then(function (model) {
//     model.activeAnimations.addAll({
//       speedup: 0.5,
//       loop: Cesium.ModelAnimationLoop.REPEAT
//     })
//   })
//   return model
// }

/**
 *createLabelStyleStaff
 * @param {*} id
 */
function createLabelStyleStaff (id) {
  let name = null
  let names = xdata.metaStore.getCardBindObjectInfo(id)
  console.log(names)
  if (names) {
    name = names.name
  }
  let label = {
    text: name,
    showBackground: true,
    pixelOffset: new Cesium.Cartesian2(0.0, 20),
    scale: 0.5,
    eyeOffset: new Cesium.Cartesian3(0.0, 10, 0.0),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  }
  return label
}

/**
 * createLabelStyleVehicle
 * @param {*} attributes
 */
function createLabelStyleVehicle (attributes) {
  let name = ''
  if (attributes['type'] === 'unregistered') {
    name = attributes['data-id']
  } else {
    name = attributes['data-number'] + '|' + attributes['card-speed'] + 'Km/h'
  }
  let label = {
    text: name,
    showBackground: true,
    pixelOffset: new Cesium.Cartesian2(0.0, 20),
    scale: 0.5,
    eyeOffset: new Cesium.Cartesian3(0.0, 10, 0.0),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  }
  return label
}

/**
 * transform web mercator coordinates(x,y) to catesian coordinates(x,y,z)
 *
 */
function mercatorToCatesian3 (x, y, z = 0.0) {
  let webProj = new Cesium.WebMercatorProjection()
  let mktPt = webProj.unproject(new Cesium.Cartesian3(x, y))
  let longi = mktPt.longitude * 180 / Math.PI
  let lati = mktPt.latitude * 180 / Math.PI
  return new Cesium.Cartesian3.fromDegrees(longi, lati, z)
}

/**
 *
 */
function formatModelOrientation (position, type, heading) {
  let init = -Math.PI / 2
  if (heading) {
    init = init + heading
  }
  let hpr = new Cesium.HeadingPitchRoll(init)
  // let orientation = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr)
  let orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)
  return orientation
}

export { drawSymbol, mercatorToCatesian3, formatModelOrientation }
