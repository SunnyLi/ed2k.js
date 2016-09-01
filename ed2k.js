const MD4 = require('js-md4')

class ED2K {
  constructor () {
    this.name = ''
    this.size = 0
    this.hash = ''
  }

  toString () {
    return `ed2k://|file|${encodeURIComponent(this.name)}|${this.size}|${this.hash}|/`
  }
}

const ED2K_CHUNK_SIZE = 9728000

class Hasher {
  constructor () {
    this.ed2k = new ED2K()
    this.hasher = MD4.create()
    this.hashSet = []
    this.partRead = 0
  }

  update (data) {
    this.ed2k.size += data.length

    while (data) {
      data = this.processData(data)
    }
  }

  processData (data) {
    if (this.partRead + data.length < ED2K_CHUNK_SIZE) {
      this.hasher.update(data)
      this.partRead += data.length
    } else {
      const bytesGap = ED2K_CHUNK_SIZE - this.partRead
      this.hasher.update(data.slice(0, bytesGap))
      this.hashSet.push(this.hasher.hex())

      this.hasher = MD4.create()
      this.partRead = 0
      return data.slice(bytesGap)
    }
  }

  digest () {
    this.hashSet.push(this.hasher.hex())

    if (this.hashSet.length > 1) {
      this.hasher = MD4.create()
      for (var i = 0; i < this.hashSet.length; i++) {
        this.hasher.update(new Buffer(this.hashSet[i], 'hex'))
      }
      this.ed2k.hash = this.hasher.hex()
    } else {
      this.ed2k.hash = this.hashSet.pop()
    }

    return this.ed2k
  }
}

module.exports = Hasher
