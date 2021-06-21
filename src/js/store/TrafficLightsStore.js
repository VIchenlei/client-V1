export default class TrafficLightsStore {
  constructor() {
    this.data = null// 总数
    this.trafficLights = new Map()
    this.registerGlobalEventHandlers()
  }
  registerGlobalEventHandlers() {
    xbus.on('TRAFFIC-LIGHTS-STATE', (data) => {
      // this.data = data
      if (data && data.length > 0) {
        for (let i = 0, len = data.length; i < len; i++) {
          if (this.trafficLights.get(data[i][1])){//红绿灯id
            this.trafficLights.delete(data[i][1])
          }
          this.trafficLights.set(data[i][1],data[i])
        }
        xbus.trigger('LIGHTS-STATE-UPDATE',data)
      }
    })
  }
}