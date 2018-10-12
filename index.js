const request = require('request')
const fs = require('fs')

const { url, chunkSize } = require('./config')

function run() {
  return request({
    url,
    method: 'HEAD'
  }, (err, resp, body) => {
    const size = parseInt(resp.headers['content-length'])

    if (isNaN(size)) {
      console.log(`Received invalid content-length header, exiting: [${resp.headers['content-length']}]`)
      return
    }

    const chunks = range(0, size, chunkSize)
    console.log(chunks)

    fs.writeFileSync('test.txt', body)
  })
}


function range(start, end, step) {
  const _step = step ? step : 1

  if (start >= end) return [start]
  return [start, ...range(start + _step, end, _step)]
}

module.exports = {
  run,
  range
}