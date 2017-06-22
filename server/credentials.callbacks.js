'use strict'
module.exports = credentials
credentials.setConfig = setConfig
let cUsername, cPassword
const Git = require('nodegit')
function credentials (url, username, allowedTypes) {
  return Git.Cred.userpassPlaintextNew(cUsername, cPassword)
}
function setConfig (c) {
  cUsername = c.auth.username
  cPassword = c.auth.password
}
