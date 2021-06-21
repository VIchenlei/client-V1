export default class PtrolStore {
  constructor () {
    this.paths = new Map() // key = cardID, value = {cardInfo: {xxx}, color: '#xxx', path: pathObject}
  }
  set (id, data) {
    this.paths.set(id, data)
  }

  get (id) {
    return this.paths.get(id)
  }

  delete (id) {
    this.paths.delete(id)
  }

  clear () {
    this.paths.clear()
  }
}
