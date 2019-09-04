const couchbase = require('couchbase'),
	Promise = require('bluebird'),
	N1qlQuery = couchbase.N1qlQuery,
	connectedBuckets = {};

module.exports = (host, bucket, username, userPassword) => {
	const cluster = new couchbase.Cluster(host, {
		operation_timeout: 5000
	});

	// RBAC (Role Based Access Control) Authentication,
	// See https://docs.couchbase.com/server/5.1/security/security-rbac-user-management.html
	cluster.authenticate(username, userPassword);

	const connect = () => {
		return new Promise((resolve, reject) => {
			if (connectedBuckets[bucket]) {
				return resolve(connectedBuckets[bucket]);
			}
			connectedBuckets[bucket] = cluster.openBucket(bucket, err => {
				if (err) {
					return reject(err);
				}
				connectedBuckets[bucket] = Promise.promisifyAll(connectedBuckets[bucket]);
				return resolve(connectedBuckets[bucket]);
			});
		});
	};

	return {
		queryDB: query => {
			return connect().then(bucket => bucket.queryAsync(N1qlQuery.fromString(query)));
		},
		getDoc: docId => {
			return connect()
				.then(bucket => bucket.getAsync(docId))
				.then(res => res);
		},
		createDoc: (key, json, option) => {
			return connect().then(bucket => {
				json.dateCreated = +new Date();
				return bucket.insertAsync(key, json, option);
			});
		},
		updateDoc: function(docId, doc, cas) {
			if (cas) {
				return connect().then(bucket => bucket.replaceAsync(docId, doc, { cas: cas }));
			}
			return connect().then(bucket => bucket.upsertAsync(docId, doc));
		}
	};
};
