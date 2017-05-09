// promisey foreach loop

'use strict';

var Promise = require('bluebird'),
	promiseWhile = require('./promiseWhile');

/**
 * Promisey foreach
 *
 * @param {Array} arr
 * @param {Function} action which acts on element of arr, returns Promise
 * @param {Function} errorHandler see promiseWhile
 * @return {Promise}
 */
function promiseForEach(arr, action, errorHandler) {
	var i = 0, condition, actionIterator, errIterator;

	condition = function() {
		return i < arr.length;
	};

	actionIterator = Promise.method(function() {
		var val = arr[i];
		i++;
		return action(val);
	});

	errIterator = function(err) {
		return errorHandler(arr[i - 1], err);
	};

	return promiseWhile(condition, actionIterator, errIterator);
}


module.exports = promiseForEach;
