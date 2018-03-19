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
const expressionEvaluator = code => {
  token = code.substr(0, code.indexOf(' '))
  code = code.slice(1)
  space(code) ? (code = space(code)[1]) : code
  switch (token) {
    case '+':
      const sum = (a, b) => a + b
      return [numberEvaluator(code)[0].reduce(sum), numberEvaluator(code)[1]]
    case '-':
      const sub = (a, b) => a - b
      return [numberEvaluator(code)[0].reduce(sub), numberEvaluator(code)[1]]
    case 'define':
      return number(code)
      break
    default:
      break
  }
}

let numArray = []

const numberEvaluator = code => {
  token = code.substr(0, code.indexOf(' '))
  if (!isFinite(token)) return null
  if (code === ')') {
    return [numArray, code]
  }
  parseNumbers = number(code)
  numArray.push(parseNumbers[0])
  code = parseNumbers[1]
  space(code) ? (code = space(code)[1]) : code
  return numberEvaluator(code)
}
const spaceRe = /^\s+|\s+$/
const space = str => {
  let match
  return (str && str.startsWith(' ')) || (str && str.startsWith('\n'))
    ? ((match = str.match(spaceRe)),
      match ? [match[0], str.replace(spaceRe, '')] : null)
    : null
}

const numRe = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/
const number = str => {
  let match = str.match(numRe)
  if (match) {
    return [parseFloat(match[0]), str.slice(match[0].length)]
  }
  return null
}

const parse = program => {
  let extracted
  if (program[0] != '(') return null
  program = program.slice(1)
  while (program != ')') {
    space(program) ? (program = space(program)[1]) : program
    extracted = expressionEvaluator(program)
    if (extracted) {
      program = extracted[1]
    }
  }
  return [extracted[0], program.slice(1)]
}
console.log(parse('(- 1 2 3)'))
