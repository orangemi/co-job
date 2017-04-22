co-runner
=========
Run jobs in limited runners. Jobs can dynamicly be pushed in current runner

[![Build Status](https://travis-ci.org/orangemi/co-runner.svg?branch=master)](https://travis-ci.org/orangemi/co-runner)

**Note**: if job contains error it will break runner processing. So you should process error with `try/catch` in your job

## Quick start
```js
const co = require('co')
const coRunner = require('co-runner')
co(function * () {
  const runner = coRunner(5)
  runner.push(function () {
    return 'result'
  })
  console.log(yield runner.end())
})
```

## Dependency
- [co](https://github.com/tj/co)

## API
### constructor(limit: Number): Runner
Return a runner master with limited runners

### Runner.push(job: yieldable): void
push yieldable job into runner include `Promise`, `generator` and normal `function`

### Runner.end(): Generator<result>
return a yieldable generator with final result for all jobs
