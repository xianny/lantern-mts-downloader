const fs = require('fs')

const { getContentLength, range, chunkedDownload } = require('./lib')

function run(config) {
  const { url, chunkSize, outPath } = config

  getContentLength(url)
    .then(size => {
      const chunks = range(0, size, chunkSize)
      console.log(`Downloading ${parseInt(size/1000)}mb file in ${chunks.length} chunks`)
      return chunkedDownload(chunks, url)
    })
    .then(content => fs.writeFileSync(outPath, content))
}

module.exports = run
