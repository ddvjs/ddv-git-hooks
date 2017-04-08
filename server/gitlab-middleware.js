'use strict'
// 导出模块
module.exports = gitlabMiddleware
// 中间件
function gitlabMiddleware (req, res, next) {
  console.log('呵呵req.url,',req.url)
  console.log('呵呵req.path,',req.path)
  console.log('呵呵req.query,',req.query)
  console.log('呵呵req.params,',req.params)
  console.log('呵呵req.method,',req.method)
  console.log('呵呵req.headers,',req.headers)
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}

var createHandler = require('node-gitlab-webhook')
var handler = createHandler([ // multiple handlers
  { path: '/webhook1', secret: '2deersdasdasdadadweqaweqweqeqewddsd' },
  { path: '/webhook2', secret: 'secret2' }
])
// var handler = createHandler({ path: '/webhook1', secret: 'secret1' }) // single handler

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )
  console.log(event
  )
  switch (event.path) {
    case '/webhook1':
      // do sth about webhook1
      break
    case '/webhook2':
      // do sth about webhook2
      break
    default:
      // do sth else or nothing
      break
  }
})
