const ROLEID = 1
export default class HelpmeService {
  constructor () {
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let hmStore = xdata.helpmeStore

    xbus.on('HELPME-REQ', (msg) => {
      let row = msg
      
      // 增加 name
      let obj = xdata.metaStore.getCardBindObjectInfo(row.obj_id)
      row.name = obj && obj.name ? obj.name : ''

      if (msg.status == 0) {
        if (!hmStore.helpbasic.has(row.obj_id) && xdata.roleID === ROLEID) {
          if (!hmStore.hms.has(row.obj_id)) { // 以左侧呼救列表为基准表的弹窗
            if (!hmStore.helpms.has(row.obj_id)) {
              hmStore.helpms.set(row.obj_id, row)
            }
          }
          
          if (!hmStore.hms.has(row.obj_id)) { // 左侧列表
            // save & inform to display list
            hmStore.hms.set(row.obj_id, row)
            xbus.trigger('HELPME-LIST-CHANGED')
    
            let msg1 = {
              cards: [row.obj_id],  // [cardid, ...]
              type: 'ALARM'     // ALARM, ...; default is null, means simple locating
            }
            window.cardStartLocating(msg1)
          }
          hmStore.helpbasic.set(row.obj_id, row) // 基准表
        }
  
        // if (!hmStore.hms.has(row.obj_id)) { // 左侧呼救列表为基准表
        //   if (!hmStore.hellpms.has(row.obj_id) && xdata.roleID === ROLEID) {
        //     hmStore.hellpms.set(row.obj_id, row)
        //   }
        // }
  
        // if (!hmStore.hms.has(row.obj_id) && xdata.roleID === ROLEID) {
        //   // save & inform to display list
        //   hmStore.hms.set(row.obj_id, row)
        //   xbus.trigger('HELPME-LIST-CHANGED')
  
        //   // inform to locating
        //   let msg1 = {
        //     cards: [row.obj_id],  // [cardid, ...]
        //     type: 'ALARM'     // ALARM, ...; default is null, means simple locating
        //   }
        //   // xbus.trigger('CARD-LOCATING-START', msg1)
        //   window.cardStartLocating(msg1)
        // }
      } else { // 前端给采集发送helpme_done后，采集才会推100，所以不用触发列表更新
        hmStore.helpbasic.delete(row.obj_id)
        // hmStore.hms.delete(row.obj_id) // 左侧列表
        // hmStore.helpms.delete(row.obj_id) // 呼救弹窗
      }   
    })

    xbus.on('HELPME-DONE', (msg) => {  // 取消本地呼救显示
      // console.log(msg)
      hmStore.hms.delete(msg.data.id) // 左侧列表
      hmStore.helpms.delete(msg.data.id) // 呼救弹窗
      let msg1 = {
        cards: [msg.data.id],  // [cardid, ...]
        type: 'HELP'     // ALARM, ...; default is null, means simple locating
      }
      window.cardStopLocating(msg1)
      xbus.trigger('HELPME-LIST-CHANGED')
    })
  }
}
