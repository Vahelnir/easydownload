const EventEmitter = require('events').EventEmitter
const StreamSpeed = require('streamspeed')

const Download = require('./Download')
const Queue = require('./Queue')

module.exports = class DownloadManager extends EventEmitter {

  constructor () {
    super()
    this._simultaneousDownloads = 1
    this._downloading = []
    this._queue = new Queue()
    this._error = []
    this._streamspeed = new StreamSpeed
    this._streamspeed.on('speed', (speed, avg) => this.emit('speed', speed, avg))
  }

  /**
   * Add a download to the queue
   * @param {string} url
   * @param {string} path
   * @param {string} [checksum]
   */
  addToQueue (url, path, checksum) {
    this._queue.push(new Download(url, path, checksum))
  }

  /**
   * Start the downloads
   */
  start () {
    this.emit('start')
    for (let i = 0; i < this._simultaneousDownloads; i++)
      this._next()
  }

  /**
   * Pauses the downloads
   */
  pause () {
    this._downloading.forEach(dl => dl.pause())
  }

  /**
   * Resumes the downloads
   */
  resume () {
    this._downloading.forEach(dl => dl.resume())
  }

  _next () {
    // If there are download left in queue
    if (this._queue.length > 0) {
      // We get one
      const dl = this._queue.poll()
      // And we push it into the downlaod list
      this._downloading.push(dl)

      // Then we add some events
      const processNext = dl => {
        this._downloading = this._downloading.filter((_, key) => key !== this._downloading.indexOf(dl))
        if (this._downloading.length > 0)
          this._next()
        else
          this.emit('finish')
      }
      dl.on('start', stream => {
        this._streamspeed.add(stream)
        this.emit('download_start', dl)
      })
      dl.on('finish', _ => {
        this.emit('download_finish', dl)
        processNext(dl)
      })
      dl.on('error', err => {
        this._error.push(dl)
        this.emit('download_error', err, dl)
        processNext(dl)
      })
      dl.start()
    }
  }

  set simultaneousDownloads (number) {
    this._simultaneousDownloads = number
  }

  get simultaneousDownloads () {
    return this._simultaneousDownloads
  }

}