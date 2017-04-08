'use strict'
process.title = 'ddvGitlabHooksServer'
// 文件模块
const fs = require('fs')
// 路径模块
const path = require('path')
// 导出模块
const app = require('express')()
// worker进程模块
const worker = require('ddv-worker')
// http模块
const http = require('http')
// gitlab中间件
const gitlabMiddleware = require('./gitlab-middleware')
// 尝试获取配置文件地址
const siteRootPath = path.resolve('.', './')
// 使用中间件
app.use(gitlabMiddleware)
// 导出模块
module.exports = worker
// 尝试获取配置文件地址
var siteConfigFile = path.resolve(siteRootPath, 'site.config.js')
if (!fs.existsSync(siteConfigFile)) {
  // 再次参数获取
  siteConfigFile = path.resolve(siteRootPath, 'gitlab.hooks.config.js')
}
if (!fs.existsSync(siteConfigFile)) {
  siteConfigFile = null
}
// 创建http服务
worker.server = http.createServer(app)
// 设置配置文件
worker.setSiteConfigFile = flie => {
  if (fs.existsSync(siteConfigFile)) {
    siteConfigFile = flie
  } else {
    throw new Error('config flie not find')
  }
}
let isStart = false
// 开启服务
worker.start = config => {
  if (isStart) {
    return
  }
  // 初始化
  isStart = true
  // 配置信息
  config = config || require(siteConfigFile)
  // 监听服务 - Listen the server
  worker.updateServerConf({
    defaultListen: config.defaultListen,
    listen: config.listen,
    cpuLen: config.cpuLen
  }).then(() => {
    console.log('监听配置参数 更新成功')
  }, e => {
    console.error('监听配置参数 更新失败')
    console.error(e)
  })
}
// 下一进程自动启动
process.nextTick(() => {
  worker.isNotAuto === true || worker.start()
})
