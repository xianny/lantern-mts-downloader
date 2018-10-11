const request = require('request');
const fs = require('fs');

const url = `https://www.dropbox.com/s/t3j71ued5sjnz3a/dummy.txt?dl=1`
const chunkSize = 1000000 // 1mb

request({
    url,
    method: 'HEAD'
  }, (err, resp, body) => {
    const size = parseInt(resp.headers['content-length']);
    const chunks = range(0, size, chunkSize)

    console.log(size)
    console.log(chunks)

    fs.writeFileSync('test.txt', body)
  })


function range(start, end, step) {
  const _step = step ? step : 1

  if (start >= end) return [start]
  return [start, ...range(start + _step, end, _step)]
}
