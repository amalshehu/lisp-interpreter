const valueParser = require('./lisp')

test('(+ 2 3 5) to equal 10', () => {
  expect(valueParser('(+ 2 3 5)')[0]).toBe(10)
})

test('(- 4 3 1) to equal 0', () => {
  expect(valueParser('(- 4 3 1)')[0]).toBe(0)
})

test('(+ 8 1 0 9 0)) to equal 18', () => {
  expect(valueParser('(+ 8 1 0 9 0))')[0]).toBe(18)
})

test('(+ 2 3 5)) to equal 10', () => {
  expect(valueParser('(+ 2 3 5))')[0]).toBe(10)
})

test('(/ 4 2 2) to equal 1', () => {
  expect(valueParser('(/ 4 2 2)')[0]).toBe(1)
})

test('(+ (+ 1 2) (+ 3 4) 87) to equal 97', () => {
  expect(valueParser('(+ (+ 1 2) (+ 3 4) 87)')[0]).toBe(97)
})

test('(- (+ 1 2 9 9) (* 3 4) 87) to equal -78', () => {
  expect(valueParser('(- (+ 1 2 9 9) (* 3 4) 87)')[0]).toBe(-78)
})

test('(define x 5) should assign value 5 to variable x.', () => {
  expect(valueParser('(define x 5)')[0]).toBeDefined()
})

test('(* x x) Use assigned value for computation.', () => {
  expect(valueParser('(* x x)')[0]).toBe(25)
})

test('(if #f 2 4 ) to equal 4', () => {
  expect(valueParser('(if #f 2 4 )')[0]).toBe(4)
})

test('#t to equal #t', () => {
  expect(valueParser('#t')[0]).toBe('#t')
})

test('(<= 15 10) to equal #f', () => {
  expect(valueParser('(<= 15 10)')[0]).toBe('#f')
})
test('(+ (* 6 9) (/ 9 4) 9) to equal 65.25', () => {
  expect(valueParser('(+ (* 6 9) (/ 9 4) 9)')[0]).toBe(65.25)
})
test('(<= 15 10) to equal #f', () => {
  expect(valueParser('(<= 15 10)')[0]).toBe('#f')
})

test('(max 1 8 3 4 5) to equal 8', () => {
  expect(valueParser('(max 1 8 3 4 5)')[0]).toBe(8)
})

test('(+ 1 2 ( 2 5) 10) should throw an error.', () => {
  expect(() => {
    valueParser('(+ 1 2 ( 2 5) 10)')[0]
  }).toThrow()
})

test('(if (<= 1 1) (+ 2 2) (+ 1 1)) to equal 4', () => {
  expect(valueParser('(if (<= 1 1) (+ 2 2) (+ 1 1))')[0]).toBe(4)
})
test('(max 100 101 -258 145 158) to equal 158', () => {
  expect(valueParser('(max 100 101 -258 145 158)')[0]).toBe(158)
})
test('(if (< 1 2) (+ 6 9) (+ 9 4)) to equal 15', () => {
  expect(valueParser('(if (< 1 2) (+ 6 9) (+ 9 4))')[0]).toBe(15)
})

test('(if (> 1 2) (+ 6 9) (+ 9 4)) to equal 13', () => {
  expect(valueParser('(if (> 1 2) (+ 6 9) (+ 9 4))')[0]).toBe(13)
})
test('(if (< 1 2) (if (< 2 1) (+ 1 1) (+ 3 3)) (+ 4 4)) to equal 6', () => {
  expect(
    valueParser('(if (< 1 2) (if (< 2 1) (+ 1 1) (+ 3 3)) (+ 4 4))')[0]
  ).toBe(6)
})

test('(define mult (lambda (x y z)  (* x y z))) should define mult function.', () => {
  expect(
    valueParser('(define mult (lambda (x y z)  (* x y z)))')[0]
  ).toBeDefined()
})

test('(define x 100) should assign value 100 to variable x.', () => {
  expect(valueParser('(define x 100)')[0]).toBeDefined()
})

test('(define y 200) should assign value 200 to variable y.', () => {
  expect(valueParser('(define y 200)')[0]).toBeDefined()
})

test('(define z 500) should assign value 500 to variable z.', () => {
  expect(valueParser('(define z 500)')[0]).toBeDefined()
})

test('(mult x y z) Call function and use predefined variables to equal 10000000', () => {
  expect(valueParser('(mult x y z)')[0]).toBe(10000000)
})

// console.log(valueParser('(define x 10)')[0])
// console.log(valueParser('(mul x 5 2)')[0])

// console.log(valueParser('(define square (lambda (x) (* x x)))')[0])
// console.log(valueParser('(define n 12)'))
// console.log(valueParser('(square n)')[0])
