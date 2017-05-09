// promisey while loop with promisey conditionals
// (so, your condition can potentially do I/O)
'use strict';
var Promise = require('bluebird');
function promiseWhile(condition, action, errorHandler) {
	/**
 * Promisey while
 * @param {Function} condition function returning boolean, or function generating a similar Promise
 * @param {Function} action function which takes no args, returns promise
 * @param {Function} errorHandler optional - capture errors during looping, return if should continue iterating. Default to terminate
 * @return {Promise}
 */

	// default errorhandler terminates on first error
	if (typeof errorHandler === 'undefined') {
		// eslint-disable-next-line no-param-reassign
		errorHandler = function() { console.log('errorHandler'); return false; };
	}

	var promiseCondition;
	if (Promise.is(condition)) {
		promiseCondition = condition;
	} else {
		promiseCondition = Promise.method(condition);
	}

	return new Promise(function(resolve, reject) {
		var loop = function() {
			return promiseCondition().then(function(shouldContinue) {
				if (!shouldContinue) {
					return resolve();
				}
				return action().then(loop).catch(function() {
					if (errorHandler.apply(this, arguments)) {
						return loop();
					}
					return reject(arguments);
				});
			});
		};
		// first time
		process.nextTick(loop);
	});
}

module.exports = promiseWhile;
