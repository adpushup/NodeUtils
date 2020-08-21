const cbWrapper = require('../couchbase');
const connection = require('../couchbase/connection');
const api = require('../couchbase/api');
const config = require('../config/config');
const {
	isObject,
	containsProperty,
	areAllPropertyFunc,
	isNotEmptyObject,
} = require('./testChecks');

const getMockObject = (delay) => {
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

test('cbWrapper returns API Object', async () => {
	const connectedObj = await cbWrapper(
		'couchbase://' + config.couchBase.HOST,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);
	expect(isObject(connectedObj)).toBe(true);
});

// path connection object to mock couchbase connection behaviour  "mock couchbase connection"
test('is mock object valid', () => {
	const apiInst = getMockObject();
	expect(isObject(apiInst)).toBe(true);
	expect(
		containsProperty(apiInst, 'queryDB', 'getDoc', 'createDoc', 'updateDoc', 'getCouchBaseObj')
	).toBe(true);
	expect(areAllPropertyFunc(apiInst)).toBe(true);
});

//test is connected to couchbase
test('is connected to couchbase', async () => {
	try {
		const apiInst = getMockObject();
		const { getDoc } = apiInst;
		const result = await getDoc('site::40792');
		expect(isNotEmptyObject(result)).toBe(true);
	} catch (error) {
		console.log(`error:${error}`);
	}
});
