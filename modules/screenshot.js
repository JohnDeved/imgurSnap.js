const {desktopCapturer} = require('electron')

/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 *
 * @param callback {Function} callback receives as first parameter the base64 string of the image
 * @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
 **/
module.exports = (callback, imageFormat) => {
  var _this = this
  this.callback = callback
  imageFormat = imageFormat || 'image/png'

  this.handleStream = (stream) => {
    // Create hidden video tag
    var video = document.createElement('video')
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'
    // Event connected to stream
    video.onloadedmetadata = function () {
      // Set video ORIGINAL height (screenshot)
      video.style.height = this.videoHeight + 'px' // videoHeight
      video.style.width = this.videoWidth + 'px' // videoWidth

      // Create canvas
      var canvas = document.createElement('canvas')
      canvas.width = this.videoWidth
      canvas.height = this.videoHeight
      var ctx = canvas.getContext('2d')
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      if (_this.callback) {
        // Save screenshot
        canvas.toBlob(_this.callback)
      } else {
        console.log('Need callback!')
      }

      // Remove hidden video tag
      video.remove()
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop()
      } catch (e) {}
    }
    video.src = URL.createObjectURL(stream)
    document.body.appendChild(video)
  }

  this.handleError = function (e) {
    console.error(e)
  }

  // Filter only screen type
  desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
    if (error) throw error
    // console.log(sources);

    console.log(sources)
    sources.forEach(src => {
      if (src.id === 'screen:0:0') {
        navigator.webkitGetUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: src.id,
              minWidth: 1280,
              maxWidth: 4000,
              minHeight: 720,
              maxHeight: 4000
            }
          }
        }, this.handleStream, this.handleError)
      }
    })
  })
}
