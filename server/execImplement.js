module.exports = getRemoteByRemoteUrl
const fs = require('fs')
const spawn = require('child_process').spawn
const filesType = {
  'pull': 'pull.ddv-gitlab-hooks.sh',
  'clone': 'clone.ddv-gitlab-hooks.sh',
  'pr': 'pr.ddv-gitlab-hooks.sh'
}

function getRemoteByRemoteUrl (cwd, type) {
  return new Promise(function (resolve, reject) {
    let filePath = `${cwd}/${filesType[type]}`

    if (fs.existsSync(filePath) && filesType[type]) {
      let sh = spawn(filePath, {cwd})
      sh.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
      })

      sh.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
      })

      sh.on('close', (code) => {
        code === 0 ? resolve() : reject(new Error(`child process exited with code ${code}`))
      })
    } else {
      var e = new Error(`the corresponding file was not found: ${filePath}`)
      e.errorId = 'UNKNOWN_ERROR'
      reject(e)
    }
  })
}
