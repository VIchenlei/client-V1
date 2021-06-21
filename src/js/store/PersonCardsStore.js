export default class PersonCardsStore {
  constructor (gstore) {
    this.gstore = gstore
    this.personCards = new Map()
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this
    
    xbus.on('PERSON-CARDS', (msg) => {
      let eventID = parseInt(msg.event_id, 10)
    })
  }
}