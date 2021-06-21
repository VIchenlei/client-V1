import TWEEN from '@tweenjs/tween.js'

// // 为避免车辆因为误差而频繁掉头，设置最大容忍距离和角度
// // TODO 人不能实施该处理
// const MAX_BACKOFF_OFFSET = 5
// const MAX_BACKOFF_ANGLE = Math.PI - Math.PI / 18  // 170 度的弧度

export default class OlMapAnimator {
  constructor (map) {
    this.map = map
  }

  /**
   * 在地图上，将 obj、pObj 移动到 pos 位置
   * @param {*} obj OpenLayers 对象
   * @param {*} pObj OpenLayers Overlay对象
   * @param {*} pos 坐标[x,y]
   * @return {*} 坐标
   */
  moveto (obj, pObj, pos) {
    let geometry = obj && obj.getGeometry()
    pObj && pObj.setPosition(pos)
    geometry && geometry.setCoordinates(pos)
  }

  /**
   *  停止 obj 上的动画循环
   * @param {*} obj
   * @return 是否中断
   */
  stopAnimationLoop (obj) {
    let ret = false
    let preRaf = obj && obj.get('rafId')
    if (preRaf && parseInt(preRaf, 10) > 0) {
      // 取消队列中的 animation frame，就不会执行 doAnimate()，相当于中断了 animation loop。
      cancelAnimationFrame(preRaf)
      if (obj) obj.getProperties()['rafId'] = null
      obj.set('rafId', null)

      ret = true
    }

    return ret
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
  getStartPosition (obj, positionObj) {
    let startPosition = this.stopPreviewAnimation(obj, positionObj)
    if (!startPosition) {
      let geometry = obj.getGeometry()
      startPosition = geometry && geometry.getCoordinates()
    }

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
  rotateIcon (msg, x, y, startPosition) {
    // icon.transform.baseVal.clear()
    if(!startPosition) return
    let feature = msg.group
    // feature.setStyle(this.initFeature(0))

    let startx = startPosition[0]
    let starty = startPosition[1]
    let dx = x - startx
    let dy = starty - y

    let angle = this.getAngle(dx, dy)

    let style = feature && feature.getStyle()
    let img = style && style.getImage()

    if (img) {
    // 如果是小范围内移动（delta<1）且旋转角度（ >= 90度 | PI/2），则忽略旋转
     let previewAngle = img.getRotation()
     let da = Math.abs(previewAngle - angle)
     if (!(da >= Math.PI / 9 && Math.abs(dx) < 1 && Math.abs(dy) < 1)) {
       img.setRotation(angle)
     }
    }

    // // 如果角度在 170~180之间，且移动距离很短（<MAX_BACKOFF_OFFSET），则忽略旋转
    // // TODO 这里的角度，是与 x 轴的夹角，所以需要计算本次与上次角度之差才对？？？
    // if (!(angle > MAX_BACKOFF_ANGLE && angle <= Math.PI && dx < MAX_BACKOFF_OFFSET && dy < MAX_BACKOFF_OFFSET)) { // 小幅度偏移内，如果是旋转 180 度，忽略
    //   // 转换为弧度

    //   let style = feature && feature.getStyle()
    //   let img = style && feature.getImage()
    //   img && img.setRotation(angle)
    // }

    return feature
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
    if(!obj) {
      console.log("Animate object is NULL")
      return
    }
    let positionObj = msg.positionLay

    let startPosition = this.getStartPosition(obj, positionObj)
    if (!startPosition) return
    if (x === startPosition[0] && y === startPosition[1]) {
      // Not change the position, NO need animation
      return
    }

    let subtype = obj.getProperties()['data-subtype']
    let dataType = obj.getProperties()['vehicle_type_id']
    if (subtype !== 'staff' && dataType !== 25 && dataType !== 26) { // 人员、掘进机、采煤机不旋转
      obj = this.rotateIcon(msg, x, y, startPosition)
    }

    let targetPosition = [x, y]
    // TODO:
    // 1. 不需要每次都新建 TWEEN 对象，在首次动画时新建 Tween 对象，然后保存起来，后续可以重用
    // 2. 如果每次让动画播放完（即不主动中断动画，则不需要每次设置 startPosition
    let tween = new TWEEN.Tween(startPosition).to(targetPosition, duration)

    tween.onUpdate(function () {
      self.moveto(obj, positionObj, startPosition)
      // console.log(`x: ${this.x}, y:${this.y}`)
    })

    tween.onComplete(function () {
      // 如果是调用 tween.stop() 中断动画, 则不会触发 tween.onCompplete()
      self.stopAnimationLoop(obj)
    })

    tween.start()

    // Start the animation loop.
    let animationFrameID = requestAnimationFrame(doAnimate)

    obj.set('rafId', animationFrameID)
    obj.getProperties()['rafId'] = animationFrameID
    obj.set('xpos', targetPosition)
    obj.set('xtween', tween)  // save tween object for stopping it later.

    function doAnimate () {
      // 注意：每次rAF调用，都会生成一个新的 rAF ID，所以这里每次都需要更新这个ID
      animationFrameID = requestAnimationFrame(doAnimate)
      // TODO: 如何缩减掉这一步操作？？？
      // 方案：
      // 1. 如果需要中断当前动画，则设置一个标识，在目标对象的下一次动画帧启动之前，判断是否需要中断动画，如果需要，则把对象移动到目标位置，且不再启动新的动画帧，
      // 2. 让本次动画完成，然后再 tween.onComplete 中启动下一次动画（如果有的话）；
      if (obj) obj.getProperties()['rafId'] = animationFrameID
      obj && obj.set('rafId', animationFrameID)

      TWEEN.update()
    }
  }
}
