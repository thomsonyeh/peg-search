{
  function nth (i) {
    return function (l) { return l[i]; };
  }

  function collectSpacedItems (leading_tuples, trailing_item) {
    var items = leading_tuples.map(nth(0));
    items.push(trailing_item);
    return items;
  }

  function concatTo (l1, l2) {
    l1.push.apply(l1, l2);
    return l1;
  }

  function quotes (s) {
    return '"' + s + '"';
  }

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
}



start
  = compoundTerm

compoundTerm = disjunctive

disjunctive
  = ts:(conjunctive __ 'OR' __)+ t:conjunctive { return OR( collectSpacedItems(ts, t) ); }
  / conjunctive

conjunctive
  = ts:((neg __ 'AND' __)/(neg __ !('OR')))+ t:neg { return AND( collectSpacedItems(ts, t) ); }
  / neg

neg
  = '!' _ t:neg { return NOT( t ); }
  / term

term 
  = simpleTerm
  / '(' _ t:compoundTerm _ ')' { return t; }

simpleTerm = (! reservedWord)
  t:( compareCondition / lenCondition / quoted / bool / word / num ) { return t; }

reservedWord = 'AND' / 'OR' / '!' / '(' / ')' 



compareCondition
  = '<=' _ c:comparable { return leq( c ); } 
  / '>=' _ c:comparable { return geq( c ); }
  / '<' _ c:comparable { return lt( c ); }
  / '>' _ c:comparable { return gt( c ); }

comparable = lenCondition / num

lenCondition
  = 'len'i _ '(' _ i:int _ ')' { return len( i ); }



quoted = '"' qc:(quotedChar *) '"' { return quoted( qc.join('') ); }

quotedChar
  = escapeSeq:('\\' . ) { return JSON.parse(quotes(escapeSeq.join(''))); }
  / [^"\\]



bool
  = 'true' { return true; }
  / 'false' { return false; }



word = $(wordFirstChar (wordChar *)) // $ returns just the literal text matched

wordFirstChar = (! whitespace) [^0-9.()] 

wordChar = wordFirstChar / [0-9.]



num
  = fractional
  / i:int f:fractional { return i + f }
  / int

fractional = '.' digits:[0-9]+ { return parseFloat('.' + digits.join('')); }

int = digits:[0-9]+ { return parseInt(digits.join('')); }



whitespace
  = [ \t\r\n]

// optional whitespace
_ = whitespace *

// mandatory whitespace
__ = whitespace +
