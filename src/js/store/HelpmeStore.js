export default class HelpmeStore {
  constructor (gstore) {
    this.gstore = gstore

    this.hms = new Map() // 左侧呼救列表
    this.helpms = new Map() // 呼救弹窗
    this.helpbasic = new Map() // 呼救基础列表
  }
}
