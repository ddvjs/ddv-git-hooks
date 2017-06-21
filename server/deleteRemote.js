'use strict'
const fs = require('fs')
const getRemoteByRemoteUrl = require('./getRemoteByRemoteUrl.js')
module.exports = function deleteRemote (url, path) {
  return getRemoteByRemoteUrl(path, url)
  .then(([repository, remote]) => {
    return deleteFolderRecursive(path)
    .then(() => {
      console.log('Branch deleted successfully')
    })
    .catch(() => {
      let pathArray = path.split('/')
      let project = pathArray.slice(-3, -2)
      let branch = pathArray.slice(-1)
      console.log(`The branch is not did found: ${project}-${branch}`)
    })
  })
}

function deleteFolderRecursive (path) {
  return new Promise(function (resolve, reject) {
    var files = []
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path)
      files.forEach((file, index) => {
        let curPath = path + '/' + file
        if (fs.statSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(path)
      resolve()
    } else {
      reject()
    }
  })
}
