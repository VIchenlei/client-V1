/**
 * 定位列表
 */
export default class LocateStore {
  constructor (gstore) {
    this.gstore = gstore
    this.locates = new Map() // key = cardID, value = true|false
    this.locateLandmark = new Map() // key = cardID, value = true|false
    this.locateAreas = new Map()
    this.locatevehicle = new Map()
    this.locatestaff = new Map()
    this.localReader = new Map()
  }

  set (id, locate) {
    this.locates.set(id, locate)
  }

  get (id) {
    return this.locates.get(id)
  }

  getInArray () {
    return Array.from(this.locates.keys())
  }

  getInArrayVehicle () {
    return Array.from(this.locatevehicle.keys())
  }

  getInArrayStaff () {
    return Array.from(this.locatestaff.keys())
  }

  delete (id) {
    this.locates.delete(id)
  }

  clear () {
    this.locates.clear()
  }

  has (id) {
    return this.locates.has(id)
  }

  isLocating (id) {
    return this.has(id)
  }

  reset () {
    this.locates.clear()
    this.locatestaff.clear()
    this.locatevehicle.clear()
    this.locateLandmark.clear()
    this.localReader.clear()
  }
}
