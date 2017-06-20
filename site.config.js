const path = require('path')
module.exports = {
  // 项目监听
  'defaultListen': false,
  // 监听列表
  'listen': [
    {
      'type': 'tcp',
      'host': 'video.ping-qu.com',
      'port': 80
    }
  ],
  'repositoryDir': path.join(__dirname, './test'),
  'cpuLen': 1
}
