import TWEEN from '@tweenjs/tween.js'
import { mercatorToCatesian3, formatModelOrientation } from './CeMapUtils.js'
// // 为避免车辆因为误差而频繁掉头，设置最大容忍距离和角度
// // TODO 人不能实施该处理
// const MAX_BACKOFF_OFFSET = 5
// const MAX_BACKOFF_ANGLE = Math.PI - Math.PI / 18  // 170 度的弧度

export default class CeMapAnimator {
  constructor (workspace) {
    this.workspace = workspace
    this.map = workspace.map
  }

  /**
   * 在地图上，将 obj、pObj 移动到 pos 位置
   * @param {*} obj OpenLayers 对象
   * @param {*} pObj OpenLayers Overlay对象
   * @param {*} pos 坐标[x,y]
   * @return {*} 坐标
   */
  moveto (obj, pos, type, angle) {
    let modelPos = mercatorToCatesian3(pos.x, pos.y)
    obj.orientation = formatModelOrientation(modelPos, type, angle)
    obj.position = modelPos
  }

  /**
   *  停止 obj 上的动画循环
   * @param {*} obj
   * @return 是否中断
   */
  stopAnimationLoop (obj, x, y) {
    obj.mercatorPos = { x: x, y: y }
    console.log(obj)
  }

  /**
   * Stop the tween on obj
   * @param {*} obj
   */
  stopTween (obj) {
    let tween = obj.get('xtween')
    if (tween) {
      tween.stop()
      obj.set('xtween', null)
    }
  }

  /**
   * 如果上一次动画尚未完成，则结束上一次动画，并将对象直接移动到上一次动画的目标位置，并返回该位置
   * @param {*} obj 图标对象
   * @param {*} positionObj 定位动画对象（水纹扩散动画）
   */
  stopPreviewAnimation (obj, positionObj) {
    let ret = null

    let isStopped = this.stopAnimationLoop(obj)
    if (isStopped) {
      // 注意：中断动画时，需要同时停掉 tween，否则会触发 tween.onComplete()
      this.stopTween(obj)

      // 如果是主动中断的动画，需要把坐标移动到目标位置
      ret = obj.get('xpos')
      this.moveto(obj, positionObj, ret)
    }

    return ret
  }

  /**
   * 获得初始位置，如果前一次动画存在，中断之
   * @param {*} obj
   * @param {*} positionObj
   * @return [x, y]
   */
  getStartPosition (obj) {
    let startPosition = obj.getGeometry().getCoordinates()
    return startPosition
  }

  /**
   * 从 x 轴到点 (dx, dy) 之间的弧度
   * @param {*} dx
   * @param {*} dy
   */
  getAngle (dx, dy) {
    // atan2() 返回从正向 x 轴到点 (dx,dy) 之间的弧度。
    let angle = Math.atan2(dy, dx)

    // // （angle * 180 / Math.PI）转换为角度
    // let angle = Math.atan2(dy, dx) * 180 / Math.PI

    return angle
  }

  /**
   * 车辆根据行进方向旋转图标
   * @param {*} msg
   * @param {*} x
   * @param {*} y
   * @param {*} startPosition
   */
  rotateEntity (msg, x, y, position) {
    let obj = msg.group
    let subtype = obj.properties.getValue()['data-subtype']
    let startx = position.x
    let starty = position.y
    let dx = x - startx
    let dy = starty - y
    let angle = this.getAngle(dx, dy)
    return angle
  }

  /**
   * 动画入口函数
   * @param {*} msg
   * @param {*} x
   * @param {*} y
   * @param {*} duration
   */
  animate (msg, x, y, duration) {
    let self = this
    let obj = msg.group
    let subtype = obj.properties.getValue()['data-subtype']
    let position = obj.mercatorPos
    if (x === position.x && y === position.y) {
      return
    }
    let startPosition = position
    let targetPosition = {x: x, y: y}
    let tween = new TWEEN.Tween(startPosition).to(targetPosition, duration)
    let angle = this.rotateEntity(msg, x, y, position)
    obj.mercatorPos = {x: x, y: y}
    tween.onUpdate(function () {
      self.moveto(obj, startPosition, subtype, angle)
    })

    // tween.onComplete(function () {
    //   self.stopAnimationLoop(obj, x, y)

    //   // self.stopAnimationLoop(obj)
    // })

    tween.start()

    // Start the animation loop.
    // let animationFrameID = requestAnimationFrame(doAnimate)

    // obj.set('rafId', animationFrameID)
    // obj.set('xpos', targetPosition)
    // obj.set('xtween', tween)  // save tween object for stopping it later.

    // function doAnimate () {
    //   // 注意：每次rAF调用，都会生成一个新的 rAF ID，所以这里每次都需要更新这个ID
    //   animationFrameID = requestAnimationFrame(doAnimate)
    //   // TODO 如何缩减掉这一步操作？？？
    //   obj.set('rafId', animationFrameID)

    //   TWEEN.update()
    // }
  }
}
