var hyperlog = require('hyperlog')
var memdb = require('memdb')
var hyperswarm = require('./hyperswarm')
var wrtc = require('wrtc')

var sublog = hyperlog(memdb(), {
    valueEncoding: 'json'
})

var follower = hyperswarm(sublog, {
    wrtc: wrtc,
    topic: 'example',
    hubs: ['http://c8c841a5.ngrok.io']
})

follower.createReadStream({ live: true })
    .on('data', function (data) {
        console.log("Data!!!", data)
    })

