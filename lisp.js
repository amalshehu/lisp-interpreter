let ENV = {
  pi: 3.14159265359
}
let REPL = require('repl')

const relational = (acc, cur, i, ar, op) => {
  let result = true
  if (!result) return false
  return evalLogical[op](ar[i - 1], cur) ? '#t' : '#f'
}

const evalLogical = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '=': (a, b) => a == b
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
const fetchNumberTypeValue = variable => {
  const attribute = ENV[variable]
  if (attribute != undefined) {
    return attribute.type == 'number' ? attribute.value : variable
  }
  return variable
}

const extractSymbol = code => {
  let match = code.match(/[a-zA-Z0-9_-]+/)
  const symbol = code.slice(0, code.indexOf(' '))
  if (symbol.length != match[0].length) {
    const msg = 'Violates naming convention rule'
    throw new EvalError(`\x1b[31m${msg}\x1b[0m`)
  }
  let fetchNumber = fetchNumberTypeValue(match[0])
  return match ? [fetchNumber, code.slice(match[0].length)] : null
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

const extractDefine = code => {
  if (!code.startsWith('define')) return null
  code = code.slice(6)
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  const symbol = extractSymbol(code)
  code = symbol[1]
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  let value = valueParser(code)
  if (value) {
    ENV[symbol[0]] = {
      value: value[0],
      type: typeof value[0]
    }
    // console.log()
  }
  return [`value ${value[0]} assigned to ${symbol[0]}`, value[1]]
}

const extractIf = code => {
  if (!code.startsWith('if')) return null
  code = code.slice(2)
  skipSpace(code) ? (code = skipSpace(code)[1]) : code
  const ifAst = conditionSplitter(code, 'if')
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

const conditionSplitter = (code, type) => {
  // Splits if condition using regex into an array.
  let arr = []
  const re = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/
  const loopCount = {
    if: 3,
    lambda: 2
  }
  let i = loopCount[type]
  while (i != 0) {
    try {
      // WIP
      skipSpace(code) ? (code = skipSpace(code)[1]) : code
      let m = code.startsWith('(') ? code.match(re) : code.match(/([^\s]+)/)
      arr.push(m[0])
      code = code.slice(m[0].length)
      i--
    } catch (error) {
      throw SyntaxError(`Invalid ${type} Syntax`)
    }
  }
  return arr
}

const lambdaObjectComposer = (args, body) => {
  // WIP
  const lambda = {
    type: 'function',
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
      for (const key in this.arguments) {
        this.arguments[key] = argValues.shift()
      }
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
  result = conditionSplitter(code, 'lambda')
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
      throw EvalError('Debug last parser output.', error)
    }

    if (code[0] === ')') {
      if (ENV[results[0]]) {
        const preDefValue = ENV[results[0]].value
        if (preDefValue.fnBody.startsWith('(')) {
          preDefValue.compute(results.slice(1))
          code = preDefValue.fnBody
          skipSpace(code) ? (code = skipSpace(code)[1]) : code
          let evaluated = valueParser(code)
          return [evaluated[0], evaluated[1]]
        }
        return [preDefValue, code]
      } else if (nativeFunctions.hasOwnProperty(results[0])) {
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
        return Number(code[0])
      case '*':
        return 1 * Number(code[0])
      case '/':
        return 1 / Number(code[0])
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
      try {
        out = parser(text)
      } catch (error) {
        const msg = `Scheme syntax is not valid`
        throw new SyntaxError(`\x1b[31m${msg}\x1b[0m`)
      }
      if (out != null) {
        return out
      }
    }
    return null
  }
}

const valueParser = combinator([
  parseExpr,
  extractIf,
  extractDefine,
  extractLambda,
  extractString,
  extractNum,
  extractBoolean,
  extractOperator,
  extractSymbol
])

REPL.start({
  prompt: 'scheme λ >> ',
  ignoreUndefined: true,
  eval: (expr, context, filename, callback) => {
    callback(null, valueParser(expr.trim())[0])
  }
})

// WIP

// console.log(valueParser('(define square (lambda (x y z)  (+ x y z))))'))
// console.log(valueParser('(define x 10)'))
// console.log(valueParser('(define y 10)'))
// console.log(valueParser('(define z 10)'))
// console.log(valueParser('(square x y z)'))

// console.log(valueParser('(define circle-area (lambda (r) (* 3.14 r r)))'))
// console.log(valueParser('(circle-area 10)'))
// console.log(valueParser('(define a 500)'))
// console.log(valueParser('(* a a)'))

module.exports = valueParser
