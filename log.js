var hyperlog = require('hyperlog')
var hyperswarm = require('hyperswarm')
var memdb = require('memdb')

var log = hyperlog(memdb(), {
  valueEncoding: 'json'
})

var swarm = hyperswarm(log, {
  topic: 'examplez',
  hubs: [ 'https://signalhub.mafintosh.com' ]
})

var times = 0
setInterval(function () {
  log.append({ time: Date.now(), msg: 'HELLO!x' + times })
  times++
}, 1000)