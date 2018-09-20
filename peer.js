const Mesh = require('hyperdb-mesh')
var key = '51f0304d4494cf220762eac44ea61ba37f342ebe173dc04f8e3d2829f1b36934'
var randomId = function(){
    return Math.floor(Math.random() * 190000) + 1
}
var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('./randomPeer/demo.db', key, identity)
var db = mesh.db

mesh.on('ready', function () {
  console.log('Bootstrap key', db.key.toString('hex'))
  db.put('/peers/'+identity.id, identity.key, function (err) {
    console.log("Stored ", identity)
  })
  db.watch('/peers/', function () {
    setTimeout(()=>{
      //process.exit(0)
    }, 100)
  })
})