const fs = require('fs')

const { getContentLength, range, chunkedDownload } = require('./lib')

function run(options) {
  const { url, chunkSize, outPath } = options

  return getContentLength(url)
    .then(size => {
      const chunks = range(0, size, chunkSize)
      console.log(`Found file at ${url} with size ${parseInt(size/1000)}kb, downloading in ${chunks.length} chunks`)
      return chunkedDownload(chunks, url)
    })
    .then(content => {
      console.log(`Successfully downloaded file, saving to ${outPath}`)
      fs.writeFileSync(outPath, content)
      return Promise.resolve()
    })
    .catch(e => {
      console.log(e)
      return Promise.reject(e)
    })
}

module.exports = run
