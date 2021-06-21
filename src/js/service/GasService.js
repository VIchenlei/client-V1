const ROLEID = 1
export default class GasService {
  constructor () {
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let gasStore = xdata.gasStore

    xbus.on('GAS-REQ', (msg) => {
      let row = msg
      let obj = xdata.metaStore.getCardBindObjectInfo(row.obj_id)
      row.name = obj && obj.name ? obj.name : ''
      if (msg.status == 0) {
        if (!gasStore.gasms.has(`${row.type_id}-${row.obj_id}`)) {
            gasStore.gasms.set(`${row.type_id}-${row.obj_id}`, row)
        }
      } else {
        gasStore.gasms.delete(`${row.type_id}-${row.obj_id}`)
      }
      xbus.trigger('GAS-LIST-CHANGED')
    })

    xbus.on('GAS-DONE', (msg) => { 
        gasStore.gasms.delete(msg.data.id)
        xbus.trigger('GAS-LIST-CHANGED')
    })
  }
}
