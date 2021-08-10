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
				return Promise.reject('doc does not exist');
			}
			return Promise.resolve(fakeMockData[docId]);
		}),
		getDoc: jest.fn((dockId) => {
			if (!fakeMockData[dockId]) {
				//handle error case for data entry already exist
				return Promise.reject('doc does not exist');
			}
			return Promise.resolve(fakeMockData[dockId]);
		}),
		createDoc: jest.fn((key, json, option) => {
			if (fakeMockData[key]) {
				//handle error case for data entry already exist
				return Promise.reject('doc already exist');
			}
			//else create a new entry for that json
			fakeMockData[key] = { ...json, dateCreated: +new Date(), cas: 1 };
			return Promise.resolve(fakeMockData[key]);
		}),
		updateDoc: jest.fn((docId, doc, cas) => {
			//If cas exist replace method will be called which throws error if doc does not exist also it throws error when cas value is changed
			if (cas) {
				if (!fakeMockData[docId]) {
					//handle error case for data entry not exist
					return Promise.reject('doc does not exist');
				}
				if (fakeMockData[docId].cas !== cas) {
					return Promise.reject('Race condition happen doc cas is invalid');
				}

				fakeMockData[docId] = {
					...doc,
					cas: cas + 1,
					dateModified: +new Date(),
					dateCreated: fakeMockData[docId].dateCreated,
				};
			}
			//will need to ask if we store dateUpdated and dateCreated here
			else fakeMockData[docId] = { ...doc, cas: 1, dateCreated: +new Date() };
			return Promise.resolve(fakeMockData[docId]);
		}),
	};
};
