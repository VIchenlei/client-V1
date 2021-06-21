function getShowPoint (evt, tt) {
//   let tt = this.root
  let tbox = tt.getBoundingClientRect()  // tips 视区
  let mbox = tt.parentElement.getBoundingClientRect()  // 地图视区

          // 点击事件在地图视窗中的坐标(ex, ey)
  let ex = evt.pixel ? evt.pixel[0] : evt.clientX
  let ey = evt.pixel ? evt.pixel[1] : evt.clientY - 40 //div 时减去 head-nav高度

  let offset = 5
  let px = 0
  let py = 0
  if (mbox.width - ex > tbox.width) { // 当点击点右边空间足够时，显示在点击点的右边
    px = ex + offset
  } else if (ex > tbox.width) { // 当点击点左边空间足够时，显示在点击点的左边
    px = ex - tbox.width - offset
  } else { // 居中显示
    px = (mbox.width - tbox.width) / 2
  }

  if (mbox.height - ey > tbox.height) { // 当点击点下边空间足够时，显示在点击点的下边
    py = ey + offset
  } else if (ey > tbox.width) { // 当点击点上边空间足够时，显示在点击点的上边
    py = ey - tbox.height - offset
  } else {  // 居中显示
    py = (mbox.height - tbox.height) / 2
  }

  return {
    x: px,
    y: py
  }
}

export { getShowPoint }
