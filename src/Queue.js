module.exports = class Queue {
  constructor () {
    this._queue = []
  }

  push (value) {
    this._queue.push(value)
  }

  peek() {
    return this._queue[this._queue.length]
  }

  poll() {
    return this._queue.pop()
  }

  get length() {
    return this._queue.length
  }

}