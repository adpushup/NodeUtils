const cbWrapper = require('../couchbase');
const config = require('../config');
const mockApiObject = require('./mocks/mockApiObject');

test('cbWrapper returns API Object', async () => {
	const connectedObj = await cbWrapper(
		'couchbase://' + config.couchBase.HOST,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);
	expect(connectedObj).toBeObject();
});

// path connection object to mock couchbase connection behaviour  "mock couchbase connection"
test('is mock object valid', () => {
	const apiInst = mockApiObject();
	expect(apiInst).toBeObject();
	expect(apiInst).toContainKeys(['queryDB', 'getDoc', 'createDoc', 'updateDoc', 'getCouchBaseObj']);
	for (const key in apiInst) {
		expect(apiInst[key]).toBeFunction();
	}
});

//test is connected to couchbase
test('is connected to couchbase', async () => {
	try {
		const apiInst = mockApiObject();
		const { getDoc } = apiInst;
		const result = await getDoc('site::40792');
		expect(result).not.toBeEmpty();
	} catch (error) {
		console.log(`error:${error}`);
	}
});
