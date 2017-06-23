const Git = require('nodegit')
const credentials = require('./credentials.callbacks.js')
const certificateCheck = require('./certificateCheck.callbacks.js')

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
  })
  .catch(e => {
    console.error(`The project was cloned failed: ${e}`)
  })
}
