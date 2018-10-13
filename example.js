const download = require('./index')

const options = {
  url: 'https://www.dropbox.com/s/t3j71ued5sjnz3a/dummy.txt?dl=1',
  chunkSize: 10000000, // 10mb,
  outPath: '/tmp/test.txt'
}

download(options)
