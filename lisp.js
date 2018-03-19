// let readline = require('readline')

// let reader = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   terminal: true
// })
// reader.on('line', line => {
//   let tokens = tokenize(line)
//   parse(tokens)

//   reader.close()
// })

let ENV = {}

const spaceRe = /^\s+|\s+$/
const space = str => {
  let match
  return (str && str.startsWith(' ')) || (str && str.startsWith('\n'))
    ? ((match = str.match(spaceRe)),
      match ? [match[0], str.replace(spaceRe, '')] : null)
    : null
}

const parse = tokens => {
  parsed = []
  if (tokens[0] != '(') return null
  tokens.shift()
  while (tokens[0] != ')') {
    parsed.push(tokens[0])
    tokens.shift()
  }
  console.log('Parsed', parsed)
}
parse(tokenize('(define square (lambda(x)(x * x)))'))
