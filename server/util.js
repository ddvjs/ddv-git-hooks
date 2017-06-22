const fs = require('fs')
const mkdirp = require('mkdirp')
module.exports = {
  checkAndMkdirRepositoryDir (dir) {
    return this.isRepositoryDir(dir)
    .catch(e => {
      return new Promise(function (resolve, reject) {
        mkdirp(dir, err => err ? reject(err) : resolve())
      })
    })
  },
  isRepositoryDir (dir) {
    return new Promise(function (resolve, reject) {
      fs.fstat(dir, (err, stats) => {
        if (err) {
          reject(err)
        } else if (stats.isDirectory() || stats.isBlockDevice() || stats.isCharacterDevice()) {
          resolve()
        } else {
          reject(new Error('Not a Repository Dir'))
        }
      })
    })
  }
}
