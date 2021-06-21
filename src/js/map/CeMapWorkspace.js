// import { createElement } from './OlMapUtils.js'
import CeMapAnimator from './CeMapAnimator.js'
import CeMapCardLayer from './CeMapCardLayer.js'

export default class CeMapWorkspace {
  constructor (map, mapID) {
    this.map = map
    this.mapID = mapID

    this.animator = null
    this.cardLayer = null
    this.init()
  }

  init () {
    this.animator = new CeMapAnimator(this)
    this.cardLayer = new CeMapCardLayer(this)
  }

  doAnimate (msg) {
    let duration = xdata.cardStore.averageUpdateDuration * 0.95  // 本次动画周期 为 上次数据刷新周期 的 95%，尽量避免动画被中断
    this.animator.animate(msg.msg, msg.x, msg.y, duration)
  }
}
