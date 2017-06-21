'use strict'
module.exports = credentials
const Git = require('nodegit')
function credentials (url, username, allowedTypes) {
  return Git.Cred.userpassPlaintextNew('yuchonghua', '12345678')
}
