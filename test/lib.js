const nock = require('nock')
const tap = require('tap')

const {
  chunkedDownload,
  getContentLength,
  range
} = require('../lib')

const url = 'http://test.com'

tap.test('range function', (t) => {
  const cases = [
    {
      input: [0,10,1],
      output: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    {
      input: [0, 10, 2],
      output: [0, 2, 4, 6, 8, 10]
    },
    {
      input: [0, 5, 2],
      output: [0, 2, 4, 6] // returns >= end of range
    }
  ]

  cases.forEach(c => {
    t.deepEquals(range(...c.input), c.output)
  })

  t.end()
})

tap.test('getContentLength function should return content length', (t) => {

  const mockLength = 60000000
  nock(url)
    .log(console.log)
    .head('/')
    .reply(200, '', { 'content-length': mockLength})

  getContentLength(url)
    .then(length => {
      t.ok(nock.isDone(), 'should make HEAD request')
      t.equal(length, mockLength, 'should return content length')
      t.end()
    }).catch(e => t.notOk(e, 'should not error'))

})

tap.test('getContentLength function should reject invalid content length', (t) => {
  nock(url)
    .head('/')
    .reply(200, '', { 'content-length': ''})

  getContentLength(url)
    .then(length => t.notOk(length, 'should error on invalid content length'))
    .catch(e => {
      t.ok(e)
      t.end()
    })
})

tap.test('chunkedDownload function', (t) => {

  const chunks = [0, 10, 20, 30]
  const expectedRanges = ['0-10', '11-20', '21-30']

  expectedRanges.forEach(range => {
    nock(url, {
      reqHeaders: {
        'Range': `bytes=${range}`
      }
    })
      .get('/')
      .reply(200, range)
  })

  chunkedDownload(chunks, url)
    .then(content => {
      t.equal(content, expectedRanges.join(''), 'should return response bodies in correct sequence')
      t.ok(nock.isDone(), 'should make one call per chunk')
      t.end()
    })
    .catch(e => {
      t.notOk(e, 'should not have error')
    })
})

tap.test('chunkedDownload should fail if any part fails', (t) => {
  const chunks = [0, 10, 20, 30]
  const expectedRanges = ['0-10', '11-20', '21-30']

  // mock requests with one error response
  expectedRanges.forEach((range, i) => {
    if (i !== 1) {
      nock(url, {
        reqHeaders: {
          'Range': `bytes=${range}`
        }
      })
        .get('/')
        .reply(200, expectedRanges[i])
    } else {
      nock(url, {
        reqHeaders: {
          'Range': `bytes=${range}`
        }
      })
        .get('/')
        .replyWithError('something bad happened')
    }
  })

  chunkedDownload(chunks, url)
    .then(content => {
      t.notOk(content, 'should not return any content')
    })
    .catch(e => {
      t.equal(e.message, 'something bad happened', 'should return error')
      t.end()
    })
})
