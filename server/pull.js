'use strict'
const credentials = require('./credentials.callbacks.js')
const certificateCheck = require('./certificateCheck.callbacks.js')
const getRemoteByRemoteUrl = require('./getRemoteByRemoteUrl.js')
const execImplement = require('./execImplement.js')

module.exports = pull

function pull (url, path, branch) {
  var fetchOpts = {
    callbacks: {
      credentials,
      certificateCheck
    }
  }
  // 判断这个库是否是这个url拉取的
  return getRemoteByRemoteUrl(path, url)
  .then(([repository, remote]) => {
    // 更新
    return repository.fetch(remote, fetchOpts)
    .then(function () {
      var remoteName = remote.name()
      return repository.mergeBranches(branch, `${remoteName}/${branch}`)
      .then(() => {
        return execImplement(path, 'pull')
        .then(() => {
          console.log('command execution success')
        })
        .catch(e => {
          console.log(e)
        })
      })
    })
  })
}
