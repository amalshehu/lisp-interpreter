// let REPL = require('repl')

// REPL.start({
//   prompt: '>>> ',
//   ignoreUndefined: true,
//   eval: (expr, context, filename, callback) => {
//     callback(null, valueParser(expr))
//   }
// })

let ENV = {}

const nativeFunctions = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  '*': (a, b) => a * b,
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  condition: (a, b, c) => (a ? b : c),
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '==': (a, b) => a == b,
  '===': (a, b) => a === b
}

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
  return code && code.startsWith('"')
    ? ((match = code.match(/^"(?:\\"|.)*?"/)),
      match && match[0] != undefined
        ? [match[0].slice(1, -1), code.replace(match[0], '')]
        : SyntaxError('Syntax Error'))
    : null
}
const extractIf = code => {
  if (!code.startsWith('if')) return null
  code = code.slice(2)
  let ifArray = []
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  while (!code.startsWith(')')) {
    // const ifRe = /(\(.+?\))\s*(\(.+?\))\s*(\(.+?\))/
    // let match = code.split(ifRe).filter(Boolean)
    // console.log('m', match)

    let value = valueParser(code)
    if (value != null) {
      ifArray.push(value[0])
      code = value[1]
      skipSpace(code) ? (code = skipSpace(code)[1]) : code
    }
  }
  if (code.startsWith(')') && ifArray.length == 3) return [ifArray, code]
  return null
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
      if (nativeFunctions.hasOwnProperty(box[0])) {
        return [evaluateExpr(box), code.slice(1)]
      } else [box, code.slice(1)]
    }
  }
  return [box, code.slice(1)]
}

const evaluateExpr = code => {
  const key = code[0]
  if (code.length > 2) {
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

console.log(
  JSON.stringify(
    valueParser(
      '(if (< 2 5) (if (> 20 10) (+ 1 1) (+ 3 3)) (if (> 20 10) (+ 1 1) (+ 3 3)))'
    )
  )
)
