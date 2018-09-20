const Mesh = require('hyperdb-mesh')
var key = '51f0304d4494cf220762eac44ea61ba37f342ebe173dc04f8e3d2829f1b36934'
var randomId = function(){
    return Math.floor(Math.random() * 190000) + 1
}
var options = { recursive: true,reverse: true }
var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('./randomPeer/demo.db', key, identity)
var db = mesh.db

mesh.on('ready', function () {
  console.log('Bootstrap key', db.key.toString('hex'))
  /* listRecords((arr)=>{
    if (arr.length > 0) {
      del(0, arr, ()=>{
        console.log("Emptied!")
      })
    }
  }) */
  insert()
  db.watch('/peers/', function () {
    listRecords((arr)=>{
      console.log(arr)
    })
    /* setTimeout(()=>{
      //process.exit(0)
      //insert()
      db.del('/peers/someid/', (err, val)=>{
        console.log("DELETED", err, val)
      })
    }, 1000) */
  })
})
function listRecords(cb) {
    db.list(options, (err, data)=>{
        var arr = data.map((item) => { return { key: item[0].key, value: item[0].value } })
        return cb(arr)
    })
}
function insert(){
  var identity =  {id: randomId(), key: randomId()}
  db.put('/peers/someid/'+identity.id, identity.key, function (err) {
    console.log("Stored ", identity)
  })
}

function del(index, arr, cb){
  var key = arr[index].key
  console.log(index, arr.length)
  db.del(key, ()=>{
    if (index === arr.length -1) {
      return cb()
    } else {
      del(index +1, arr, cb)
    }
  })
}