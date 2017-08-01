var parser_module = './json-search.js'
delete require.cache[parser_module]

const util = require('util');
const parser = require(parser_module);
var isEqual = require('lodash/isEqual');

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
  console.log(JSON.stringify(obj, null, 2));
}

tests = [
  [ 
    'asdf',
    'asdf',
    'raw (unquoted) string'
  ],
  [
    '"asdf"',
    quoted( 'asdf' ),
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
  ],
  [
    'len(42)',
    len( 42 ),
    'length condition'
  ],
  [
    'len ( 42 )',
    len( 42 ),
    'length condition with whitespace'
  ],
  [
    '< 10',
    lt( 10 ),
    'less-than comparison'
  ],
  [
    '<10',
    lt( 10 ),
    'comparison without whitespace'
  ],
  [
    '<= 10',
    leq( 10 ),
    'less-than-or-equal comparison'
  ],
  [
    '> 10',
    gt( 10 ),
    'greater-than comparison'
  ],
  [
    '>= 10',
    geq( 10 ),
    'greater-than-or-equal comparison'
  ],
  [
    '>= 1.5',
    geq( 1.5 ),
    'comparison on float'
  ],
  [
    '>= .5',
    geq( .5 ),
    'comparison on float with leading decimal point'
  ],
  [
    '> len(80)',
    gt( len( 80 ) ),
    'comparison on len condition'
  ],
  [
    '<len (80 )',
    lt( len( 80 ) ),
    'comparison on len condition with different spacing'
  ],
  [
    'a1',
    'a1',
    'raw word with a digit in it'
  ],
  [
    '"a1"',
    quoted( 'a1' ),
    'quoted word with a digit in it'
  ],
  [
    '"1a"',
    quoted( '1a' ),
    'quoted word leading with a digit'
  ],
  [
    '"a b c"',
    quoted( 'a b c' ),
    'quoted string wtih spaces'
  ],
  [
    '"a1 b2 3c"',
    quoted( 'a1 b2 3c' ),
    'quoted string with space-separated words containing digits'
  ],
  [
    '"this input ends in a newline character\n"',
    quoted( 'this input ends in a newline character\n' ),
    'quoted newline character'
  ],
  [
    '"\\""',
    quoted( '"' ),
    'quoted string containing an escaped double quote character (input: backslash character followed by double quote character)'
  ],
  [
    '"\\\\"',
    quoted( '\\' ),
    'quoted string containing an escaped backslash character (input: two consecutive backslash characters)'
  ],
  [
    '"\\n"',
    quoted( '\n' ),
    'quoted string containing an escaped newline character (input: backslash character followed by n)'
  ],
  [
    'true',
    true,
    'boolean value true'
  ],
  [
    'false',
    false,
    'boolean value false'
  ],
  [
    'TRUE',
    'TRUE',
    'raw word TRUE - not parsed as boolean due to case sensitivity'
  ],
  [
    '"false"',
    quoted( 'false' ),
    'quoted text "false" - not parsed as boolean due to quotes'
  ],
  [
    '1 2',
    AND( [1,2] ),
    'two space-separated terms implicitly ANDed together'
  ],
  [
    '1 2 3 4 5',
    AND( [1,2,3,4,5] ),
    'multiple space-separated terms implicitly ANDed together'
  ],
  [
    'a OR b',
    OR( ['a','b'] ),
    'two terms ORed together'
  ],
  [
    '1 OR 2 OR 3 OR 4',
    OR( [1,2,3,4] ),
    'multiple terms ORed together'
  ],
  [
    'a AND b',
    AND( ['a','b'] ),
    'two terms explicitly ANDed together'
  ],
  [
    '1 AND 2 AND 3 AND 4',
    AND( [1,2,3,4] ),
    'multiple terms explicitly ANDed together'
  ],
  [
    '5 and 6',
    AND( [5, 'and', 6] ),
    'lowercase "and" parsed as a word, not a logical operator'
  ],
  [
    '7 or 8',
    AND( [7, 'or' ,8] ),
    'lowercase "or" parsed as a word, not a logical operator'
  ],
  [
    '1 "AND" 2',
    AND( [1, quoted( 'AND' ), 2]),
    'quoted uppercase "AND" parsed as a string, not a logical operator'
  ],
  [
    '1 "OR" 2',
    AND( [1, quoted( 'OR' ), 2]),
    'quoted uppercase "OR" parsed as a string, not a logical operator'
  ],
  [
    '1 AND 2 3 AND 4',
    AND( [1,2,3,4] ),
    'implicit and explicit ANDs in combination'
  ],
  [
    '1 AND 2 OR 3 AND 4',
    OR( [AND( [1,2] ), AND( [3,4] )] ),
    'logical operator nesting; AND taking precedence over OR'
  ],
  [
    '1 2 OR 3 4',
    OR( [AND( [1,2] ), AND( [3,4] )] ),
    'logical operator nesting; implicit AND taking precedence over OR'
  ],
  [
    '(hello)',
    'hello',
    'naked parenthesized term'
  ],
  [
    '1 (2 OR 3) 4',
    AND( [1, OR( [2,3] ), 4] ),
    'using parentheses to override default operator precedence'
  ],
  [
    '1 AND (2 OR 3) AND 4',
    AND( [1, OR( [2,3] ), 4] ),
    'using parentheses to override default operator precedence'
  ],
  [
    '1 OR (2 AND (3 OR (4 AND (5 OR 6))))',
    OR( [1, AND( [2, OR( [3, AND( [4, OR( [5,6] )] )] )] )] ),
    'deeper nesting using parentheses'
  ],
  [
    '!1',
    NOT( 1 ),
    'not operator'
  ],
  [
    '! 1',
    NOT( 1 ),
    'not operator with whitespace'
  ],
  [
    '!1 2',
    AND( [NOT( 1 ), 2] ),
    'not operator applying non-greedily to next term'
  ],
  [
    '!(1 2) 3',
    AND( [NOT( AND( [1,2] ) ), 3] ),
    'not operator applying to parenthesized compound term'
  ],
  [
    '!!1',
    NOT( NOT( 1 ) ),
    'double negation'
  ],
  [
    '! ! ! hello',
    NOT( NOT( NOT( 'hello' ) ) ),
    'triple negation with whitespace'
  ],
  [
    '!(!1 OR 2) (3 OR (4 AND 5))',
    AND( [NOT( OR( [NOT( 1 ), 2] ) ), OR( [3, AND( [4,5] )] )] ),
    'complex nesting of various logical operators'
  ],
  [
    '>=400 <500',
    AND( [geq( 400 ), lt( 500 )] ),
    'miscellaneous test case'
  ],
  [
    '"TEST DATA" OR len ( 9 )',
    OR( [quoted( 'TEST DATA' ), len( 9 )] ),
    'miscellaneous test case'
  ],
  [
    '"TEST DATA" OR > len(9)',
    OR( [quoted( 'TEST DATA' ), gt( len( 9 ) )] ),
    'miscellaneous test case'
  ],
  [
    '!false',
    NOT( false ),
    'miscellaneous test case'
  ]
]

var passed = 0;
var failed = 0;
for (let t of tests) {
  var test_input = t[0];
  var expected_output = t[1];
  var test_description = t[2];
  try {
    var output = parser.parse(test_input);
  } catch (e) {
    var output = e.toString();
  } finally{
    if (isEqual(output, expected_output)) {
      passed++;
    } else {
      console.log('FAILED');
      console.log('input string: ', test_input)
      console.log('expected:');
      prettyPrint(expected_output);
      console.log('got:');
      prettyPrint(output);
      console.log('test description: ' + test_description);
      console.log();
      failed++;
    }
  }
}
console.log(passed + ' tests passed, ' + failed + ' failed');
