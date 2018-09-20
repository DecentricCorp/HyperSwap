const Mesh = require('hyperdb-mesh')
const sox = require('./sox')
var websocket
sox.wss.on('connection', function connection(ws) {
    websocket = ws
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
            log: 'Socket Connected'
        }))
    }
})
var key = '51f0304d4494cf220762eac44ea61ba37f342ebe173dc04f8e3d2829f1b36934'
var randomId = function(){
    return Math.floor(Math.random() * 190000) + 1
}
var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('/var/dat/storage/Bootstrap/demo.db', null, identity)
var db = mesh.db

mesh.on('ready', function () {
    console.log("New key", db.key.toString('hex'))
    //var key = db.key.toString('hex')
    
    console.log("Key", key)

    mesh = Mesh('/var/dat/storage/peerList/demo.db', key, identity)
    db = mesh.db
    var options = { recursive: true,reverse: true }
    mesh.on('ready', function () {  
        db.watch('/peers/', function () {
            db.list(options, (err, data)=>{
                var arr = data.map((item) => { return { key: item[0].key, value: item[0].value } })
                console.log(arr)
                if (websocket) {
                    if (websocket.readyState === websocket.OPEN) {
                        websocket.send(JSON.stringify(arr))
                    }
                }        
            })
        })
    })
})