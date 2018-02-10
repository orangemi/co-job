co-job
======
Run jobs in limited runners. Jobs can dynamicly be pushed in current runner

[![Build Status](https://travis-ci.org/orangemi/co-job.svg?branch=master)](https://travis-ci.org/orangemi/co-job)

**Note**: if job contains error it will break runner processing. So you should process error with `try/catch` in your job

## Quick start
```js
const co = require('co')
const coJob = require('co-job')
co(function * () {
  const runner = coJob(5)
  runner.push(function () {
    return 'result'
  })
  console.log(yield runner.end())
})
```

## Dependency
- [co](https://github.com/tj/co)

## API
### constructor(limit: Number, options: Object): Runner
Return a job runner with limited cocurrency runners.

options:
- retainResult: <***boolean***> retain the result when run `runner.end()`. Or it would be an empty array. Default: true

### Runner.push(job: yieldable): void
push yieldable job into runner include `Promise`, `generator` and normal `function`

### Runner.end(): Promise<result>
return a Promise with final result for all jobs
