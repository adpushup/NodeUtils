const connection = require('../../couchbase/connection');
const api = require('../../couchbase/api');
const config = require('../../config');

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// function sleep(milliseconds) {
// 	const date = Date.now();
// 	let currentDate = null;
// 	do {
// 		currentDate = Date.now();
// 	} while (currentDate - date < milliseconds);
// }

const mockApiObject = (bucket, delay) => {
	const { cluster, couchbase } = connection(
		'couchbase://' + config.couchBase.HOST,
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);

	const _origOpenBucket = cluster.openBucket;
	cluster.openBucket = function (bucket, callback) {
		// handle delay cases here
		// console.log('opening bucket');
		if (delay) {
			return sleep(delay).then(() => _origOpenBucket.call(cluster, bucket, callback));
		}
		return _origOpenBucket.call(cluster, bucket, callback);
	};

	//from this api object we can create delay,check callback object is function,check different api object pointing to same API object,All Api queries should be executed at a single time when promise is resolved.
	const apiInst = api({
		bucket: bucket,
		cluster,
		couchbase,
	});
	return apiInst;
};

module.exports = mockApiObject;
