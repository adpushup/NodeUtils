const config = require('../config');
// use mock to control behaviour of couchbase, do integeration testing, check bucket connection using sdk, seprate each other test cases to be non dependent

beforeEach(() => {
	jest.resetModules();
});

//cbWrapper returns API Object
test('cbWrapper returns API Object', async () => {
	const cbWrapper = require('../couchbase');
	const apiInst = await cbWrapper(
		'couchbase://' + config.couchBase.HOST,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_USER_NAME,
		config.couchBase.DEFAULT_USER_PASSWORD
	);
	expect(apiInst).toContainKeys([
		'queryDB',
		'getDoc',
		'createDoc',
		'updateDoc',
		'getCouchBaseObj',
		'getBucketConnection',
	]);
	for (const key in apiInst) {
		expect(apiInst[key]).toBeFunction();
	}
});

// path connection object to mock couchbase connection behaviour  "mock couchbase connection"
test('is mock object valid', () => {
	const mockApiObject = require('./mocks/mockApiObject');
	const apiMockInst = mockApiObject(config.couchBase.DEFAULT_BUCKET);
	expect(apiMockInst).toBeObject();
	expect(apiMockInst).toContainKeys([
		'queryDB',
		'getDoc',
		'createDoc',
		'updateDoc',
		'getCouchBaseObj',
		'getBucketConnection',
	]);
	for (const key in apiMockInst) {
		expect(apiMockInst[key]).toBeFunction();
	}
});

//test is connected to couchbase
test('is connected to couchbase', async () => {
	try {
		const cbWrapper = require('../couchbase');
		//use original ,seprate query
		const apiInst = await cbWrapper(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);

		const dummyQuery = 'SELECT "hello" as greeting';
		const dummyQueryResult = [{ greeting: 'hello' }];

		const { queryDB } = apiInst;
		const result = await queryDB(dummyQuery);
		expect(result).toEqual(dummyQueryResult);
	} catch (error) {
		throw error;
	}
});

//test are two buckets connection objects same
test('are two buckets objects same ', async () => {
	try {
		const cbWrapper = require('../couchbase');
		const apiInst = await cbWrapper(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		const apiInst2 = await cbWrapper(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		expect(apiInst.getBucketConnection()).toMatchObject(apiInst2.getBucketConnection());
	} catch (error) {
		throw error;
	}
});

// test is data query working on delay
test('test is data query working on delay', async () => {
	try {
		const mockApiObject = require('./mocks/mockApiObject');
		const apiMockInst = mockApiObject(config.couchBase.DEFAULT_BUCKET, 1000);

		const dummyQuery = 'SELECT "hello" as greeting';
		const dummyQueryResult = [{ greeting: 'hello' }];

		const { queryDB } = apiMockInst;
		const result = await queryDB(dummyQuery);
		expect(result).toEqual(dummyQueryResult);
	} catch (error) {
		throw error;
	}
});

//are mock methods of Api Objects valid
test('is mocking methods of api Object valid', async () => {
	try {
		const mockApiObjectMethods = require('./mocks/mockApiObjectMethods');
		//use original ,seprate query
		const apiMockInstMethods = await mockApiObjectMethods(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		expect(apiMockInstMethods).toContainKeys(['queryDB', 'getDoc', 'createDoc', 'updateDoc']);
		for (const key in apiMockInstMethods) {
			expect(apiMockInstMethods[key]).toBeFunction();
		}
	} catch (error) {
		console.log(`error:${error}`);
	}
});

//is createDoc mock method valid
test('is createDoc mock method working', async () => {
	try {
		const mockApiObjectMethods = require('./mocks/mockApiObjectMethods');
		//use original ,seprate query
		const apiMockInstMethods = await mockApiObjectMethods(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		const { createDoc } = apiMockInstMethods;

		//use dummy key and json
		const dockId = 'user:king_arthur';
		const json = {
			email: 'kingarthur@couchbase.com',
			interests: ['Holy Grail', 'African Swallows'],
		};

		const result = await createDoc(dockId, json);
		expect(createDoc).toHaveBeenCalledWith(dockId, json);
		expect(createDoc).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject(json);
	} catch (error) {
		throw error;
	}
});

//is queryDB mock method valid
test('is queryDB mock method working', async () => {
	try {
		const mockApiObjectMethods = require('./mocks/mockApiObjectMethods');
		//use original ,seprate query
		const apiMockInstMethods = await mockApiObjectMethods(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		const { queryDB, createDoc } = apiMockInstMethods;

		//first create a doc
		const dockId = 'user:king_arthur';
		const json = {
			email: 'kingarthur@couchbase.com',
			interests: ['Holy Grail', 'African Swallows'],
		};
		await createDoc(dockId, json);

		//then query it
		const dummyQuery = `select * from AppBucket where meta().id=${dockId}`;
		const result = await queryDB(dummyQuery);
		expect(queryDB).toHaveBeenCalledWith(dummyQuery);
		expect(queryDB).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject(json);
	} catch (error) {
		throw error;
	}
});

//is getDoc mock method valid
test('is getDoc mock method working', async () => {
	try {
		const mockApiObjectMethods = require('./mocks/mockApiObjectMethods');
		//use original ,seprate query
		const apiMockInstMethods = await mockApiObjectMethods(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);

		const { createDoc, getDoc } = apiMockInstMethods;

		//first create a doc
		const dockId = 'user:king_arthur';
		const json = {
			email: 'kingarthur@couchbase.com',
			interests: ['Holy Grail', 'African Swallows'],
		};

		await createDoc(dockId, json);

		//then get that doc
		const result = await getDoc(dockId);
		expect(getDoc).toHaveBeenCalledWith(dockId);
		expect(getDoc).toHaveBeenCalledTimes(1);
		expect(result).not.toBeEmpty();
	} catch (error) {
		throw error;
	}
});

//is updateDoc mock method valid
test('is updateDoc mock method working', async () => {
	try {
		const mockApiObjectMethods = require('./mocks/mockApiObjectMethods');
		//use original ,seprate query
		const apiMockInstMethods = await mockApiObjectMethods(
			'couchbase://' + config.couchBase.HOST,
			config.couchBase.DEFAULT_BUCKET,
			config.couchBase.DEFAULT_USER_NAME,
			config.couchBase.DEFAULT_USER_PASSWORD
		);
		const { updateDoc, createDoc } = apiMockInstMethods;

		//firstly create a json
		const dockId = 'user:king_arthur';
		const originalJson = {
			email: 'kingarthur@couchbase.com',
			interests: ['Holy Grail', 'African Swallows'],
		};
		await createDoc(dockId, originalJson);

		//json data to be updated
		const updatedJson = {
			email: 'emailupdated@couchbase.com',
			interests: ['Holy Grail', 'African Swallows'],
		};

		const result = await updateDoc(dockId, updatedJson);
		expect(updateDoc).toHaveBeenCalledWith(dockId, updatedJson);
		expect(updateDoc).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject(updatedJson);
	} catch (error) {
		throw error;
	}
});
