import OlMapWorkLayer from './OlMapWorkLayer.js'
import {initgasLayer, updateTextData} from './OlMapPublic.js'
import {temperatureDef} from '../def/gas_pos_def.js'

export default class OlMapTemperatureLayer extends OlMapWorkLayer {
  constructor (workspace) {
    super(workspace)

    this.map = workspace.map
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    xbus.on('MAP-SHOW-TEMPERATURE', (msg) => {
      let mapId = xdata.metaStore.defaultMapID
      if(msg.mapID !== mapId) return
      if (msg.mapType === this.mapType) {
        if (msg.isVisible) {
          this.layerVisible = true
          let returnData = initgasLayer(this.map, temperatureDef, 'rgb(103, 211, 225)')
          this.source = returnData.vectorSource
          this.vectorLayer = returnData.vectorLayer
        } else {
          this.layerVisible = false
          this.vectorLayer.setVisible(false)
        }
      }
    })

    xbus.on('ENVIRONMENTAL-DATA-UPDATE', () => {
      if (this.layerVisible) { // 图层可见时更新数据
        updateTextData(temperatureDef, this.source)
      }
    })
  }
}
