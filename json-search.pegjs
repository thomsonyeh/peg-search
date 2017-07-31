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
}



start
  = compoundTerm

compoundTerm = disjunctive

disjunctive
  = ts:(conjunctive __ 'OR' __)+ t:conjunctive { return { '$OR': concatTo(ts.map(nth(0)), [t]) }; }
  / conjunctive

conjunctive
  = ts:((neg __ 'AND' __)/(neg __))+ t:neg { return { '$AND': concatTo(ts.map(nth(0)), [t]) }; }
  / neg

spaced
  = t:neg ts:(__ neg)+ { return { '$AND': concatTo([t], ts.map(nth(1))) }; }
  / neg

neg
  = '!' _ t:neg { return { '$NOT': t }; }
  / term

term 
  = simpleTerm
  / '(' _ t:compoundTerm _ ')' { return t; }
  // '!' _ t:compoundTerm { return { '$NOT': t }; }

simpleTerm = (! reservedWord)
  t:( compareCondition / lenCondition / quoted / bool / word / num ) { return t; }

reservedWord = 'AND' / 'OR' / '!' / '(' / ')' 



compareCondition
  = '<=' _ c:comparable { return { '$leq': c }; } 
  / '>=' _ c:comparable { return { '$geq': c }; }
  / '<' _ c:comparable { return { '$lt': c }; }
  / '>' _ c:comparable { return { '$gt': c }; }

comparable = lenCondition / num

lenCondition
  = 'len'i _ '(' _ i:int _ ')' { return { '$len': i }; }



quoted = '"' qc:(quotedChar *) '"' { return { '$quoted': qc.join('') }; }

quotedChar
  = escapeSeq:('\\' . ) { return JSON.parse(quotes(escapeSeq.join(''))); }
  / [^"\\]


bool
  = 'true' { return true; }
  / 'false' { return false; }



word = $(wordFirstChar (wordChar *)) // $ returns just the literal text matched

wordFirstChar = (! whitespace) [^0-9.] 

wordChar = (! whitespace) .



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
