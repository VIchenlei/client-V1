//  输入框错误提示 2019-05-20 10:10 chenl
function illegalInput (self, inputname, text) {
  self.refs[inputname + 'tips'].innerHTML = text
  self.illegal = true
}

// 输入框输入正确内容 错误提示为空  2019-05-20 10:50 chenl
function unIllegal (self, checkNode, value, inputname) {
  self.refs[inputname + 'tips'].innerHTML = ''
  self.parent.hideFill(checkNode, value, self)
  self.illegal = false
}

export { illegalInput, unIllegal }