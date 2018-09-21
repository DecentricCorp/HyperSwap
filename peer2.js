const Mesh = require('hyperdb-mesh')
const express = require('express')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json() 
const app = express()
const port = 4000

app.get('/', (req, res) => {
  listRecords(arr=>{
    res.send(arr)
  })
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
    getItems(0, peers, template, (populated)=>{
      res.send(populated)
    })
    function getItems(index, arr, template, cb){
      var peer = arr[index].peer
      listPrefixedRecords(peer + '/forsale', (records)=>{
        template[index].items = records
        if (index === arr.length -1) {
          return cb(template)
        } else {
          return getItems(index + 1, arr, template, cb)
        }
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
var mesh = Mesh('./Databases/peer2.db', key, identity)
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

function get(key, cb){
  db.get(key, (err, record)=>{
    return cb(err, record)
  })
}