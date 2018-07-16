const couchbase = require('couchbase'),
	Promise = require('bluebird'),
	N1qlQuery = couchbase.N1qlQuery,
	connectedBuckets = {};

module.exports = (host, bucket, bucketPassword) => {
	const cluster = new couchbase.Cluster(host),
		connect = () => {
			return new Promise((resolve, reject) => {
				if (connectedBuckets[bucket]) {
					return resolve(connectedBuckets[bucket]);
				}
				connectedBuckets[bucket] = cluster.openBucket(bucket, bucketPassword, err => {
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
				return bucket.insertAsync(key, json, {
					expiry: 60 * 60 * 24 * 30, // expiry date of 30 days will be set to every new doc by default
					...option
				});
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
