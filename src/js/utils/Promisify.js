// 将带回调的函数，包装成 Promise。
// http://fex.baidu.com/blog/2015/07/we-have-a-problem-with-promises/
module.exports = fn => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      args.push((err, result, ...other) => {
        err ? reject(err) : resolve(result, other)
      })
      fn(...args)
    })
  }
}
