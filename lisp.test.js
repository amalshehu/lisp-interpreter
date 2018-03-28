const valueParser = require('./lisp')

test('Eval (+ 2 3 5) to equal 10', () => {
  expect(valueParser('(+ 2 3 5)')[0]).toBe(10)
})
