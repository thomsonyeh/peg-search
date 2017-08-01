const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const parser = require('./json-search.js')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('<h2>asdf</h2>')
})

app.post('/api/search_rule', function (req, res) {
  console.log(res.body);
  res.json(parser.parse(req.body['queryString']));
})

app.listen(3000, function () {
  console.log('server listening on port 3000')
})
