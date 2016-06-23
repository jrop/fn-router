'use strict'

const assert = require('assert')
const router = require('./index')

const r = router()

.add('/api/v:version?', router()
	.add('/', function () {
		return 'API'
	})
	.add('/version', function (params) {
		return params.version
	}))

.add('/', function () {
	return 'INDEX'
})

.add('/123', function () {
	return 123
})

.add('/exception', function () {
	throw new Error('CustomError')
})

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
})
