export default class TrackStore {
  constructor (gstore) {
    this.gstore = gstore
    this.tracks = new Map() // key = cardID, value = {cardInfo: {xxx}, color: '#xxx', path: pathObject}
    this.beWatched = null
    // this.data = new Map()  // track data: map( cardID => [rec] )

    // this.registerGlobalEventHandlers()
  }

  // registerGlobalEventHandlers () {
  //   xbus.on('MAP-CARD-UPDATE', (msg) => {
  //     if (this.isTracking(msg.card.id)) {
  //       this.addHop(msg.card)
  //     }
  //   })
  // }

  // addHop (card) {
  //   this.data.get(card.id).push(card)
  // }

  // // Start a new track
  // newTrack (card) {
  //   let data = []
  //   data.push(card)
  //   this.data.set(card.id, data)
  // }

  // getData (cardID) {
  //   return this.data.get(cardID)  // an Array
  // }

  set (id, track) {
    this.tracks.set(id, track)
  }

  get (id) {
    return this.tracks.get(id)
  }

  getInArray () {
    return Array.from(this.tracks.values())
  }

  delete (id) {
    this.tracks.delete(id)
  }

  clear () {
    this.tracks.clear()
  }

  has (id) {
    return this.tracks.has(id)
  }

  isTracking (id) {
    return this.has(id)
  }
  isWatched (id) {
    return this.beWatched === id
  }
  getWatchedCard (id) {
    return this.beWatched
  }
  setWatchedCard (id) {
    this.beWatched = id
  }
}
