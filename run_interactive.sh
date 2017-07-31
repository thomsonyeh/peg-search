pegjs $1 json-search.pegjs && node -e "var p = require('./json-search.js'); function parse(s) { console.log(JSON.stringify(p.parse(s), null, 2)); };" -i
