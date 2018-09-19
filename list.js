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
var randomId = function(){
    return Math.floor(Math.random() * 190000) + 1
}
var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('./Bootstrap/demo.db', null, identity)
var db = mesh.db
mesh.on('ready', function () {
    var key = db.key.toString('hex')
    console.log("Key", key)

    mesh = Mesh('./peerList/demo.db', key, identity)
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