let readline = require('readline')

let reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
})
reader.on('line', line => {
  let program = line
    .replace('(', ' ( ')
    .replace(')', ' ) ')
    .split('')
  console.log(program)

  reader.close()
})
