let EventMixin = {
  // stop the event's propagation
  stopPropagation: (evt) => {
    // console.log('Mixin called.')
    evt.stopPropagation()
  }
}

export { EventMixin }
