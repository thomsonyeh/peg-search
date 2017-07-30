const util = require('util');
const parser = require('./json-search.js');

tests = ['asdf',
         '"asdf"',
         'asdf jkl',
         '"asdf" "jkl"',
         '"asdf" jkl'];

for (let t of tests) {
  console.log('test case: ' + t);
  console.log(util.inspect(parser.parse(t), {depth: null}));
  console.log('\n');
}
