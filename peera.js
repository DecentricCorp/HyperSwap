const Mesh = require('hyperdb-mesh')

//var key = '62158d8e43f8e64cd01a92fdd922a97bf3795c8341f7355491d11b6fe5f03bad'
var randomId = function(){
    return Math.floor(Math.random() * 190000) + 1
}
var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('./peerA/demo.db', null, identity)
var db   = mesh.db

mesh.on('ready', function () {
  console.log('peer A key', db.key.toString('hex'))
  db.put('/peers/'+identity.id, identity.key, function (err) {
    console.log("Stored ", identity)
  })
})