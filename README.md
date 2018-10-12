# Multi-part downloader for Lantern coding challenge
```
git clone git@github.com:xianny/lantern-mts-downloader.git && cd lantern-mts-downloader && npm install && node example.js
```

This outputs to `/tmp/test.txt` (specified in `config.js`). To verify correctness, download the original file at the URI in `config.js` and diff the two files.

## How to use
```
const options = {
  url: http://test.com,
  chunkSize: 1000 // bytes,
  outPath: /tmp/test.txt
}

const download = require('./index')

download(options)
.then(() => {
  fs.readFileSync(options.outPath) // returns content of original file
})
.catch(e => {
  console.log(e) // any errors encountered
})
```

## Testing
```
npm run test
```