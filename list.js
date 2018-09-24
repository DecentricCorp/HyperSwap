const key = '51f0304d4494cf220762eac44ea61ba37f342ebe173dc04f8e3d2829f1b36934'
const Mesh = require('hyperdb-mesh')
const sox = require('./sox')
var records = []
var websocket
sox.wss.on('connection', function connection(ws) {
    websocket = ws
    if (ws.readyState === ws.OPEN) {
        socketSend({ log: 'Socket Connected' }, ()=>{
            listRecords((arr)=>{
                socketSend(arr, ()=>{})
            })
        })
    }
})

function comparer(otherArray){
    return function(current){
      return otherArray.filter(function(other){
        return other.value == current.value && other.display == current.display
      }).length == 0;
    }
  }

var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('/var/dat/storage/Bootstrap/demo.db', null, identity)
var db = mesh.db
var options = { recursive: true,reverse: true }

mesh.on('ready', function () {
    //console.log("New key", db.key.toString('hex'))
    //var key = db.key.toString('hex')
    //console.log("Key", key)

    mesh = Mesh('/var/dat/storage/peerList/demo.db', key, identity)
    db = mesh.db
    
    mesh.on('ready', function () {
        listRecords((arr)=>{
            records = arr
            socketSend(arr, ()=>{
                console.log("All records", arr)
            })
        })
        db.watch('/', function () {
            listRecords((arr)=>{
                //console.log("old", records.length, JSON.stringify(records))
                //console.log("new", arr.length, JSON.stringify(arr))
                var newRecord = arr.filter(comparer(records))[0]
                records = arr
                //var newRecord = arr[arr.length -1]
                socketSend(newRecord, ()=>{
                    //console.log("Newest Record", newRecord)
                })
            })
        })
    })
})

function listRecords(cb) {
    db.list(options, (err, data)=>{
        var arr = data.map((item) => { return { key: item[0].key, value: item[0].value } })
        return cb(arr)
    })
}

function socketSend(data, cb) {
    if (websocket) {
        if (websocket.readyState === websocket.OPEN) {
            websocket.send(JSON.stringify(data))
            return cb()
        }
    } else {
        return cb()
    }
}

function randomId(){
    return Math.floor(Math.random() * 190000) + 1
}