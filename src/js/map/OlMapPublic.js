import ol from 'openlayers'

function initgasLayer (map, gasDef, bgcolor) {
  let featureArr = []
  for (let i = 0, len = gasDef.length; i < len; i++) {
    let data = gasDef[i], id = data.id, x = data.x, y = -data.y, name = data.name
    drawFeature(featureArr, id, name, x, y, data.type, bgcolor)
  }
  let vectorSource = new ol.source.Vector({
    features: featureArr
  })

  let vectorLayer = new ol.layer.Vector({
    source: vectorSource
  })
  map.addLayer(vectorLayer)
  return {vectorSource, vectorLayer}
}

function drawFeature (featureArr, id, name, x, y, type, bgcolor) {
  let data = xdata.environmentalStore.environmentalData.get(id)
  if (data) {
    let feature = new ol.Feature({geometry: new ol.geom.Point([x, y]), name: 'gas', population: 4000, rainfall: 500, 'data-type': 'gas'})
    let text = type + ':' + (data[1]).slice(0, 5)
    feature.setId('gas' + id)
    feature.setStyle(setFeatureStyle(feature, text, bgcolor))
    featureArr.push(feature)
  } else {
    console.warn('please check gas config!')
  }
}

function setFeatureStyle (feature, text, bgcolor) {
  return new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: bgcolor
      }),
      radius: 25,
      stroke: ol.style.Stroke(
        {
          color: '#000000',
          width: 3
        }
      )
    }),
    text: new ol.style.Text({
      text: text,
      font: '18px',
      textAlign: 'center',
      fill: new ol.style.Fill({
        color: '#000000'
      })
    })
  })
}

function updateTextData (gasDef, vectorSource) {
  for (let i = 0, len = gasDef.length; i < len; i++) {
    let data = gasDef[i], id = data.id, pushValue = xdata.environmentalStore.environmentalData.get(id), feature = vectorSource.getFeatureById('gas' + id), type = data.type
    if (feature) {
      let style = feature.getStyle()
      let texts = style && style.getText()
      if (pushValue && pushValue[1]) {
        texts && texts.setText(type + ':' + (pushValue[1]).slice(0, 5))
        feature.setStyle(style)
      } else {
        console.warn('no data!')
      }
    }
  }
}

export { initgasLayer, updateTextData }
