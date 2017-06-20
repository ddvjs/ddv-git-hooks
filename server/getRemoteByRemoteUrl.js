const Git = require('nodegit')
module.exports = function getRemoteByRemoteUrl (repositoryPath, url) {
  return Git.Repository.open(repositoryPath)
  .then(repository => {
    return repository.getRemotes()
    .then(remoteNames => {
      if (Array.isArray(remoteNames) && remoteNames.length > 0) {
        var promises = []
        remoteNames.forEach(remote => {
          promises.push(repository.getRemote(remote))
        })
        return Promise.all(promises)
        .then(remotes => ([repository, remotes]))
      } else {
        return Promise.reject(new RepositoryError('not find remote', 'NOT_FIND_REPOSITORY'))
      }
    })
  }).then(([repository, remotes]) => {
    if (!Array.isArray(remotes)) {
      return Promise.reject(new RepositoryError('not find remote', 'NOT_FIND_REMOTE'))
    }
    if (remotes.length < 0) {
      return Promise.reject(new RepositoryError('not find remote', 'NOT_FIND_REMOTE'))
    }
    for (var i = 0; i < remotes.length; i++) {
      if (remotes[i] && remotes[i].url && remotes[i].url() === url) {
        return Promise.resolve([repository, remotes[i]])
      }
    }
    return Promise.reject(new RepositoryError('remote url error', 'REMOTE_URL_ERROR'))
  })
}
/**
 * [masterError 主线程错误]
 * @author: 桦 <yuchonghua@163.com>
 * @DateTime 2016-11-14T14:39:39+0800
 * @param    {string}                 message [description]
 * @param    {string}                 stack   [description]
 * @return   {error}                          [description]
*/
class RepositoryError extends Error {
    // 构造函数
  constructor (message, errorId) {
      // 调用父类构造函数
    super(message)
    this.errorId = errorId || this.errorId || 'UNKNOE_ERROR'
  }
}
