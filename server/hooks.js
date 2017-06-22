'use strict'
const glob = require('glob')
const repositoryDir = require('../site.config.js').repositoryDir
const pathReg = /(.*)\/.git\//
const pathSep = require('path').sep
const patterns = [
  '/*/*/branch/*/.git/',
  '/*/*/master/.git/',
  '/*/*/pr/*/.git/'
]
module.exports = hooks

function hooks (type, event) {
  console.log(repositoryDir)
  console.log(event.event.path)
  return getPath(repositoryDir)
  .then(lists => {
    return {lists}
  })
  .then(res => {
    console.log(res)
  })
}

function getPath (root) {
  var options = {root}
  var promises = []
  patterns.forEach(pattern => promises.push(globPromise(pattern, options)))
  return Promise.all(promises)
  .then(res => Array.prototype.concat.apply([], res))
  .then(files => {
    return globPromise('/', options)
    .then(res => ([(res && res[0] || ''), files]))
  })
  .then(([root, files]) => {
    var res = []
    var len = root.length
    files.forEach(file => {
      var name
      var path = pathReg.exec(file)
      if (path && (path = path[1])) {
        name = path.substr(len) || ''
        name = name.split(pathSep).reverse().join('-')
        res.push({name, path})
      }
    })
    return res
  })
}
function globPromise (pattern, options) {
  return new Promise(function (resolve, reject) {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err)
      }
      resolve(files)
    })
  })
}
