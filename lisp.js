let readline = require('readline')

let reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
})
reader.on('line', line => {
  let tokens = tokenize(line)
  console.log(tokens)
  reader.close()
})

const tokenize = program =>
  program
    .replace(/[(]/g, ' ( ')
    .replace(/[)]/g, ' ) ')
    .split(' ')
    .filter(Boolean)
