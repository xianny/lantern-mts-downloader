const tap = require('tap')
const nock = require('nock')
const fs = require('fs')
const path = require('path')

const download = require('../index')

const mockConfig = {
  url: 'http://test.com',
  chunkSize: 1000,
  outPath: './tmp.txt'
}

const fixturePath = path.join(__dirname, './fixture.txt')
const fixtureSize = fs.statSync(fixturePath).size

tap.test('should download file', t => {
  nock(mockConfig.url)
    .head('/')
    .reply(200, '', { 'content-length': fixtureSize})

  // work-around for https://github.com/nock/nock/issues/1241
  const range = require('../lib').range
  const chunks = range(0, fixtureSize, mockConfig.chunkSize)
  chunks.forEach((chunk, i) => {
    const buf = new Buffer(mockConfig.chunkSize)
    const fd = fs.openSync(fixturePath, 'r')
    fs.readSync(fd, buf, 0, buf.length, chunk)
    nock(mockConfig.url, {
      reqHeaders: {
        'Range': `bytes=${chunk}-${chunks[i+1]}`
      }
    })
      .get('/')
      .reply(200, buf.toString())
  })

  download(mockConfig)
    .then(() => {
      const actual = fs.readFileSync(mockConfig.outPath).toString()
      const expected = fs.readFileSync(fixturePath).toString()
      t.equals(actual, expected, 'files should be the same')
      t.end()
    })
    .catch(e => {
      t.notOk(e, 'should not have error')
    })
})
