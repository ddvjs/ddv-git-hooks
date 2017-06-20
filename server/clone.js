const Git = require('nodegit')
module.exports = clone

function clone (url, path) {
  var cloneOptions = {}
  var credentialsAttempted = false
  cloneOptions.fetchOpts = {
    callbacks: {
      credentials: function (url, username, allowedTypes) {
        if (credentialsAttempted) {
          return Git.Cred.defaultNew()
        }
        credentialsAttempted = true
        return Git.Cred.userpassPlaintextNew('yuchonghua', '12345678')
      }
    }
  }
  return Git.Clone.clone(url, path, cloneOptions)
  .then(function (repository) {
    console.log(111111, 'clone', repository)
  })
  .catch(e => {
    console.log(33, 'clone', e)
  })
}
