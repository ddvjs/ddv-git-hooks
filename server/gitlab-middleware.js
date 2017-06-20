'use strict'
const Git = require('nodegit')
const path = require('path')
const config = require('../site.config.js')
// 创建模块
const clone = require('./clone.js')
const util = require('./util.js')
const getRemoteByRemoteUrl = require('./getRemoteByRemoteUrl.js')
// 导出模块
module.exports = gitlabMiddleware

var createHandler = require('node-gitlab-webhook')
var handler = createHandler([ // multiple handlers
  { path: '/webhook1', secret: '2deersdasdasdadadweqaweqweqeqewddsd' },
  { path: '/webhook2', secret: 'secret2' },
  { path: '/php', secret: 'ssssss' }
])
// 中间件
function gitlabMiddleware (req, res, next) {
  console.log('呵呵req.url,', req.url)
  console.log('呵呵req.path,', req.path)
  console.log('呵呵req.query,', req.query)
  console.log('呵呵req.params,', req.params)
  console.log('呵呵req.method,', req.method)
  console.log('呵呵req.headers,', req.headers)

  handler(req, res, function (err) {
    if (err) {
      res.statusCode = 404
      res.end('no such location')
    } else {
      next()
    }
  })
}

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  var info = event.payload
  var repositoryPath = path.join(config.repositoryDir, info.project.namespace, event.payload.project.name)
  let url = event.payload.repository.git_http_url
  let commitLast = event.payload.commits[0]
  console.log(commitLast.id)

  util.checkAndMkdirRepositoryDir(repositoryPath)
  .then(() => {
    // 判断这个库是否是这个url拉取的
    return getRemoteByRemoteUrl(repositoryPath, url)
    .then(([repository, remote]) => {
      var fetchOptions = {}
      var credentialsAttempted = false
      fetchOptions.callbacks = {
        credentials: function (url, username, allowedTypes) {
          if (credentialsAttempted) {
            return Git.Cred.defaultNew()
          }
          credentialsAttempted = true
          return Git.Cred.userpassPlaintextNew('yuchonghua', '12345678')
        },

        certificateCheck: function () {
          return 1
        }
      }
      // 更新
      return repository.fetch(remote, fetchOptions)
      .then(function () {
        return repository.mergeBranches('master', 'origin/master')
      })
    })
    .catch(e => {
      if (e.errorId === 'NOT_FIND_REPOSITORY') {
        // 创建一个库
        return clone(url, repositoryPath)
      }
      // 中转错误
      return Promise.reject(e)
    })
  })
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
