window.$ = require('jquery')

const {remote} = require('electron')
const blobToBuffer = require('blob-to-buffer')
const jimp = require('jimp')

const screenshot = require('../modules/screenshot')
const main = remote.require('./main.js')
const win = remote.getCurrentWindow()

class Selector {
  constructor () {
    this.x = {}
    this.y = {}
  }

  mouseDown (e) {
    this.div.hidden = 0 // Unhide the div
    this.x[1] = e.clientX // Set the initial X
    this.y[1] = e.clientY // Set the initial Y
    this.calc()
  }

  mouseMove (e) {
    this.x[2] = e.clientX // Update the current position X
    this.y[2] = e.clientY // Update the current position Y
    this.calc()
  }

  mouseUp (e) {
    $('.container').css('cursor', 'none')
    this.div.hidden = 1 // Hide the div
    this.x[0] = this.x[3]
    this.y[0] = this.y[3]
    this.width = this.x[4] - this.x[3]
    this.height = this.y[4] - this.y[3]
    this.takeshot()
  }

  calc (x, y) {
    this.x[3] = Math.min(this.x[1], this.x[2]) // Smaller X
    this.y[3] = Math.min(this.y[1], this.y[2]) // Smaller Y
    this.x[4] = Math.max(this.x[1], this.x[2]) // Larger X
    this.y[4] = Math.max(this.y[1], this.y[2]) // Larger Y

    this.draw()
  }

  draw () {
    this.div.style.left = this.x[3] + 'px'
    this.div.style.top = this.y[3] + 'px'
    this.div.style.width = this.x[4] - this.x[3] + 'px'
    this.div.style.height = this.y[4] - this.y[3] + 'px'
  }

  takeshot () {
    screenshot(img => {
      win.setIgnoreMouseEvents(true)
      $('.container').css('cursor', 'crosshair')
      blobToBuffer(img, (err, buffer) => {
        if (err) console.error(err)
        jimp.read(buffer, (err, img) => {
          if (err) console.errror(err)
          img.crop(this.x[0], this.y[0], this.width, this.height)
            .write('test.png')
            .getBuffer(jimp.AUTO, (err, buffer) => {
              if (err) console.error(err)
              main.uploadImgur(buffer)
            })
        })
      })
    })
  }

  init (div) {
    this.div = div
  }
}

let select = $('.selection')[0]
window.selector = new Selector()
window.selector.init(select)
window.onmousedown = e => window.selector.mouseDown(e)
window.onmousemove = e => window.selector.mouseMove(e)
window.onmouseup = e => window.selector.mouseUp(e)
window.onkeydown = e => {
  if (e.keyCode === 27) {
    win.setIgnoreMouseEvents(true)
  }
}
