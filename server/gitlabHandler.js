'use strict'
const path = require('path')
const config = require('../site.config.js')
const createHandler = require('node-gitlab-webhook')
// 创建模块
const clone = require('./clone.js')
const pull = require('./pull.js')
const util = require('./util.js')
const hooks = require('./hooks.js')
const deleteRemote = require('./deleteRemote.js')

const handler = createHandler([ // multiple handlers
  { path: '/webhook1', secret: '2deersdasdasdadadweqaweqweqeqewddsd' },
  { path: '/webhook2', secret: 'secret2' },
  { path: '/php', secret: 'ssssss' }
])

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  var hooksEvent = Object.create(null)
  hooksEvent.event = event
  hooksEvent.type = 'unknow'
  let info = event.payload
  // 判断是否删除分支
  let isDel = (parseInt(info.after) === 0)
  let ref = info.ref
  // 获取当前分支
  let branch = ref.split('/').slice(-1)[0]
  let branchDir = branch === 'master' ? branch : `branch/${branch}`
  // 获取存储地址、项目组、项目名称
  let repositoryPath = path.join(config.repositoryDir, info.project.namespace, event.payload.project.name, branchDir)
  // git地址
  let url = event.payload.repository.git_http_url
  // 获取最新的提交id
  // let commitLast = event.payload.commits[0]
  // console.log(commitLast.id)
  util.checkAndMkdirRepositoryDir(repositoryPath)
  .then(() => {
    if (isDel) {
      hooksEvent.type = 'delete'
      hooksEvent.res = Object.create(null)
      return deleteRemote(url, repositoryPath)
    }
    // 试图拉取最新分支
    return pull(url, repositoryPath, branch)
    .then(res => {
      hooksEvent.type = 'pull'
      hooksEvent.res = res
      console.log('update completed')
    }, e => {
        // 如果是没有这个库
      if (e.errorId === 'NOT_FIND_REPOSITORY') {
          // 克隆这个库
        return clone(url, repositoryPath, branch)
        .then(res => {
          hooksEvent.type = 'clone'
          hooksEvent.res = res
        })
      }
      // 否则继续抛出上层错误
      return Promise.reject(e)
    })
  })
  .then(() => {
    hooks(null, hooksEvent)
  }, e => {
    hooks(e, hooksEvent)
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
// 导出模块
module.exports = (req, res) => {
  handler(req, res, function (err) {
    if (err) {
    }
    res.statusCode = 404
    res.end('no such location')
  })
}
