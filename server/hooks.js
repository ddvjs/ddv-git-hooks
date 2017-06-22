'use strict'
const glob = require('glob')
const repositoryDir = require('../site.config.js').repositoryDir
const branchPathReg = '/*/*/branch/*/.git/'
const masterPathReg = '/*/*/master/.git/'
const prPathReg = '/*/*/pr/*/.git/'
module.exports = hooks

function hooks (type, event) {
  console.log(repositoryDir)
  console.log(event.event.payload.path)
  return Promise.all([getMasterItem(), getBranchItem(), getPrItem()])
  .then(res => {
    console.log(res)
  })
}

function getMasterItem () {
  return new Promise(function (resolve, reject) {
    glob(masterPathReg, {root: repositoryDir}, (err, files) => {
      if (err) {
        reject(err)
      }
      resolve(files)
    })
  })
}

function getBranchItem () {
  return new Promise(function (resolve, reject) {
    glob(branchPathReg, {root: repositoryDir}, (err, files) => {
      if (err) {
        reject(err)
      }
      resolve(files)
    })
  })
}

function getPrItem () {
  return new Promise(function (resolve, reject) {
    glob(prPathReg, {root: repositoryDir}, (err, files) => {
      if (err) {
        reject(err)
      }
      resolve(files)
    })
  })
}

// g('/*/*/master/.git/', {root:'/Users/huadi/Desktop/project/ddv-gitlab-hooks/test'}, (err, files) => console.log(files))
