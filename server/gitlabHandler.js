'use strict'
let config
const path = require('path')
const bl = require('bl')
// 创建模块
const clone = require('./clone.js')
const pull = require('./pull.js')
const util = require('./util.js')
const hooks = require('../hooks')
const deleteRemote = require('./deleteRemote.js')
const EventEmitter = require('events').EventEmitter
const handler = new EventEmitter()

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  var hooksEvent = Object.create(null)
  hooksEvent.config = config
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
})
function setConfig (c) {
  config = c
}
function gitlabHandler (req, res) {
  var currentOptions, event, events
  var hasError = e => {
    res.writeHead(400, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: e.message }))

    handler.emit('error', e, req)
  }
  try {
    currentOptions = findCurrentOptions(req.url)
    if (!isObject(currentOptions)) {
      throw new TypeError('must provide an options object')
    }
    if (typeof currentOptions.path !== 'string') { throw new TypeError('must provide a \'path\' option') }

    if (typeof currentOptions.secret === 'string' || Array.isArray(currentOptions.secret)) {
      let secret = currentOptions.secret
      let secretInput = req.headers['x-gitlab-token']
      if (!(secret === secretInput || (Array.isArray(secret) && secret.indexOf(secretInput) > -1))) {
        throw new TypeError('\'secret\' error')
      }
    } else {
      throw new TypeError('must provide a \'secret\' option')
    }
    if (req.url.split('?').shift() !== currentOptions.path) {
      throw new TypeError('path')
    }
    event = req.headers['x-gitlab-event']
    events = currentOptions.events
    if (!event) {
      throw new TypeError('No X-Gitlab-Event found on request')
    }
    if (events && events.indexOf(event) === -1) {
      // 如果限定了events就限定
      throw new TypeError('X-Gitlab-Event is not acceptable')
    }
  } catch (e) {
    hasError(e)
  }

  req.pipe(bl((err, data) => {
    if (err) {
      return hasError(err)
    }

    var obj

    try {
      obj = JSON.parse(data.toString())
    } catch (e) {
      return hasError(e)
    }

    var event = obj.object_kind

    res.writeHead(200, { 'content-type': 'application/json' })
    res.end('{"ok":true}')

    var emitData = {
      event: event,
      payload: obj,
      protocol: req.protocol,
      host: req.headers['host'],
      url: req.url,
      path: currentOptions.path,
      currentOptions: currentOptions
    }

    handler.emit(event, emitData)
    handler.emit('*', emitData)
  }))
}
function findCurrentOptions (url) {
  var paths = Object.keys(config.paths)
  var ret = Object.create(null)
  paths.forEach(path => {
    if (url.split('?').shift() === path) {
      ret.path = path
      ret = Object.assign(ret, config.paths[path])
    }
  })
  return ret
}
function isObject (obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}
// 导出模块
module.exports = Object.assign(gitlabHandler, {setConfig})
