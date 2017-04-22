'use strict'

const co = require('co')
const assert = require('assert')
const coRunner = require('../lib')

function * job (index) {
  yield done => setTimeout(done, Math.random() * 100 + 100)
  return index
}
function * run (runners, jobCount) {
  console.log('run', jobCount, 'jobs in', runners, 'runners')
  const start = Date.now()
  const runner = coRunner(runners)
  for (let i = 0; i < jobCount; i++) {
    runner.push(job(i))
  }
  const addJobFinishTime = Date.now()
  const result = yield runner.end()
  const jobFinishTime = Date.now()
  assert(result)
  assert.strictEqual(result.length, jobCount)
  for (let i = 0; i < jobCount; i++) {
    assert.strictEqual(result[i], i)
  }
  console.log('add job finished in', addJobFinishTime - start, 'ms, job finished in', jobFinishTime - start, 'ms')
}
co(function * () {
  yield run(5, 100)
  yield run(50, 1000)
  yield run(500, 10000)
})
