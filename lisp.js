// let REPL = require('repl')

// REPL.start({
//   prompt: '>>> ',
//   ignoreUndefined: true,
//   eval: (expr, context, filename, callback) => {
//     callback(null, valueParser(expr))
//   }
// })

let ENV = {}

const skipSpace = str => {
  const spaceRe = /^\s+|\s+$/
  let match
  return (str && str.startsWith(' ')) || (str && str.startsWith('\n')) ?
    ((match = str.match(spaceRe)),
      match ? [match[0], str.replace(spaceRe, '')] : null) :
    null
}

const number = str => {
  const numRe = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/
  let match = str.match(numRe)
  if (match) {
    return [parseFloat(match[0]), str.slice(match[0].length)]
  }
  return null
}

const operator = code => {
  const opRe = /^(\+|-|\*|\/|=|>|<|>=|<=)/
  let match = code.match(opRe)
  return match ? [match[0], code.replace(opRe, '')] : null
}

const stringx = code => {
  let match
  const strRe = /^"(?:\\"|.)*?"/
  return code && code.startsWith('"') ?
    ((match = code.match(strRe)),
      match && match[0] != undefined ? [match[0], code.replace(match[0], '')] :
      SyntaxError('Syntax Error')) :
    null
}

const nativeFunctions = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  '*': (a, b) => a * b,
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '==': (a, b) => a == b,
  '===': (a, b) => a === b
}

const parseExpr = code => {
  if (code != undefined && !code.startsWith('(')) {
    return null
  }
  let box = []
  code = code.slice(1)
  while (code[0] !== ')') {
    skipSpace(code) ? (code = skipSpace(code)[1]) : code
    const factoryOut = valueParser(code)
    if (factoryOut) {
      box.push(factoryOut[0])
      code = factoryOut[1]
    }
    if (!code.includes(')')) throw Error('Expected closing.')
    if (code.startsWith(')')) {
      return [evaluateExpr(box), code.slice(1)]
    }
  }
  return [box, code.slice(1)]
}
const evaluateExpr = code => {
  const key = code[0]
  code = code.slice(1)
  if (code.length == 1 && key == '-') {
    return parseFloat(`${key}${code[0]}`)
  }
  return code.reduce(nativeFunctions[key])
}
const factory = parsers => {
  return text => {
    if (text === undefined) return null
    let out
    for (let parser of parsers) {
      try {
        out = parser(text)
      } catch (error) {
        console.log(error)
      }
      if (out != null) {
        return out
      }
    }
    return null
  }
}
const parsers = [stringx, number, operator, parseExpr]

const valueParser = factory(parsers)

console.log(valueParser('(+ 10 20 (+ 5 3)(- 30))'))