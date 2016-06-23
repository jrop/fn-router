'use strict'
const debug = require('debug')('fn-router')
const pathToRegexp = require('path-to-regexp')

module.exports = function router() {
	const routes = [ ]

	function matcher(path, contextRoute) {
		contextRoute = contextRoute || ''
		path = path.replace(new RegExp(`^${contextRoute}`), '')
		debug('trying to match', path)
		for (const route of routes) {
			try {
				return route(path)
			} catch (e) {
				if (/RouteMismatchError/.test(e.message))
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
		const re = pathToRegexp(path, keys)

		//
		// add a function to `routes` that, when
		// invoked on a valid path, calls `fn`
		//
		routes.push(function singleMatcher(pathToTry) {
			debug('?', pathToTry, path)
			const match = re.exec(pathToTry)
			if (match === null)
				throw new Error('RouteMismatchError: ' + pathToTry + ' does not match ' + path)

			const paramsArray = match.slice(1).map((param, index) => ({ [keys[index].name]: param }))
			const params = Object.assign.apply(null, [ { } ].concat(paramsArray))
			return fn(params)
		})
		return matcher
	}

	//
	// use subrouter:
	//
	matcher.use = function (path, router) {
		if (typeof router == 'undefined') {
			router = path
			path = '/'
		}

		//
		// add a function to `routes` that, delegates
		// to a subrouter
		//
		routes.push(function subrouteMatcher(pathToTry) {
			debug(`SUB ${pathToTry}, contextRoute=${path}`)
			return router(pathToTry, path)
		})
		return matcher
	}

	// return the router:
	return matcher
}
