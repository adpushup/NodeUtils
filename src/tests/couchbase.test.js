const config = require('../config');
// use mock to control behaviour of couchbase, do integeration testing, check bucket connection using sdk, seprate each other test cases to be non dependent

beforeEach(() => {
	jest.resetModules();
});

//cbWrapper returns API Object
test('cbWrapper returns API Object', async () => {
	const cbWrapper = require('../couchbase');
	const connectedObj = await cbWrapper(
		'couchbase://' + config.couchBase.HOST,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);
	expect(connectedObj).toContainKeys([
		'queryDB',
		'getDoc',
		'createDoc',
		'updateDoc',
		'getCouchBaseObj',
	]);
	for (const key in connectedObj) {
		expect(connectedObj[key]).toBeFunction();
	}
});

// path connection object to mock couchbase connection behaviour  "mock couchbase connection"
test('is mock object valid', () => {
	const mockApiObject = require('./mocks/mockApiObject');
	const apiInst = mockApiObject(config.couchBase.DEFAULT_BUCKET);
	expect(apiInst).toBeObject();
	expect(apiInst).toContainKeys(['queryDB', 'getDoc', 'createDoc', 'updateDoc', 'getCouchBaseObj']);
	for (const key in apiInst) {
		expect(apiInst[key]).toBeFunction();
	}
});

//test is connected to couchbase
test('is connected to couchbase', async () => {
	try {
		const cbWrapper = require('../couchbase');
		//use original ,seprate query
		const connectedObj = await cbWrapper(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		const { getDoc } = connectedObj;
		const result = await getDoc('site::40792');
		expect(result).not.toBeEmpty();
	} catch (error) {
		console.log(`error:${error}`);
	}
});

//test are two buckets connection objects same
test('are two buckets objects same ', async () => {
	try {
		const cbWrapper = require('../couchbase');
		const connectedObj = await cbWrapper(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		const connectedObj2 = await cbWrapper(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		expect(connectedObj.getBucketConnection()).toMatchObject(connectedObj2.getBucketConnection());
	} catch (error) {
		console.log(`error:${error}`);
	}
});

// test is data query working on delay
test('test is data query working on delay', async () => {
	try {
		const mockApiObject = require('./mocks/mockApiObject');
		console.log('started delay');
		const apiInst = mockApiObject(config.couchBase.DEFAULT_BUCKET, 4000);
		const { getDoc } = apiInst;
		const result = await getDoc('site::40792');
		expect(result).not.toBeEmpty();
	} catch (error) {
		console.log(`error:${error}`);
	}
});
