const Mesh = require('hyperdb-mesh')
const express = require('express')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json() 
const app = express()
const port = 4000


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.options("/*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(200);
});

app.get('/', (req, res) => {
  listRecords(arr=>{
    res.send(arr)
  })
})
app.get('/key', (req, res)=>{
  res.send({key: db.local.key.toString('hex')})
})
app.get('/forsale', (req, res)=>{
  listPrefixedRecords('peers/', (records)=>{
    var peers = records.map(item=>{
      console.log("item", item)
      var peer = item.key.replace('peers/', '')
      return {
        peer: peer
      }
    })
    var template = JSON.parse(JSON.stringify(peers))
    getItems(0, peers, template, 'forsale', (populated)=>{
      res.send(populated)
    })
    function getOfferItems(index, arr, template, cb) {
      var item = arr[index]
      list(item.key.split('/')[0]+'/offer/', (record)=>{
        
        console.log("RECORD",record, item.key.split('/')[0])
        template[index].offer = record
        if (index === arr.length -1) {
          return cb(template)
        } else {
          return getOfferItems(index + 1, arr, template, cb)
        }
      })      
    }
    function getItems(index, arr, template, table, cb){
      var peer = arr[index].peer
      listPrefixedRecords(peer + '/' + table, (records)=>{
        var offersTemplate = JSON.parse(JSON.stringify(records))
        getOfferItems(0, records, offersTemplate, (offers)=>{
          template[index].forsale = offers        
        if (index === arr.length -1) {
          return cb(template)
        } else {
          return getItems(index + 1, arr, template, table, cb)
        }
        })
      })
    }
  })
})

app.get('/:table/:key', (req, res)=>{
  var localKey = db.local.key.toString('hex')
  var recordKey = localKey + '/' + req.params.table + '/' + req.params.key
  get(recordKey, (err, record)=>{
    var record = record[0]
    var recordValue = record.value
    if (typeof(record.value)==='string') {
      recordValue = JSON.parse(record.value)
    }
    var responseRecord = {key: record.key, value: recordValue, deleted: record.deleted==="true"}
    res.send(responseRecord)
  })
})

app.delete('/:table/:key', (req, res) => {
  var localKey = db.local.key.toString('hex')
  var recordKey = localKey + '/' + req.params.table + '/' + req.params.key
  del(recordKey, ()=>{
    res.send({success: true})
  })
})

app.delete('/:localkey/:table/:key', (req, res) => {
  var localKey = req.params.localkey
  var recordKey = localKey + '/' + req.params.table + '/' + req.params.key
  del(recordKey, ()=>{
    res.send({success: true})
  })
})

app.delete('/', (req, res) => {
  listRecords(arr=>{
    delAll(0, arr, ()=>{
      res.send({success: true})
    })
  })
})

app.post('/forsale', jsonParser, (req, res)=>{  
  var localKey = db.local.key.toString('hex')
  var recordPath = localKey +'/forsale'
  var recordKey = recordPath + '/' + req.body.key
  var value = ""
  if (typeof(req.body.value)==='string') {
    value = req.body.value
  } else {
    value = JSON.stringify(req.body.value)
  }
  insert(recordKey, value, ()=>{
    res.send({recordKey: recordKey, success: true })
  })
})

app.post('/offer', jsonParser, (req, res)=>{  
  var localKey = db.local.key.toString('hex')
  var peerKey = req.body.peer
  var recordPath = peerKey +'/offer'
  var recordKey = recordPath + '/' + req.body.key
  var value = req.body.value
  if (typeof(value)==='string') {
    var tmpValue = JSON.parse(value)
    tmpValue.peer = localKey
    value = JSON.stringify(value)
  } else {
    value.peer = localKey
    value = JSON.stringify(value)
  }
  
  insert(recordKey, value, ()=>{
    res.send({recordKey: recordKey, success: true, value: value })
  })
})

app.listen(port, () => console.log(`Http listening on port ${port}!`))

var key = '51f0304d4494cf220762eac44ea61ba37f342ebe173dc04f8e3d2829f1b36934'
var randomId = function(){
    return Math.floor(Math.random() * 190000) + 1
}
var records = []
var options = { recursive: true, reverse: true }
var identity =  {id: randomId(), key: randomId()}
var mesh = Mesh('./Databases/peer.db', key, identity)
var db = mesh.db

mesh.on('ready', function () {
  console.log('Local', db.local.key.toString('hex'))
  console.log('Bootstrap key', db.key.toString('hex'))
  register((key)=>{
    console.log('registered', key)
  })
  
  db.watch('/', function () {
    listRecords((arr)=>{
      console.log(arr.filter(comparer(records))[0])
      records = arr
    })
  })
})
function comparer(otherArray){
  return function(current){
    return otherArray.filter(function(other){
      return other.value == current.value && other.display == current.display
    }).length == 0;
  }
}
function listRecords(cb) {
    db.list(options, (err, data)=>{
      
      var arr = data.map((item) => { 
        var value = item[0].value
        if (typeof(value)==='string') {
          try { value = JSON.parse(value)} catch(err){ }
        }
        return { key: item[0].key, value: value } 
      })
      return cb(arr)
    })
}
function listPrefixedRecords(prefix, cb) {
  db.list(prefix, options, (err, data)=>{
      var arr = data.map((item) => { 
        var value = item[0].value
        if (typeof(value)==='string') {
          try { value = JSON.parse(value)} catch(err){ }
        }
        return { key: item[0].key, value: value } 
      })
      return cb(arr)
  })
}
function insert(key, value, cb){
  db.put(key, value, function (err) {
    return cb()
  })
}

function delAll(index, arr, cb){
  var key = arr[index].key
  //console.log(index, arr.length)
  db.del(key, ()=>{
    if (index === arr.length -1) {
      return cb()
    } else {
      delAll(index +1, arr, cb)
    }
  })
}

function register(cb){
  var localKey = db.local.key.toString('hex')
  insert('/peers/'+localKey, "", ()=>{
    return cb(localKey)
  })
}

function del(key, cb){
  db.del(key, ()=>{
    return cb()
  })
}

function list(key, cb) {
  db.list(key, options, (err, data)=>{
    var arr = data.map((item) => { 
      console.log("Item", item)
      var value = item[0].value
      console.log("-------value", value)
      if (typeof(value)==='string') {
        try { value = JSON.parse(value)} catch(err){ }
      }
      return { key: item[0].key, value: value } 
    })
    console.log("_____----Arr", arr)
    return cb(arr)
  })
}

function get(key, cb){
  db.get(key, (err, record)=>{
    return cb(err, record)
  })
}