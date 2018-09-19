const Mesh = require('hyperdb-mesh')
var key = 'bd5f536b5672b4b17660a60961cc507c4be1de1866bcbb964c63ffd35a737347'
var randomId = function(){
    return Math.floor(Math.random() * 190000) + 1
}
var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('./randomPeer/demo.db', key, identity)
var db = mesh.db

mesh.on('ready', function () {
  console.log('peer A key', db.key.toString('hex'))
  db.put('/peers/'+identity.id, identity.key, function (err) {
    console.log("Stored ", identity)
  })
  db.watch('/peers/', function () {
    setTimeout(()=>{
      process.exit(0)
    }, 100)
  })
})