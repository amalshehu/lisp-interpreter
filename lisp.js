let REPL = require('repl')

REPL.start({
  prompt: '>>> ',
  ignoreUndefined: true,
  eval: (expr, context, filename, callback) => {
    callback(null, lisp(expr))
  }
})

let ENV = {}

{ //Dont open
  // let numArray = []
  // const numberEvaluator = code => {
  //   token = code.substr(0, code.indexOf(' '))
  //   if (!isFinite(token)) return null
  //   if (code === ')') {
  //     return [numArray, code]
  //   }
  //   parseNumbers = number(code)
  //   numArray.push(parseNumbers[0])
  //   code = parseNumbers[1]
  //   space(code) ? (code = space(code)[1]) : code
  //   return numberEvaluator(code)
  // }
}


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


const operator = (code) => {
  const opRe = /^(\+|-|\*|\/|=|>|<|>=|<=)/
  let match = code.match(opRe)
  return match ? [match[0], code.replace(opRe, '')] : null
}

console.log(operator('+ 1 2 3)'))