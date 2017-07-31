const util = require('util');
const parser = require('./json-search.js');
const _ = require('lodash');

function wrap (tag) {
  return function (contents) {
    var wrapped = {};
    wrapped[tag] = contents;
    return wrapped;
  };
}

var lt = wrap('$lt');
var gt = wrap('$gt');
var leq = wrap('$leq');
var geq = wrap('$geq');
var len = wrap('$len');
var quoted = wrap('$quoted');

var AND = wrap('$AND');
var OR = wrap('$OR');
var NOT = wrap('$NOT');


function prettyPrint (obj) {
  console.log(JSON.stringify(obj), null, 2);
}

tests = [
  [ 
    'asdf',
    'asdf',
    'raw (unquoted) string'
  ],
  [
    '"asdf"',
    quoted('asdf'),
    'quoted string'
  ],
  [
    '42',
    42,
    'raw integer'
  ],
  [
    '4.2',
    4.2,
    'raw float'
  ],
  [
    '.42',
    .42,
    'raw float leading with decimal point'
  ]
]    

for (let t of tests) {
  var test_input = t[0];
  var expected_output = t[1];
  var test_description = t[2];
  console.log('input: ', test_input)
  var output = parser.parse(test_input);
  if (_.isEqual(output, expected_output)) {
    console.log('PASSED');
  } else {
    console.log('FAILED');
    console.log('expected:');
    prettyPrint(expected_output);
    console.log('got:');
    prettyPrint(output);
    console.log('test description: ' + test_description);
  }
  console.log('\n');
}
