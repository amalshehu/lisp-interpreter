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

const number = code => {
  let match = code.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/)
  return match ? [parseFloat(match[0]), code.slice(match[0].length)] : null
}

const operator = code => {
  let match = code.match(/^(\+|-|\*|\/|=|>|<|>=|<=)/)
  return match ? [match[0], code.slice(match[0].length)] : null
}

const stringx = code => {
  let match
  return code && code.startsWith('"')
    ? ((match = code.match(/^"(?:\\"|.)*?"/)),
      match && match[0] != undefined
        ? [match[0].slice(1, -1), code.replace(match[0], '')]
        : SyntaxError('Syntax Error'))
    : null
}
const ifx = code => {
  if (!code.slice(1).startsWith('if')) return null
  else {
    code = code.slice(3)
    skipSpace(code) ? (code = skipSpace(code)[1]) : code
    let match = code.split(/(\(.+?\))/)
    console.log(match)

    // return valueParser(match[0]) ? valueParser(match[1]) : valueParser(match[2])
  }
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
const valueParser = factory([stringx, number, operator, parseExpr])
const splValueParser = factory([ifx])

console.log(ifx('(if (> 10 20) (+ 1 1) (+ 3 3))'))
