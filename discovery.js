var hyperdrive = require('hyperdrive')
var ram = require('random-access-memory')
var swarm = require('hyperdiscovery')
var Buffer = require('safe-buffer').Buffer

var key = 'bd5f536b5672b4b17660a60961cc507c4be1de1866bcbb964c63ffd35a737347' && new Buffer('bd5f536b5672b4b17660a60961cc507c4be1de1866bcbb964c63ffd35a737347', 'hex')
var archive = hyperdrive(ram, key)
archive.ready(function (err) {
  if (err) throw err
  console.log('key', archive.key.toString('hex'))
  var sw = swarm(archive)

  sw.on('connection', function (peer, type) {
    console.log('got', peer, type) // type is 'webrtc-swarm' or 'discovery-swarm'
    console.log('connected to', sw.connections, 'peers')
    peer.on('close', function () {
      console.log('peer disconnected')
    })
  })
})