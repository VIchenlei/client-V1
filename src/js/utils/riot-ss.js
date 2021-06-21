// https://github.com/rwu823/riot-ss
// import riot from 'riot'

riot.tag('ss', '<svg></svg>', function (opts) {
  let tag = this

  tag.on('mount', () => {
    let svgNS = 'http://www.w3.org/2000/svg'
    let use = document.createElementNS(svgNS, 'use')
    let svg = tag.root.querySelector('svg')

    use.setAttributeNS(
      'http://www.w3.org/1999/xlink', // xlink NS URI
      'href', // attribute (no 'xlink:')
      opts.link)

    if (opts.class) {
      svg.setAttribute('class', opts.class)
    }

    svg.appendChild(use)
    if (tag.root.parentNode) {
      tag.root.parentNode.replaceChild(svg, tag.root)
    }
  })
})
