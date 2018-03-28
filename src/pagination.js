import EventEmitter from 'eventemitter3'
import insertCss from 'insert-css'
import loadCssFile from 'load-css-file'
import query from 'component-query'
import closest from 'component-closest'
import matches from 'component-matches-selector'
import stylesheet from './stylesheet.css'

const ICONFONT_CSS_URL = '//at.alicdn.com/t/font_609086_tain7fbkcmzpvi.css'

export function install (hook, vm) {
  let bus = new EventEmitter()

  hook.init(function () {
    css()
  })

  hook.afterEach(function (html, next) {
    bus.once('done', () => {
      next(render(html, pagination(vm)))
    })
  })

  hook.doneEach(function() {
    bus.emit('done')
  })
}

function toArray (elements) {
  return Array.prototype.slice.call(elements)
}
function findHyperlink (li) {
  return toArray(li.children).find((child) => child.tagName && child.tagName.toUpperCase() === 'A')
}

function pagination (vm) {
  try {
    const path = vm.route.path
    const all = toArray(query.all('.sidebar li a')).filter((element) => !matches(element, '.section-link'))
    const active = all.find((item) => item.getAttribute('href') === `#${path}`)
    const group = toArray((closest(active, 'ul') || {}).children)
      .filter((element) => element.tagName.toUpperCase() === 'LI')
    const index = group.findIndex((item) => {
      const hyperlink = findHyperlink(item)
      return hyperlink && hyperlink.getAttribute('href') === `#${path}`
    })
    return {
      prev: new Link(group[index - 1]).toJSON(),
      next: new Link(group[index + 1]).toJSON(),
    }
  } catch (error) {
    return {}
  }
}

class Link {
  constructor (element) {
    if (!element) {
      return
    }
    this.hyperlink = findHyperlink(element)
  }
  toJSON () {
    if (!this.hyperlink) {
      return
    }
    return {
      name: this.hyperlink.innerText,
      href: this.hyperlink.getAttribute('href'),
    }
  }
}

function render (html, data) {
  const template = [
    '<div class="pagination">',
    '<div class="pagination-item pagination-item--previous">',
    data.prev && `<div class="pagination-item-label"><i class="iconfont-docsify-pagination icon-previous"></i>上一章节</div><div class="pagination-item-title"><a href="${data.prev.href}">${data.prev.name}</a></div>`,
    '</div>',
    '<div class="pagination-item pagination-item--next">',
    data.next && `<div class="pagination-item-label"><i class="iconfont-docsify-pagination icon-next"></i>下一章节</div><div class="pagination-item-title"><a href="${data.next.href}">${data.next.name}</a></div>`,
    '</div>',
    '</div>',
  ].filter(Boolean).join('')
  return html + template
}

function css () {
  insertCss(stylesheet)
  loadCssFile(ICONFONT_CSS_URL)
}
