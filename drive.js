var multidrive = require('hyperdrive-multiwriter')
var hyperdrive = require('hyperdrive')
var level = require('level')
var sub = require('subleveldown')

var location = process.argv[2] || '/tmp/a'
var command = process.argv[3] || 'write'
var file = process.argv[4] || 'hello.txt'
var db = level(location)
var mdrive = multidrive({
  db: db,
  drive: hyperdrive(sub(db,'d'))
})

if (command === 'list') {
  mdrive.list(function (err, entries) {
    entries.forEach(function (entry) {
      console.log(JSON.stringify(entry))
    })
  })
} else if (command === 'read') {
  var entry = JSON.parse(file)
  mdrive.createFileReadStream(entry).pipe(process.stdout)
} else if (command === 'write') {
  process.stdin.pipe(mdrive.createFileWriteStream(file))
} else if (command === 'sync') {
  var r = mdrive.replicate()
  process.stdin.pipe(r).pipe(process.stdout)
}