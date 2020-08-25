const connection = require('../../couchbase/connection');
const api = require('../../couchbase/api');

const fakeMockData = {};

module.exports = (host, bucket, username, userPassword) => {
	const cbConnection = connection(host, username, userPassword);
	const originalMethods = api({ bucket, ...cbConnection });
	return {
		queryDB: jest.fn((query) => {
			const docId = query.substring(query.indexOf('meta().id=') + 10).split(' ')[0];
			if (!docId || !fakeMockData[docId]) {
				throw 'doc does not exist';
			}
			return Promise.resolve(fakeMockData[docId]);
		}),
		getDoc: jest.fn((dockId) => {
			return Promise.resolve(fakeMockData[dockId]);
		}),
		createDoc: jest.fn((key, json, option) => {
			if (fakeMockData[key]) {
				//handle error case for data entry already exist
				throw 'doc does not exist';
			}
			//else create a new entry for that json
			json.dateCreated = +new Date();
			fakeMockData[key] = json;
			return Promise.resolve(fakeMockData[key]);
		}),
		updateDoc: jest.fn((docId, doc, cas) => {
			if (!fakeMockData[docId]) {
				//handle error case for data entry not exist
				throw 'Key does not exist';
			}
			//else update the entry in with key in fakeMockdata
			fakeMockData[docId] = doc;
			return Promise.resolve(fakeMockData[docId]);
		}),
	};
};
