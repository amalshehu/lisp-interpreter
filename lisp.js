let readline = require('readline')

let reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
})
reader.on('line', line => {
  console.log(tokenize(line))
  reader.close()
})

const tokenize = program =>
  program
    .replace('(', ' ( ')
    .replace(')', ' ) ')
    .split(' ')
