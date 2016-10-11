const Test = require('tape')
const Nodeku = require('../')

Test('Nodeku exists', t => {
  t.assert(typeof Nodeku === 'function', 'is a Function.')
})