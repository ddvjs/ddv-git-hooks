'use strict'
module.exports = hooks
const glob = require('glob')
const fs = require('fs')
const mustache = require('mustache')
const pathSep = require('path').sep
const pathReg = /(.*)\/.git\//
const patterns = [
  '/*/*/branch/*/.git/',
  '/*/*/master/.git/',
  '/*/*/pr/*/.git/'
]
// 默认用这个模板
const confTemplate = `{{#lists}}
<VirtualHost *:{{port}}>
  ServerName {{ServerName}}
  ServerAdmin {{ServerAdmin}}
  DocumentRoot {{DocumentRoot}}

  ErrorLog {{ErrorLog}}
  CustomLog {{CustomLog}} combined


  DirectoryIndex {{DirectoryIndex}}
  <Directory {{Directory}}>
            Options -Indexes +FollowSymlinks
            AllowOverride All
            Require all granted
  </Directory>

</VirtualHost>
{{/lists}}`
function hooks (event) {
  var config = event.config
  var repositoryDir = config.repositoryDir
  getPath(repositoryDir)
  .then(lists => {
    var res = []
    lists.forEach(line => {
      res.push({
        port: 80,
        ServerName: `${line.name}.${config.phpci.domain}`,
        ServerAdmin: `${config.phpci.serverAdmin || 'webmaster@localhost'}`,
        DocumentRoot: line.path,
        Directory: line.path,
        ErrorLog: `${config.phpci.rootLog}/${line.name}.error.log`,
        CustomLog: `${config.phpci.rootLog}/${line.name}.access.log`,
        DirectoryIndex: `${config.phpcli.DirectoryIndex || 'index.html index.php'}`
      })
    })
    return res
  })
  .then(lists => {
    var output = mustache.render((config.confTemplate || confTemplate), {lists})
    fs.wir(config.phpci.confFile, output)
  })
  .then(() => {
    var cmd = config.phpci.reloadCmd || 'service apache2 reload'
    //exec(cmd)
  })
}

function getPath (root) {
  var options = {root}
  var promises = []
  patterns.forEach(pattern => promises.push(globPromise(pattern, options)))
  return Promise.all(promises)
  .then(res => Array.prototype.concat.apply([], res))
  .then(files => {
    return globPromise('/', options)
    .then(res => ([(res && res[0] || ''), files]))
  })
  .then(([root, files]) => {
    var res = []
    var len = root.length
    files.forEach(file => {
      var name
      var path = pathReg.exec(file)
      if (path && (path = path[1])) {
        name = path.substr(len) || ''
        name = name.split(pathSep).reverse().join('-')
        res.push({name, path})
      }
    })
    return res
  })
}
function globPromise (pattern, options) {
  return new Promise(function (resolve, reject) {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err)
      }
      resolve(files)
    })
  })
}
