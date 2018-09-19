var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 40510 })



module.exports.wss = wss