const cbWrapper = require('../couchbase');
const config = require('../config');
const mockApiObject = require('./mocks/mockApiObject');

// test('cbWrapper returns API Object', async () => {
// 	const connectedObj = await cbWrapper(
// 		'couchbase://' + config.couchBase.HOST,
// 		config.couchBase.DEFAULT_BUCKET,
// 		config.couchBase.DEFAULT_USER_NAME,
// 		config.couchBase.DEFAULT_USER_PASSWORD
// 	);
// 	expect(connectedObj).toBeObject();
// });

// // path connection object to mock couchbase connection behaviour  "mock couchbase connection"
// test('is mock object valid', () => {
// 	const apiInst = mockApiObject(config.couchBase.DEFAULT_BUCKET);
// 	expect(apiInst).toBeObject();
// 	expect(apiInst).toContainKeys(['queryDB', 'getDoc', 'createDoc', 'updateDoc', 'getCouchBaseObj']);
// 	for (const key in apiInst) {
// 		expect(apiInst[key]).toBeFunction();
// 	}
// });

// //test is connected to couchbase
// test('is connected to couchbase', async () => {
// 	try {
// 		const apiInst = mockApiObject(config.couchBase.DEFAULT_BUCKET);
// 		const { getDoc } = apiInst;
// 		const result = await getDoc('site::40792');
// 		expect(result).not.toBeEmpty();
// 	} catch (error) {
// 		console.log(`error:${error}`);
// 	}
// });

// //test are two buckets connection objects same
// test('are two buckets objects same ', async () => {
// 	try {
// 		const apiInst = mockApiObject(config.couchBase.DEFAULT_BUCKET);
// 		const apiInst2 = mockApiObject(config.couchBase.DEFAULT_BUCKET);
// 		expect(apiInst.getBucketConnection()).toMatchObject(apiInst2.getBucketConnection());
// 	} catch (error) {
// 		console.log(`error:${error}`);
// 	}
// });

// test is data query working on delay
test('test is data query working on delay', async () => {
	try {
		console.log('started delay');
		const apiInst = mockApiObject(config.couchBase.DEFAULT_BUCKET);
		const { getDoc } = apiInst;
		const result = await getDoc('site::40792');
		console.log(result, '--------------->');
		expect(result).not.toBeEmpty();
	} catch (error) {
		console.log(`error:${error}`);
	}
});
