const express = require('express')
const app = express()

var parser = require('./json-search.js')

app.get('/', function (req, res) {
  res.send('<h2>asdf</h2>')
})

app.listen(3000, function () {
  console.log('server listening on port 3000')
})
