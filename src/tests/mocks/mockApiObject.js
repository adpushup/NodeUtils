const connection = require('../../couchbase/connection');
const api = require('../../couchbase/api');
const config = require('../../config');
const mockApiObject = (delay) => {
	const { cluster, couchbase } = connection(
		'couchbase://' + config.couchBase.HOST,
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);

	const _origOpenBucket = cluster.openBucket;
	cluster.openBucket = function (bucket, callback) {
		if (delay) setTimeout(delay);
		return _origOpenBucket.call(cluster, bucket, callback);
	};

	//from this api object we can create timer,check callback object is function,check different api poiting to same API object,All Api queries should be executed at a single time when promise is resolved.
	const apiInst = api({
		bucket: config.couchBase.DEFAULT_BUCKET,
		cluster,
		couchbase,
	});
	return apiInst;
};

module.exports = mockApiObject;
