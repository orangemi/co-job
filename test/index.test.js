'use strict'
/* global describe it */

const co = require('co')
const assert = require('assert')
const coJob = require('../lib')
describe('co-job test suite', function () {
  it('init with no argument.', function () {
    const runner = coJob()
    assert(runner)
  })

  it('init with argument.', function () {
    const runner = coJob(2)
    assert(runner)
  })

  it('run only 1 job. should return array with job result', function () {
    function * job () {
      yield function (done) { return setTimeout(done, 10) }
      return 'ok'
    }
    return co(function * () {
      const runner = coJob()
      runner.push(job)
      const result = yield runner.end()
      assert(result)
      assert(Array.isArray(result))
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0], 'ok')
    })
  })

  it('run only sequence jobs on 1 runner. result should be in sequence', function () {
    function job (index) {
      return new Promise(function (resolve) {
        resolve(index + 1)
      })
    }
    return co(function * () {
      const runner = coJob()
      for (let i = 0; i < 5; i++) runner.push(job(i))
      const result = yield runner.end()
      assert(result)
      assert.strictEqual(result.length, 5)
      for (let i = 0; i < 5; i++) assert.strictEqual(result[i], i + 1)
    })
  })

  it('run sequence jobs on 2 runners. result should be in sequence', function () {
    function job (index) {
      return new Promise(function (resolve) {
        resolve(index + 1)
      })
    }
    return co(function * () {
      const runner = coJob(2)
      for (let i = 0; i < 10; i++) runner.push(job(i))
      const result = yield runner.end()
      assert(result)
      assert.strictEqual(result.length, 10)
      for (let i = 0; i < 10; i++) assert.strictEqual(result[i], i + 1)
    })
  })

  it('run in parallel job on 2 runners.', function () {
    let isLongRunning = false
    function * longJob () {
      isLongRunning = true
      yield function (done) { setTimeout(done, 10) }
      isLongRunning = false
    }
    function * shortJob () {
      yield function (done) { setTimeout(done, 1) }
      assert.strictEqual(isLongRunning, true)
      return isLongRunning
    }
    return co(function * () {
      const runner = coJob(2)
      runner.push(longJob())
      runner.push(shortJob())
      const result = yield runner.end()
      assert(result)
      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[1], true)
    })
  })

  it('support dynamic add job. runner should reuse if it is free', function () {
    let isLongRunning = false
    function * longJob () {
      isLongRunning = true
      yield function (done) { setTimeout(done, 10) }
      isLongRunning = false
    }
    function * shortJob () {
      yield function (done) { setTimeout(done, 1) }
      assert.strictEqual(isLongRunning, true)
      return isLongRunning
    }
    return co(function * () {
      const runner = coJob(2)
      runner.push(longJob())
      runner.push(shortJob())
      runner.push(shortJob())
      const result = yield runner.end()
      assert(result)
      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[1], true)
      assert.strictEqual(result[2], true)
    })
  })

  it('if one of runners finished all job. it should be start again if new jobs comming', function () {
    function * longJob () {
      yield function (done) { setTimeout(done, 10) }
    }
    function * shortJob (i) {
      yield function (done) { setTimeout(done, 1) }
      return i
    }
    return co(function * () {
      const runner = coJob(2)
      runner.push(longJob())
      runner.push(shortJob(1))
      yield function (done) { setTimeout(done, 5) }
      runner.push(shortJob(2))
      const result = yield runner.end()
      assert(result)
      assert.strictEqual(result.length, 3)
      assert.strictEqual(result[1], 1)
      assert.strictEqual(result[2], 2)
    })
  })

  it('runner should emit `done` event with sequence', function () {
    function job (index) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(index)
        }, 10)
      })
    }
    return co(function * () {
      const runner = coJob(1)
      let received = 0
      runner.push(job(1))
      runner.push(job(2))
      runner.on('done', function (result, index) {
        assert.strictEqual(index, received++)
        assert.strictEqual(result, index + 1)
      })
      yield runner.end()
      assert.strictEqual(received, 2)
    })
  })

  it('runner should emit `drain` event when runner drained', function () {
    function job (index) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(index)
        }, 10)
      })
    }
    return co(function * () {
      const runner = coJob(1)
      let isDrained = false
      runner.push(job(1))
      runner.on('drain', function () {
        isDrained = true
      })
      yield runner.end()
      assert.strictEqual(isDrained, true)
    })
  })

  it('runner should not retain if retainResult === false', function () {
    function job (index) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(index)
        }, 10)
      })
    }
    return co(function * () {
      const runner = coJob(1, {retainResult: false})
      runner.push(job(1))
      const result = yield runner.end()
      assert.strictEqual(result.length, 0)
    })
  })
})
