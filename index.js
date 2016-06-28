'use strict'

const debug = require('debug')('fn-router')
const pathToRegexp = require('path-to-regexp')
const _trim = require('lodash.trim')

//
// Takes a match (from re.exec(...)), and keys
// (from pathToRegexp(..., keys)) and creates a
// params hash.
//
function getParams(match, keys) {
	const paramsArray = match.slice(1).map((param, index) => ({ [keys[index].name]: param }))
	return Object.assign.apply(null, [ { } ].concat(paramsArray))
}

function lead(s) {
	if (s.charAt(0) != '/')
		s = '/' + s
	return s
}

function trim(s) {
	return _trim(s, '/')
}

module.exports = function router() {
	const routes = [ ]

	// function bind(fn) {
	// 	if (typeof fn !== 'function') return fn
	// 	return fn.bind(this)
	// }

	function matcher(path, passThruParams) {
		debug(`ROOT ${path}`)
		for (const route of routes) {
			try {
				return route.call(this, path, passThruParams)
			} catch (e) {
				if (/^RouteMismatchError/.test(e.message))
					continue
				else
					throw e
			}
		}
		throw new Error('RouteMismatchError: ' + path + ' does not match any routes')
	}

	//
	// add a route:
	//
	matcher.add = function (path, fn) {
		const keys = [ ]
		const re = pathToRegexp(path + (fn.__is_matcher__ ? '/:fnrouterSubroute*' : ''), keys)
		if (fn.__is_matcher__) {
			//
			// add a function to `routes` that, delegates
			// to a subrouter
			//
			routes.push(function subrouteMatcher(pathToTry, passThruParams) {
				debug(`SUB ${path} ? ${pathToTry}`)
				const match = re.exec(pathToTry)
				if (match === null)
					throw new Error('RouteMismatchError: ' + pathToTry + ' does not match any routes')

				const params = getParams(match, keys)
				let subRoute = params.fnrouterSubroute || '/'
				subRoute = lead(trim(subRoute))
				delete params.fnrouterSubroute

				return fn.call(this, subRoute, Object.assign({ }, passThruParams, params))
			})
		} else {
			//
			// add a function to `routes` that, when
			// invoked on a valid path, calls `fn`
			//
			routes.push(function singleMatcher(pathToTry, passThruParams) {
				debug(`ROUTE ${path} ? ${pathToTry}`)
				const match = re.exec(pathToTry)
				if (match === null)
					throw new Error('RouteMismatchError: ' + pathToTry + ' does not match ' + path)
				return fn.call(this, Object.assign({ }, passThruParams, getParams(match, keys)))
			})
		}
		return matcher
	}
	matcher.__is_matcher__ = true

	//
	// override default Function.prototype.bind:
	// make sure we still retain __is_matcher__ = true
	// on bound function
	//
	matcher._bind = matcher.bind
	matcher.bind = function (thisArg) {
		const fn = matcher._bind(thisArg)
		fn.__is_matcher__ = true
		return fn
	}

	// return the router:
	return matcher
}
