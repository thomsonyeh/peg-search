start
  = numList

numList
  = n:num "," nl:numList { return [n] + nl; }
  / n:num { return [n]; }

num
  = [0-9]
