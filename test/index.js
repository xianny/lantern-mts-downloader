const tap = require('tap')
const nock = require('nock')

const config = require('../config')
const main = require('../index.js')

const [ baseUrl, queryString ] = config.url.split('?')
const queryParams = parseQuerystring(queryString)

tap.test('should make a HEAD request', (t) => {

  nock(baseUrl)
    .head('')
    .query(queryParams)
    .reply(200, '', { 'content-length': 60000000})

  main.run()

  nock.isDone()
  t.end()
})

tap.test('range function should behave correctly', (t) => {
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
    t.deepEquals(main.range(...c.input), c.output)
  })

  t.end()
})

function parseQuerystring(queryString) {
  var obj = {}
  queryString
    .split('&')
    .map(pair => pair.split('='))
    .forEach(pair => obj[pair[0]] = pair[1])
  return obj
}