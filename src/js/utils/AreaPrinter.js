/**
 * How to use:
 * HTML:
 *     <div id="AreaToBePrinted"> ... </div>
 * JS:
 *     new AreaPrinter('AreaToBePrinted').print()
 */

// import PDFKit from 'pdfkit'

// function AreaPrinter (id, title, labels, names, rows, types, def, blockedIndex) {
//   this.id = id
//   this.title = title || ' '
//   this.rept_title = this.title
//   this.labels = labels
//   this.names = names
//   for (let i = 0; i < rows.length; i++) {
//     let j = 0
//     for (let item in names) {
//       let name = names[item]
//       if (id === 'call-list' ? name !== 'device_type_id' : !blockedIndex.includes(j)) {
//         rows[i][name] = name === names[def.keyIndex] ? rows[i][name] : xdata.metaStore.formatField(name, rows[i][name], types[names.indexOf(name)])
//       }
//       j++
//     }
//   }
//   this.blockedIndex = blockedIndex
//   this.rows = rows
// }

function AreaPrinter (title, content) {
  this.title = title
  this.content = content
}

AreaPrinter.prototype = {
  get_head: function () {
    let html = '<head>'

    // links = document.getElementsByTagName('link'),
    // link

    // if (links.length > 0) {
    //     for (let i = 0; i < links.length; ++i) {
    //         link = links[i]
    //         if (link.rel && link.rel.toLowerCase() == 'stylesheet' && link.media && link.media.toLowerCase() == 'print') {
    //             html += '<link type="text/css" rel="stylesheet" href="' + link.href + '" media="print">'
    //         }
    //     }
    // }

    html += `<title>${this.title}</title>`
    // html += '<link type="text/css" rel="stylesheet" href="/css/lprint.css" media="print">'

    return html + '</head>'
  },

  // get_body: function () {
  //   let self = this
  //   let el = document.getElementById(self.id)
  //   let labels = self.labels
  //   let names = self.names
  //   let rows = self.rows
  //   let tableStr = null
  //   let labelStr = null
  //   let rowStr = null
  //   let rowData = null
  //   for (let i = 0; i < labels.length; i++) {
  //     if (!this.blockedIndex.includes(i)) {
  //       if (i === 0) {
  //         labelStr = '<th>' + labels[i] + '</th>'
  //       } else {
  //         labelStr += '<th>' + labels[i] + '</th>'
  //       }
  //     }
  //   }
  //   tableStr = '<table><thead><tr>' + labelStr + '</tr></thead>'
  //   for (let j = 0; j < rows.length; j++) {
  //     let row = rows[j]
  //     if (j === 0) {
  //       rowStr = '<tr>'
  //     } else {
  //       rowStr += '<tr>'
  //     }
  //     for (let k = 0; k < labels.length; k++) {
  //       if (!this.blockedIndex.includes(k)) {
  //         rowData = `${(names[k] === 'lastUpdate') ? new Date(row[ names[k] ]).format('yyyy-MM-dd hh:mm:ss') : row[ names[k] ]}`
  //         rowStr += '<td>' + rowData + '</td>'
  //       }
  //     }
  //     rowStr += '</tr>'
  //   }
  //   rowStr = rowStr === null ? '当前系统中没有相关标识卡记录，请联系系统管理员确认后再试。' : rowStr
  //   tableStr += '<tbody>' + rowStr + '</tbody></table>'
  //   console.log(tableStr)
  //   return `
  //           <body onload="focus(); print();">
  //               <div style="text-align:center"><h1>${self.rept_title}</h1></div>
  //               <div id="${self.id}" class="${el.className || ''}" style="${el.style.cssText || ''}">
  //                 ${tableStr}
  //               </div>
  //           </body>
  //           `
  // },

  build_iframe: function () {
    let ifrm
    try {
      ifrm = document.createElement('iframe')
      document.body.appendChild(ifrm)
      ifrm.style.cssText = 'border:0;position:absolute;width:0px;height:0px;left:0px;top:0px;'
      ifrm.src = 'about:blank'
      ifrm.doc = ifrm.contentDocument ? ifrm.contentDocument : (ifrm.contentWindow ? ifrm.contentWindow.document : ifrm.document)
    } catch (err) {
      throw err + '. iframe may not be supported in this browser.'  // eslint-disable-line
    }

    if (!ifrm.doc) {
      throw 'Cannot find document.'  // eslint-disable-line
    }

    return ifrm
  },

  print: function () {
    let self = this
    let f = self.build_iframe()
    let html = `<!DOCTYPE html><html>${self.get_head()}${self.content}</html>`
    f.doc.open()
    f.doc.write(html)
    f.doc.close()

  // DO NOT remove the f node
  // f.parentNode.removeChild(f)
  }
  /*
  toPDF: function () {
    let self = this
    let html = `<!DOCTYPE html><html>${self.get_head()}${self.get_body()}</html>`
    let pdf = new PDFKit('html', html)

    pdf.toFile(`${self.rept_title}_${new Date().format('yyyy-MM-dd hh:mm:ss')}.pdf`, function (err, file) {
      console.log('File ' + file + ' written')
    })
  }
  */
}

export default AreaPrinter
