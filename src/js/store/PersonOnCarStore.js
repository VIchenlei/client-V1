export default class PersonOnCarStore {
  constructor () {
    this.personOnCarSum = new Map()// 总数
    this.personOnCarDetail = new Map()// 人上车详情
    this.presonOutCar = new Map()// 下车人员
    this.personOnCar = new Map()// 上车人员

    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    xbus.on('PERSON-ON-CAR', (data) => {
      // this.setDefineValue()
      this.dealData(data)
      xbus.trigger('PERSON-ONCAR-UPDARE')
    })

    xbus.on('RESP-PERSON-ONCAR', (data) => { // 登录时
      this.setDefineValue()
      let datas = data[1]
      this.dealData(datas)
      xbus.trigger('PERSON-ONCAR-UPDARE')
    })
  }

  setDefineValue () {
    this.personOnCarSum.clear()
    this.personOnCarDetail.clear()
    this.personOnCar.clear()
    this.presonOutCar.clear()
  }

  dealData (datas) {
    if (datas && datas.length > 0) {
      for (let i = 0, len = datas.length; i < len; i++) {
        let data = datas[i]
        let vehicleCareID = `002${data[0].toString().padStart(10, 0)}`
        let sum = data[1]
        if (sum === 0) {
          this.personOnCarSum.delete(vehicleCareID)
          this.personOnCarDetail.delete(vehicleCareID)
        } else {
          this.personOnCarSum.set(vehicleCareID, sum)
          let personOnCarDetail = []
          data.map((item, index) => {
            if (index > 1) {
              let arr = null
              let staffCardID = `001${item.toString().padStart(10, 0)}`
              let obj = xdata.metaStore.getCardBindObjectInfo(staffCardID)
              if (obj) {
                let deptName = xdata.metaStore.getNameByID('dept_id', obj.dept_id)
                arr = [obj.staff_id, obj.name, staffCardID, deptName]
              } else {
                arr = ['', '', staffCardID, '']
              }
              personOnCarDetail.push(arr) 
            }
          })
          this.personOnCarDetail.set(vehicleCareID, personOnCarDetail)
        }
      }
    }
  }
}
