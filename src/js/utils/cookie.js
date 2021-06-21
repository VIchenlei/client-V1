
// /**
//  * set cookie
//  */
// function setCookie (name, value) {
//   var Days = 30
//   var exp = new Date()
//   exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
//   document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString()
// }

function setCookie (name, value, time) {
  if (!time) {
    time = 'd30'  // default expired time is 30 days
  }

  let sec = getsec(time)
  let exp = new Date()
  exp.setTime(exp.getTime() + sec * 1)
  document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString()
}

/*
 * 示例：
 * s20是代表20秒
 * h是指小时，如12小时则是：h12
 * d是天数，30天则：d30
 */
function getsec (str) {
  let ret = 0
  let value = str.substring(1, str.length) * 1
  let label = str.substring(0, 1)
  switch (label) {
    case 's':
      ret = value * 1000
      break
    case 'h':
      ret = value * 60 * 60 * 1000
      break
    case 'd':
      ret = value * 24 * 60 * 60 * 1000
      break
    default:
      console.warn('UNKNOWN time label')
      break
  }

  return ret
}

/**
 * get cookie
 */
function getCookie (name) {
  let ret = null
  let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  let arr = document.cookie.match(reg)
  if (arr) {
    ret = unescape(arr[2])
  }
  return ret
}

/**
 * delete cookie
 */
function delCookie (name) {
  var exp = new Date()
  exp.setTime(exp.getTime() - 1)
  var cval = getCookie(name)
  if (cval !== null) {
    document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString()
  }
}

export { setCookie, getCookie, delCookie }
