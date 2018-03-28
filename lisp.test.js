const valueParser = require('./lisp')

test('Eval (+ 2 3 5) to equal 10', () => {
  expect(valueParser('(+ 2 3 5)')[0]).toBe(10)
})

test('Eval (- 4 3 1) to equal 0', () => {
  expect(valueParser('(- 4 3 1)')[0]).toBe(0)
})

test('Eval (+ 8 1 0 9 0)) to equal 18', () => {
  expect(valueParser('(+ 8 1 0 9 0))')[0]).toBe(18)
})

// console.log(valueParser('(define square (lambda (x) (* x x)))')[0])
// console.log(valueParser('(define n 12)'))
// console.log(valueParser('(square n)')[0])

// console.log(valueParser('(define x 5)'))
// console.log(valueParser('(* x x)'))

// console.log(valueParser('(if #f 2 4 )'))
// console.log(valueParser('#t'))
// console.log(valueParser('(<= 15 10)'))
// console.log(valueParser('(+ 8 1 0 9 0)'))
// console.log(valueParser('(+ 2 3 5)'))
// console.log(valueParser('(- 4 3 1)'))
// console.log(valueParser('((* 2 3 2))'))
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
// console.log(valueParser('(if (< 1 2) (if (< 2 1) (+ 1 1) (+ 3 3)) (+ 4 4))'))
