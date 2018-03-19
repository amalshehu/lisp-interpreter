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

export const expressionEvaluator = p => {
  return code => {
    if (code === undefined) return null
    let fetched
    for (let parser of p) {
      fetched = parser(code)
      if (fetched != null) {
        return fetched
      }
    }
    return null
  }
}

const parse = program => {
  parsed = []
  if (program[0] != '(') return null
  program.slice(1)
  while (program[0] != ')') {
    space(program) ? (program = space(program)[1]) : program
  }
  console.log('Parsed', parsed)
}
parse('(define x 100))')
