import { drawSymbol } from './CeMapUtils.js'
import { workFace } from './OlMapUtils.js'
import { SYMBOL_TYPE } from './Symbol.js'
import { CARD } from '../def/state.js'
import LocateService from '../service/LocateService.js'

const MONKEYID = 7
const STATICID = 0
export default class CeMapCardLayer {
  constructor (workspace) {
    this.workspace = workspace
    this.map = workspace.map
    this.groups = new Map()
    this.mapType = '3DGIS'
    this.ls = new LocateService(this)
    this.registerGlobalEventHandlers()
  }

  registerGlobalEventHandlers () {
    let self = this

    let posdata = []

    xbus.on('MAP-CARD-UPDATE', (msg) => {
      self.drawCard(msg, posdata)
    })

    let handler = self.map.screenSpaceEventHandler
    handler.setInputAction(function (evt) {
      let pickedPrimitive = self.map.scene.pick(evt.position)
      let pickedEntity = Cesium.defined(pickedPrimitive) ? pickedPrimitive.id : undefined
      if (Cesium.defined(pickedEntity) && !pickedEntity.type) {
        self.showTips(evt, pickedEntity)
      }

      if (Cesium.defined(pickedEntity) && pickedEntity.type && pickedEntity.type === 'pos') {
        let msg
        switch (pickedEntity.id) {
          case 'gucheng_pos':
            msg = {
              lon: 0.05,
              lat: 0.005,
              height: 10000
            }

            xbus.trigger('space_pos', msg)
            break
          case 'wangzhuang_pos':
            msg = {
              lon: 0.05,
              lat: 0.005,
              height: 10000
            }

            xbus.trigger('space_pos', msg)
            break
          case 'gaohe_pos':
            msg = {
              lon: 0.05,
              lat: -0.035,
              height: 1500
            }
            xbus.trigger('space_pos', msg)
            break
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  showTips (evt, pickedEntity) {
    if (pickedEntity.properties) {
      let attrs = pickedEntity.properties.getValue()
      let id = attrs['data-id']
      // let type = t.getAttribute('data-type') // card or device
      let subtype = attrs['data-subtype'] // staff or vehicle; reader or traffic or etc.

      let cardCurrentState = xdata.cardStore.getLastState(id)
      let cardStateDef = xdata.cardStore.stateDefs[subtype]
      evt.pixel = [evt.position.x, evt.position.y]
      let msg = {
        id: id,
        cardtype: subtype,
        event: evt,
        // ??????????????????????????? tooltips ???????????????????????????????????????
        state: { // ????????????
          def: cardStateDef,
          rec: cardCurrentState
        },
        info: { // TODO ???????????????????????? card_type_id ??????????????? vechicle ?????? staff ???
          def: xdata.cardStore.getInfoDef(subtype),
          rec: xdata.cardStore.getInfo(id, subtype)
        },
        curTitleType: 'MONITOR'
      }
      window.cardtips.show(msg)
    }
  }

  // ?????????????????????
  drawCard (msg, posdata) {
    let cmd = msg.cmd
    let card = msg.card
    let cardID = card[CARD.card_id]
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    let group = this.getEntity(cardID, cardTypeName)
    let state = card[CARD.state_object]
    switch (cmd) {
      case 'POSITION':
      case 'DOWNMINE':
        if (group) {
          this.judgePreCardState(card, group, cardTypeName)
          if(cardTypeName === 'staff'){
            this.judgePreCardMonkeyOrStatic(card, group, state)
          }
          this.cardAnimation(cardID, group, card)
        } else {
          group = this.drawCardOn(card, 'card-add')
          this.groups.set(cardID, group)
        }
        break
      case 'SPECIAL': // ????????? ???label
        if (group) {
          this.judgePreCardState(card, group, cardTypeName)
          this.cardAnimation(cardID, group, card)
        } else {
          group = this.drawCardOn(card, 'card-add', 'special')
          this.groups.set(cardID, group)
        }
        break
      case 'UPMINE':
        this.deleteCardFrom(cardID)
        break
      case 'UNCOVER': // ????????? ?????????
        if (group) {
          console.log('ENTER UNCOVER ZONE')
        }
        break
      case 'NOSIGNAL': // ??????????????????
        if (!group) {
          group = this.drawCardOn(card, 'card-add', 'nosignal')
          this.groups.set(cardID, group)
        }
        break
      default:
        console.warn(`???????????????????????? ${msg.cmd}`)
    }

    return group
  }

  /**
   *
   * @param {*} cardID
   * @param {*} cardTypeName
   */
  getEntity (cardID, cardTypeName) {
    let entity = this.map.entities.getById(cardID)
    return entity
  }

  /**
   *
   */
  cardAnimation (cardID, group, card) {
    let msg = {
      group: group
    }
    this.workspace.doAnimate({msg: msg, x: card[CARD.x], y: -card[CARD.y]})
  }

  /**
   * ???card ?????????????????????
   * @param {*} card
   * @param {*} className
   * @param {*} type
   */
  drawCardOn (card, className, type) {
    let cardID = card[CARD.card_id]
    let areaID = card[CARD.area_id]
    let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
    let cardBindObj = xdata.metaStore.getCardBindObjectInfo(cardID)
    if (!cardBindObj) {
      console.warn(`???????????????????????? ${cardID} ????????????????????? ${cardTypeName}`)
      type = 'unregistered'
    } else {
      let ishide = workFace({
        'data-id': cardID
      })
      if (ishide === 'hidecard') {
        type = 'hidecard'
      }
    }
    let objectID = card[CARD.object_id]
    let attrs = {
      'card': card,
      'data-id': cardID,
      'data-number': objectID,
      'data-type': SYMBOL_TYPE.CARD,
      'data-subtype': cardTypeName,
      'card-speed': card[CARD.speed],
      'card_area': areaID,
      'card_state': card[CARD.state_object],
      x: card[CARD.x],
      y: card[CARD.y],
      type: type,
      class: `icon-card circle-effect ${className}`
    }

    return drawSymbol(attrs, this.map, type)
  }

  judgePreCardState (card, group, cardTypeName) {
    if (cardTypeName === 'vehicle') {
      let newText = card[2] + '|' + card[CARD.speed] + 'Km/h'
      group.label.text = newText
    }
  }

  /**????????????????????????????????????????????????????????????
   * @method judgePreCardMonky
   */
  judgePreCardMonkeyOrStatic(card, group, state){
    let preState = Number(group.properties.getValue()['card_state'])
    let cardID = card[CARD.card_id]
    if ((state === MONKEYID && preState !== MONKEYID) || (state !== MONKEYID && preState === MONKEYID)) {
      this.map.entities.remove(group)
      group = this.drawCardOn(card, 'card-add')
      this.groups.set(cardID, group)
    }
    if((state === STATICID && preState !== STATICID) || (state !== STATICID && preState === STATICID )){
      this.map.entities.remove(group)
      group = this.drawCardOn(card, 'card-add')
      this.groups.set(cardID, group)
    }
    
  }
}
