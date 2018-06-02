const {dirname} = require('path')
const fs = require('fs')
const EventEmitter = require('events').EventEmitter

const fetch = require('node-fetch')
const md5File = require('md5-file/promise')
const mkdirp = require('mkdirp')

const STATES = {
  DESTROYED: -3,
  STOPPED: -2,
  ERROR: -1,
  STANDBY: 0,
  STARTED: 1,
  PAUSED: 2,
  RETRYING: 3,
  FINISHED: 4
}

class Download extends EventEmitter {
  constructor (url, path, checksum) {
    super()
    this._url = url
    this._path = path
    this._state = STATES.STANDBY
    this._checksum = checksum
    this._options = {
      maxRetries: 5,
      retryInterval: 2000
    }
    this._retryCount = 0
    this._error = ''
    this._fileSize = 0
    this._bytesDownloaded = 0
    this._fileStream = null
    this._readStream = null
  }

  start () {
    // Creating the path directories if needed
    mkdirp(dirname(this._path), err => {
      if (!err)
        this._download()
      else
        this._retry(err)
    })
  }

  pause () {
    if (this.state === STATES.STARTED) {
      this._readStream.pause()
      this.state = STATES.PAUSED
      this.emit('paused')
    }
  }

  resume () {
    if (this.state === STATES.PAUSED) {
      this._readStream.resume()
      this.state = STATES.STARTED
      this.emit('resume')
    }
  }

  stop () {
    this._fileStream.close()
    this.state = STATES.STOPPED
    this.emit('stop')
  }

  async destroy () {
    this.stop()
    this.state = STATES.DESTROYED
    this.emit('destroy')
    return new Promise((resolve, reject) =>
      fs.unlink(this._path, err => err ? reject(err) : resolve())
    )
  }

  set state (state) {
    this.emit('state_change', state)
    this._state = state
  }

  _download () {
    // Creating the file stream
    // Getting the data from the http server
    // and piping it into the stream
    fetch(this._url)
      .then(res => {
        this._fileStream = fs.createWriteStream(this._path)
        res.body.pipe(this._fileStream)
        this.state = STATES.STARTED
        this._readStream = res.body
        this.emit('start', res.body)

        res.body.on('data', chunk => {
          this._bytesDownloaded += chunk.length
          this.emit('data', chunk)
        })

        // Saving the file's size
        this._fileSize = res.headers.get('Content-Length')

        const errCb = err => this._retry(err)

        res.body.on('error', errCb)
        this._fileStream.on('error', errCb)

        // when it finishes, closing the stream
        this._fileStream.on('finish', async _ => {
          this._readStream.destroy()
          this._fileStream.destroy()
          if (this._checksum.length > 0 && !await this._checkFile()) {
            return this._retry('File is corrupted')
          }
          this.state = STATES.FINISHED
          this.emit('finish')
        })
      })
  }

  async _checkFile () {
    try {
      const hash = await md5File(this._path)
      return hash === this._checksum
    } catch (err) {
      return false
    }
  }

  _retry (err) {
    // If the retry counter < maxRetries
    if (this._retryCount < this._options.maxRetries) {
      // Then we retry to download it after {retryInterval} seconds
      this._retryCount += 1
      this.emit('state_change', 2)
      this.emit('retry', err)
      setTimeout(_ => this.start(), this._options.retryInterval)
    } else {
      // If the retry counter exceed the max retries
      // then we change its state to ERROR with the error message
      this.state = STATES.ERROR
      this._error = err
      this.emit('error', err)
    }
  }

  get url () {
    return this._path
  }

  get path () {
    return this._path
  }

  get state () {
    return this._state
  }

  get bytesDownloaded () {
    return this._bytesDownloaded
  }

  get fileSize () {
    return this._fileSize
  }

  get readStream () {
    return this._readStream
  }

  get stream () {
    return this._fileStream
  }

  get error () {
    return this._error
  }

}

Download.STATES = STATES
module.exports = Download
