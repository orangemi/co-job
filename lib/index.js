'use strict'
const co = require('co')

module.exports = runner
/**
 *
 * @param {Number} limit
 */
function runner (limit) {
  limit = limit || 1
  const gens = []
  const result = []
  const runners = []
  let running = 0
  let index = 0

  function * next () {
    running++
    while (index < gens.length) {
      const i = index++
      result[i] = yield gens[i]
      delete gens[i]
    }
    running--
  }

  return {
    push: function (gen) {
      gens.push(gen)
      if (running < limit) runners.push(co(next))
    },
    end: function () {
      return Promise.all(runners).then(() => result)
    }
  }
}
