const request = require('request')
const d3 = require('d3-queue')

function chunkedDownload(chunks, url) {
  let q = d3.queue()

  return new Promise((resolve, reject) => {
    for (let i = 0; i < chunks.length-1; i++) {
      let start = i === 0 ? chunks[i] : chunks[i] + 1
      q.defer(partialRequest, url, start, chunks[i+1])
    }

    q.awaitAll((err, results) => {
      if (err) return reject(err)
      return resolve(results.join(''))
    })
  })
}

function partialRequest(url, start, end, done) {
  request({
    url,
    headers: {
      'Range': `bytes=${start}-${end}`
    }
  }, (err, resp, body) => {
    if (!err) console.log(`Successfully downloaded byterange ${start} to ${end}`)
    if (err) console.log(`Error downloading byterange ${start} to ${end}: [${err}]`)
    done(err, body)
  })
}

function getContentLength(url) {
  return new Promise((resolve, reject) => {
    request({
      url,
      method: 'HEAD'
    }, (err, resp) => {
      if (!resp || !resp.headers || !resp.headers['content-length']) {
        return reject(new Error('Couldn\'t find response headers'))
      }

      const size = parseInt(resp.headers['content-length'])

      if (isNaN(size)) {
        return reject(new Error(`Received invalid content-length header: [${resp.headers['content-length']}]`))
      }

      return resolve(size)
    })
  })
}

function range(start, end, step) {
  const _step = step ? step : 1

  if (start >= end) return [start]
  return [start, ...range(start + _step, end, _step)]
}

module.exports = {
  chunkedDownload,
  getContentLength,
  range
}
