module.exports = getRemoteByRemoteUrl
const fs = require('fs')
const exec = require('child_process').exec
const filesType = {
  'pull': 'pull.ddv-gitlab-hooks.sh',
  'clone': 'clone.ddv-gitlab-hooks.sh',
  'pr': 'pr.ddv-gitlab-hooks.sh'
}

function getRemoteByRemoteUrl (path, type) {
  return new Promise(function (resolve, reject) {
    let filePath = `${path}/${filesType[type]}`

    if (fs.existsSync(filePath) && filesType[type]) {
      exec(filePath, (err, stdout, stderr) => {
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        err ? reject(err) : resolve()
      })
    } else {
      var e = new Error(`the corresponding file was not found: ${filePath}`)
      e.errorId = 'UNKNOWN_ERROR'
      reject(e)
    }
  })
}
