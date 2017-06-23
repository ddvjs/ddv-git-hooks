const Git = require('nodegit')
const credentials = require('./credentials.callbacks.js')
const certificateCheck = require('./certificateCheck.callbacks.js')
const execImplement = require('./execImplement.js')

module.exports = clone

function clone (url, path, branch) {
  var cloneOptions = {}
  cloneOptions.checkoutBranch = branch
  cloneOptions.fetchOpts = {
    callbacks: {
      credentials,
      certificateCheck
    }
  }
  return Git.Clone.clone(url, path, cloneOptions)
  .then(function (repository) {
    console.log('The project was cloned success')
    return execImplement(path, 'clone')
    .then(() => {
      console.log('command execution success')
    })
    .catch(e => {
      console.log(e)
    })
  })
  .catch(e => {
    console.error(`The project was cloned failed: ${e}`)
  })
}
