// let REPL = require('repl')

// REPL.start({
//   prompt: '>>> ',
//   ignoreUndefined: true,
//   eval: (expr, context, filename, callback) => {
//     callback(null, valueParser(expr))
//   }
// })

let ENV = {}

const skipSpace = code => {
  let match = code.match(/^\s+/)
  return match ? [match[0], code.replace(/^\s+/, '')] : null
}

const extractNum = code => {
  let match = code.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/)
  return match ? [parseFloat(match[0]), code.slice(match[0].length)] : null
}

const extractOperator = code => {
  let match = code.match(/^(\+|-|\*|\/|=|>|<|>=|<=)/)
  return match ? [match[0], code.slice(match[0].length)] : null
}

const extractString = code => {
  let match
  return code && code.startsWith('"') ?
    ((match = code.match(/^"(?:\\"|.)*?"/)),
      match && match[0] != undefined ? [match[0].slice(1, -1), code.replace(match[0], '')] :
      SyntaxError('Syntax Error')) :
    null
}
const extractIf = code => {
  if (!code.startsWith('if')) return null
  code = code.slice(2)
  let value = valueParser(code)
  if (value == null) {
    skipSpace(code) ? (code = skipSpace(code)[1]) : code
    const ifRe = /(\(.+?\))\s*(\(.+?\))\s*(\(.+?\))/
    let match = code.split(ifRe).filter(Boolean)
    return [
      valueParser(match[0])[0] ?
      valueParser(match[1])[[0]] :
      valueParser(match[2])[0],
      match[3]
    ]
  }
  return [value[0], value[1]]
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
  if (!code.startsWith('(')) {
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
    // if (!code.includes(')')) throw Error('Expected closing.')
    if (code.startsWith(')')) {
      return [evaluateExpr(box), code.slice(1)]
    }
  }
  return [box, code.slice(1)]
}

const evaluateExpr = code => {
  const key = code[0]
  if (key && code.length > 1) {
    code = code.slice(1)
    if (code.length == 1 && key == '-') {
      return parseFloat(`${key}${code[0]}`)
    }
    return code.reduce(nativeFunctions[key])
  }
  return code
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
const valueParser = factory([
  parseExpr,
  extractString,
  extractNum,
  extractOperator,
  extractIf
])

console.log(valueParser('(if (< 10 5) (+ 1 1) (+ 3 3))'))