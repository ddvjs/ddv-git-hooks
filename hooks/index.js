'use strict'
const hooksFn = Object.create(null)
module.exports = hooks

function hooks (type, event) {
  if (!hooksFn[type]) {
    loadHooksFn(type)
    .catch(e => console.error('没有type这个类型', e))
  }
  if (!hooksFn[type]) {
    console.error('没有type这个类型')
    return
  }
  hooksFn[type](event)
}
function loadHooksFn (type) {
  return new Promise(function (resolve, reject) {
    try {
      hooksFn[type] = require(type)
      resolve(hooksFn[type])
    } catch (e) {
      reject(e)
    }
  })
}
