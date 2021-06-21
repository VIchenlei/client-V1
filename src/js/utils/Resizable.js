function Resizable (msg) {
  let dragMinWidth = 250
  let dragMinHeight = 124

  init(msg)
        /*
            msg={
                target,
                LHandle,
                RHandle,
                THandle,
                BHandle,
                LTHandle,
                TRHandle,
                BRHandle,
                LBHandle
            }
        */
  function init (msg) {
    var oDrag = msg.target
    console.log(oDrag)

    var oL = msg.LHandle
    var oT = msg.THandle
    var oR = msg.RHandle
    var oB = msg.BHandle
    var oLT = msg.LTHandle
    var oTR = msg.TRHandle
    var oBR = msg.BRHandle
    var oLB = msg.LBHandle

        // 四角
    resize(oDrag, oLT, true, true, false, false)
    resize(oDrag, oTR, false, true, false, false)
    resize(oDrag, oBR, false, false, false, false)
    resize(oDrag, oLB, true, false, false, false)

        // 四边
    resize(oDrag, oL, true, false, false, true)
    resize(oDrag, oT, false, true, true, false)
    resize(oDrag, oR, false, false, false, true)
    resize(oDrag, oB, false, false, true, false)
  }

  function resize (oParent, handle, isLeft, isTop, lockX, lockY) {
    handle.onmousedown = function (evt) {
      let event = evt || window.event
      let disX = event.clientX - handle.offsetLeft
      let disY = event.clientY - handle.offsetTop
      let iParentTop = oParent.offsetTop
      let iParentLeft = oParent.offsetLeft
      let iParentWidth = oParent.offsetWidth
      let iParentHeight = oParent.offsetHeight

      document.onmousemove = function (evt) {
        let event = evt || window.event

        let iL = event.clientX - disX
        let iT = event.clientY - disY
        let maxW = document.documentElement.clientWidth - oParent.offsetLeft - 2
        let maxH = document.documentElement.clientHeight - oParent.offsetTop - 2
        let iW = isLeft ? iParentWidth - iL : handle.offsetWidth + iL
        let iH = isTop ? iParentHeight - iT : handle.offsetHeight + iT

        isLeft && (oParent.style.left = iParentLeft + iL + 'px')
        isTop && (oParent.style.top = iParentTop + iT + 'px')

        iW < dragMinWidth && (iW = dragMinWidth)
        iW > maxW && (iW = maxW)
        lockX || (oParent.style.width = iW + 'px')

        iH < dragMinHeight && (iH = dragMinHeight)
        iH > maxH && (iH = maxH)
        lockY || (oParent.style.height = iH + 'px')

        if ((isLeft && iW === dragMinWidth) || (isTop && iH === dragMinHeight)) document.onmousemove = null

        return false
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
      return false
    }
  }
}

export default Resizable
