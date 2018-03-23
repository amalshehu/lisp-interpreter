let REPL = require('repl')

REPL.start({
  prompt: '>>> ',
  ignoreUndefined: true,
  eval: (expr, context, filename, callback) => {
    callback(null, valueParser(expr)[0])
  }
})

let ENV = {}

const nativeFunctions = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  '*': (a, b) => a * b,
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '=': (a, b) => a == b,
  min: (a, b) => Math.min(a, b),
  max: (a, b) => Math.max(a, b)
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
  const op = code.slice(0, code.indexOf(' '))
  if (nativeFunctions[op]) {
    return [op, code.replace(op, '')]
  }
  return null
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

const conditionSplitter = code => {
  let arr = []
  const re = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/
  let i = 3
  while (i != 0) {
    try {
      let m = code.match(re)
      arr.push(m[0])
      code = code.slice(m[0].length)
      i--
    } catch (error) {
      throw SyntaxError('Invalid IF Syntax')
    }
  }
  return arr
}
const extractDefine = code => {
  if (!code.startsWith('define')) return null
  code = code.slice(6)
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  const symbol = code.slice(0, code.indexOf(' '))
  code = code.slice(symbol.length)
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  value = valueParser(code)
  if (value) {
    ENV[symbol] = value[0]
    console.log(`value ${value[0]} assigned to ${symbol}`)
  }
  return [value[0], value[1]]
}

const extractIf = code => {
  if (!code.startsWith('if')) return null
  code = code.slice(2)
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  const ifAst = conditionSplitter(code)
  let value
  value = valueParser(ifAst[0])
  code = code.replace(ifAst[0], '')
  if (value[0]) {
    value = valueParser(ifAst[1])[0]
    code = code.replace(ifAst[1], '')
    code = code.replace(ifAst[2], '')
  } else {
    value = valueParser(ifAst[2])[0]
    code = code.replace(ifAst[1], '')
    code = code.replace(ifAst[2], '')
  }
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  if (code.startsWith(')')) return [value, code]
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
    if (code.startsWith(')')) {
      if (nativeFunctions.hasOwnProperty(box[0])) {
        return [evaluateExpr(box), code.slice(1)]
      } else [box, code.slice(1)]
    }
  }
  if (code.slice(1) != '') {
    code = code.slice(1)
    skipSpace(code) ? (code = skipSpace(code)[1]) : code
    return valueParser(code)
  } else return [...box, code.slice(1)]
}
  return [...box, code.slice(1)]
}

const evaluateExpr = code => {
  const key = code[0]
  // if (!nativeFunctions.hasOwnProperty(key)) {
  //   const msg = `${key} is not a function [(anon)]]`
  //   throw Error(`\x1b[31m${msg}\x1b[0m`)
  // }
    code = code.slice(1)
  if (code.length == 1) {
    switch (key) {
      case '-':
        return Number(`${key}${code[0]}`)
      case '+':
        return code[0]
      case '*':
        return 1 * code[0]
      case '/':
        return 1 / code[0]
      default:
        break
    }
    }
  if (code.length > 1) {
    return code.reduce(nativeFunctions[key])
  }
  return code
}
const factory = parsers => {
  return text => {
    if (text === undefined) return null
    let out
    for (let parser of parsers) {
      out = parser(text)
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
  extractIf,
  extractDefine
])

// console.log(valueParser('(< 1 10)'))
// console.log(valueParser('(<= 15 10)'))
// console.log(valueParser('(+ 8 1 0 9 0)'))
// console.log(valueParser('(+ 2 3 5)'))
// console.log(valueParser('(- 4 3 1)'))
// console.log(valueParser('(* 2 3 2)'))
// console.log(valueParser('(/ 4 2 2)'))
// console.log(valueParser('(+ (+ 1 2) (+ 3 4) 87)'))
// console.log(valueParser('(- (+ 1 2 9 9) (* 3 4) 87)'))
// console.log(valueParser('(+ (* 6 9) (/ 9 4) 9)'))
// console.log(valueParser('(min 1 8 3 4 5)'))
// console.log(valueParser('(max 1 8 3 4 5)'))
// console.log(valueParser('(+ (* 6 9) (/ 9 4) 9)'))
// console.log(valueParser('(if (<= 1 1) (+ 2 2) (+ 1 1))'))
// console.log(valueParser('(if (< 1 2) (+ 6 9) (+ 9 4))'))
// console.log(valueParser('(if (> 1 2) (+ 6 9) (+ 9 4))'))
// console.log(
//   valueParser('(if (< 10 20) (+ 1 1) (+ 3 3)) (if (< 10 20) (+ 8 1) (+ 5 3))')
// )
// console.log(valueParser('(if (< 1 2) (if (< 2 1) (+ 1 1) (+ 3 3)) (+ 4 4))'))
// console.log(valueParser('(1 2)'))
console.log(valueParser('(define x 10)'))
