'use strict'
const co = require('co')
const EventEmitter = require('events').EventEmitter

module.exports = runner

/**
 * @param {Number} limit
 * @param {RunnerOption} options
 */
function runner (limit, options) {
  options = options || {}
  limit = limit || 1
  const gens = []
  const results = []
  const runners = []
  let running = 0
  let index = 0

  const runner = new EventEmitter()

  function * next () {
    running++
    while (index < gens.length) {
      const i = index++
      const gen = gens.splice(i, 1, undefined)[0]
      const result = yield co(gen)
      runner.emit('done', result, i)
      if (options.retainResult !== false) results[i] = result
    }
    running--
    runner.emit('drain')
  }

  runner.push = function (gen) {
    gens.push(gen)
    if (running < limit) runners.push(co(next))
  }

  runner.end = function () {
    return Promise.all(runners).then(function () {
      return results
    })
  }

  return runner
}
