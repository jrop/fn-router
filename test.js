'use strict'

const assert = require('assert')
const router = require('./index')

const r = router()

//
// simple sub-router
//
.add('/api/v:version?', router()
	.add('/', function () {
		return 'API'
	})
	.add('/version', function (params) {
		return params.version
	}))

//
// simple routes:
//
.add('/', function () {
	return 'INDEX'
})

.add('/123', function () {
	return 123
})

.add('/exception', function () {
	throw new Error('CustomError')
})

//
// test this binding:
//
.add('/this.prop', function () {
	return this.prop
})

.add('/sub', router()
	.add('/this.prop', function () {
		return this.prop
	}))

.add('/sub-bound', router()
	.add('/this.prop', function () {
		return this.prop
	})
	.bind({ prop: 'should-not-be-ignored' }))

//
// Mocha tests:
//
describe('fn-router', function () {
	it('should route simple paths', function () {
		assert.equal(r('/'), 'INDEX')
		assert.equal(r('/123'), '123')
	})

	it('should allow sub-routers', function () {
		assert.equal(r('/api/v1'), 'API')
		assert.equal(r('/api/v1/version'), '1')
		assert.equal(r('/api/v2/version'), '2')
	})

	it('should throw exceptions', function () {
		assert.throws(() => r('/exception'), /CustomError/)
		assert.throws(() => r('/non-existent'), /RouteMismatchError/)
	})

	it('should preserve this', function () {
		assert.equal(r.call({ prop: 'me' }, '/this.prop'), 'me')
		assert.equal(r.call({ prop: 'you' }, '/sub/this.prop'), 'you')

		// make sure bound function retains bound this,
		// even if we try to override it:
		assert.equal(r.bind({ prop: 'you' })('/sub-bound/this.prop'), 'should-not-be-ignored')
		assert.equal(r.call({ prop: 'you' }, '/sub-bound/this.prop'), 'should-not-be-ignored')
	})
})
