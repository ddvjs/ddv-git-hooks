'use strict'
const hooksFn = Object.create(null)
module.exports = hooks
const path = require('path')

function hooks (err, event) {
  if (err) {
    console.error('运行失败', err)
    return
  }
  loadHooksFn(event.event.path, event.config)
  .then(fn => {
    fn(event)
  })
  .catch(e => console.error('HooksFn运行失败', e))
}

function loadHooksFn (type, config) {
  if (hooksFn[type]) {
    return Promise.resolve(hooksFn[type])
  }
  return Promise.resolve(config.hooksDir)
  .then(hooksDir => {
    if (config.hooksDir) {
      return new Promise(function (resolve, reject) {
        try {
          hooksFn[type] = require(path.join(hooksDir, type))
          resolve(hooksFn[type])
        } catch (e) {
          reject(e)
        }
      })
    } else {
      return Promise.reject(new Error('not hooksDir'))
    }
  })
  .catch(e => {
    return new Promise(function (resolve, reject) {
      try {
        hooksFn[type] = require(path.join(__dirname, type))
        resolve(hooksFn[type])
      } catch (e) {
        reject(e)
      }
    })
  })
}
