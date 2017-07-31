{
  function nth (i) {
    return function (l) { return l[i]; };
  }

  function collectSpacedItems (leading_item, trailing_tuples, tuple_index) {
    var items = [leading_item];
    items.push.apply(items, trailing_tuples.map(nth(tuple_index)));
    return items;
  }

  function concatTo (l1, l2) {
    l1.push.apply(l1, l2);
    return l1;
  }
}



start
  = spacedTerms

compoundTerm
  = '(' _ t:compoundTerm _ ')' { return t; }
  / '!' _ t:compoundTerm { return {'$NOT': t }; }
  / ts:(compoundTerm __ 'OR' __)+ t:compoundTerm { return { '$OR': concatTo(ts.map(nth(0)), [t]) }; }
  / ts:(compoundTerm __ 'AND' __)+ t:compoundTerm { return { '$AND': concatTo(ts.map(nth(0)), [t]) }; }
  / spacedTerms




spacedTerms = t:term ts:(__ term)* { return { '$AND': concatTo([t], ts.map(nth(1))) }; }

term
  = '(' _ ts:spacedTerms _ ')' { return ts; }
  / '!' _ t:term { return { '$NOT': t }; }
  / (! reservedWord)
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
  = '\\' escaped:. { return unescape('\\' + escaped); }
  / $([^"])



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
