{
  function fst (l) {
    return l[0];
  }

  function collectSpacedItems (item_space_pairs, trailing_item) {
    var items = item_space_pairs.map(fst);
    items.push(trailing_item);
    return items;
  }
}



start
  = compoundTerm

compoundTerm
  = '(' _ t:compoundTerm _ ')' { return t; }
  / ts:(spacedTerms __ 'OR' __) t:spacedTerms { return { '$OR': collectSpacedItems(ts, t) }; }
  / spacedTerms



spacedTerms = t:term ts:(term __)* { return { '$AND': collectSpacedItems(ts, t) }; }

term
  = (! reservedWord)
  ( compareCondition
  / lenCondition
  / quoted
  / bool
  / word
  / num )

reservedWord = 'AND' / 'OR'


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
