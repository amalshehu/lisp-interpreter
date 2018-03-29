let ENV = {
  pi: 3.14159265359
}
let REPL = require('repl')

const relational = (acc, cur, i, ar, op) => {
  let result = true
  let prev = ar[0]
  if (!result) return false
  result = eval(`${prev} ${op} ${cur}`)
  prev = cur
  return result ? true : false
}

const nativeFunctions = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  '*': (a, b) => a * b,
  '<': (acc, cur, i, ar) => relational(acc, cur, i, ar, '<'),
  '>': (acc, cur, i, ar) => relational(acc, cur, i, ar, '>'),
  '<=': (acc, cur, i, ar) => relational(acc, cur, i, ar, '<='),
  '>=': (acc, cur, i, ar) => relational(acc, cur, i, ar, '>='),
  '=': (acc, cur, i, ar) => relational(acc, cur, i, ar, '=='),
  min: (a, b) => Math.min(a, b),
  max: (a, b) => Math.max(a, b),
  abs: (a, b) => Math.abs(a, b),
  round: (a, b) => Math.round(a, b)
}

const skipSpace = code => {
  let match = code.match(/^\s+/)
  return match ? [match[0], code.replace(/^\s+/, '')] : null
}

const extractNum = code => {
  let match = code.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/)
  return match ? [parseFloat(match[0]), code.slice(match[0].length)] : null
}

const extractSymbol = code => {
  const symbol = code.slice(0, code.indexOf(' '))
  code = code.replace(symbol, '')
  const preDefValue = ENV[symbol]
  if (preDefValue) {
    if (typeof preDefValue === 'function') {
      skipSpace(code) ? (code = skipSpace(code)[1]) : code
      let args = valueParser(code)
      return [preDefValue(args[0]), args[1]]
    }
    return [preDefValue, code]
  }
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

const extractBoolean = code => {
  return code.startsWith('#f')
    ? ['#f', code.slice(2)]
    : code.startsWith('#t') ? ['#t', code.slice(2)] : null
}

const conditionSplitter = code => {
  // Splits if condition using regex into an array.
  let arr = []
  const re = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/
  let i = 3
  while (i != 0) {
    try {
      // WIP
      skipSpace(code) ? (code = skipSpace(code)[1]) : code
      let m = code.startsWith('(') ? code.match(re) : code.match(/([^\s]+)/)
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
  let value = valueParser(code)
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
  let condition = valueParser(ifAst[0])[0]
  let value =
    (condition && condition != '#f') || condition === '#t'
      ? valueParser(ifAst[1])[0]
      : valueParser(ifAst[2])[0]
  code = code
    .replace(ifAst[0], '')
    .replace(ifAst[1], '')
    .replace(ifAst[2], '')
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  if (code.startsWith(')')) return [value, code]
  return null
}

const checkValuesLength = results => {
  const conditonalOperators = ['<', '>', '<=', '>=', '=']
  if (results.length <= 2 && conditonalOperators.includes(results[0])) {
    const msg = `${results[0]}: too few arguments (at least: 2 got: 1) [${
      results[0]
    }]`
    throw Error(`\x1b[31m${msg}\x1b[0m`)
  }
}

const lambdaSplitter = code => {
  let arr = []
  const re = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/
  let i = 2
  while (i != 0) {
    try {
      skipSpace(code) ? (code = skipSpace(code)[1]) : code
      let m = code.startsWith('(') ? code.match(re) : code.match(/([^\s]+)/)
      arr.push(m[0])
      code = code.slice(m[0].length)
      i--
    } catch (error) {
      throw SyntaxError('Invalid Lambda Syntax')
    }
  }
  return arr
}

const lambdaObjectComposer = (args, body) => {
  // WIP
  const lambda = {
    arguments: args
      .slice(1, -1)
      .split(' ')
      .reduce((obj, cur, i) => {
        return {
          ...obj,
          [cur]: null
        }
      }, {}),
    fnBody: body,
    params: [],
    fetchAndUpdateArgs: function(argValues) {
      Object.keys(argValues).map(key => {
        this.arguments.hasOwnProperty(key)
          ? (this.arguments[key] = argValues[key])
          : SyntaxError('Args not found')
      })
    },
    compute: function(params) {
      this.fetchAndUpdateArgs(params)
      for (var key in this.arguments) {
        this.fnBody = this.fnBody.replace(
          new RegExp(`${key}`, 'gi'),
          this.arguments[key]
        )
      }
    }
  }
  return lambda
}

const extractLambda = code => {
  if (!code.startsWith('lambda')) return null
  // Extract variables
  code = code.slice(6)
  result = lambdaSplitter(code)
  // Eval body
  func = lambdaObjectComposer(result[0], result[1])
  code = code.replace(result[0], '').replace(result[1], '')
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  return [func, code]
}

const parseExpr = code => {
  if (!code.startsWith('(')) {
    return null
  }
  let results = []
  code = code.slice(1)
  while (code[0] !== ')') {
    skipSpace(code) ? (code = skipSpace(code)[1]) : code
    try {
      const result = valueParser(code)
      results.push(result[0])
      code = result[1]
    } catch (error) {
      throw Error(error)
    }
    if (code.startsWith(')')) {
      // Error handler
      if (nativeFunctions.hasOwnProperty(results[0])) {
        checkValuesLength(results)
        // Returns evaluated values from results array.
        return [evaluateExpr(results), code.slice(1)]
      }
    }
  }
  return [...results, code.slice(1)]
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

const combinator = parsers => {
  return text => {
    if (text === undefined) return null
    let out
    for (let parser of parsers) {
      out = parser(text)
      if (out != null) {
        return out
      }
    }
    // const msg = `execute: unbound symbol: "${text}"[]`
    // throw Error(`\x1b[31m${msg}\x1b[0m`)
    return null
  }
}

const valueParser = combinator([
  parseExpr,
  extractLambda,
  extractSymbol,
  extractString,
  extractNum,
  extractBoolean,
  extractOperator,
  extractIf,
  extractDefine
])

REPL.start({
  prompt: 'scheme λ >> ',
  ignoreUndefined: true,
  eval: (expr, context, filename, callback) => {
    callback(null, valueParser(expr.trim())[0])
  }
})

// WIP

// console.log(valueParser('(define mul (lambda (x y) (* x y)))')[0])
// console.log(valueParser('(mul 2 3)'))

// console.log('(define circle-area (lambda (r) (* pi (* r r)))')
// console.log('(circle-area (+ 5 5))')

module.exports = valueParser
