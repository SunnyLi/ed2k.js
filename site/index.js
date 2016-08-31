const ED2K = require('../ed2k')

const MB = 1024 * 1024
const tempChunkSize = 10 * MB
const fileReader = new window.FileReader()

const hashProgress = document.querySelector('#hash-progress')
const hashQueue = document.querySelector('#hash-queue')
const hashResultTextarea = document.querySelector('#ed2k-links')

let isProcessing = false
let processedCount = 0
let fileTracker = {}

class FileTrackerObject {
  set ed2k (ed2k) {
    ed2k.name = this.file.name
    this._ed2k = ed2k
  }

  get ed2k () {
    return this._ed2k
  }

  constructor (file) {
    this.file = file
    this._ed2k = null
  }
}

const getQueueId = (idx) => {
  return `queue-${idx}`
}

const showInQueue = (idx, file) => {
  const el = document.createElement('div')
  el.id = getQueueId(idx)
  el.innerHTML = `${++idx}. ${file.name}`
  hashQueue.appendChild(el)
}

const removeFromQueue = (idx) => {
  document.getElementById(getQueueId(idx)).remove()
}

const handleFiles = (files) => {
  // enqueue
  let key
  let i = 0
  for (; i < files.length; i++) {
    key = Object.keys(fileTracker).length
    fileTracker[key] = new FileTrackerObject(files[i])
    showInQueue(key, files[i])
  }

  processFiles()
}

const processFiles = () => {
  if (isProcessing || Object.keys(fileTracker).length <= processedCount) {
    return
  }

  isProcessing = true
  const hasher = new ED2K()
  const file = fileTracker[processedCount].file
  const chunks = Math.ceil(file.size / tempChunkSize)
  let currentChunk = 0

  hashProgress.max = chunks
  hashProgress.classList.add('visible')

  fileReader.onload = function (e) {
    hashProgress.value = currentChunk + 1
    console.log(`read chunk ${currentChunk + 1} of ${chunks}`)
    hasher.update(new Buffer(e.target.result))
    currentChunk++

    if (currentChunk < chunks) {
      next(currentChunk, file)
    } else {
      const record = fileTracker[processedCount]
      record.ed2k = hasher.digest()

      removeFromQueue(processedCount++)
      hashResultTextarea.value += record.ed2k + '\n'
      hashProgress.classList.remove('visible')

      isProcessing = false
      processFiles()
    }
  }

  next(currentChunk, file)
}

const next = (currentChunk, file) => {
  const start = currentChunk * tempChunkSize
  const end = (start + tempChunkSize > file.size)
    ? file.size
    : start + tempChunkSize

  fileReader.readAsArrayBuffer(file.slice(start, end))
}

const fileInput = document.querySelector('#files')
fileInput.addEventListener('change', function () {
  handleFiles(this.files)
  fileInput.parentElement.reset()
})

const dndContainer = document.querySelector('#main-container')
const preventDefault = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

dndContainer.addEventListener('drop', (e) => {
  preventDefault(e)
  handleFiles(e.dataTransfer.files)
})
dndContainer.addEventListener('dragenter', preventDefault)
dndContainer.addEventListener('dragover', preventDefault)

document.querySelector('#layout-toggle').onclick = () => {
  document.querySelector('#split-container').classList.toggle('column')
}
