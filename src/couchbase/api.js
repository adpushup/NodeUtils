const Promise = require('bluebird');
let couchbase;
let cluster;
const connectedBuckets = {};

const connect = (bucket) => {
	if (connectedBuckets[bucket]) {
		return connectedBuckets[bucket];
	}

	connectedBuckets[bucket] = new Promise((resolve, reject) => {
		const bucketInstance = cluster.openBucket(bucket, (err) => {
			if (err) {
				return reject(err);
			}
			return resolve(Promise.promisifyAll(bucketInstance));
		});
	});
	return connectedBuckets[bucket];
};

const API = (bucket) => {
	return {
		queryDB: (query) => {
			return connect(bucket).then((bucket) =>
				bucket.queryAsync(couchbase.N1qlQuery.fromString(query))
			);
		},
		getDoc: (docId) => {
			return connect(bucket)
				.then((bucket) => bucket.getAsync(docId))
				.then((res) => res);
		},
		createDoc: (key, json, option) => {
			return connect(bucket).then((bucket) => {
				json.dateCreated = +new Date();
				return bucket.insertAsync(key, json, option);
			});
		},
		updateDoc: function (docId, doc, cas) {
			if (cas) {
				return connect(bucket).then((bucket) => bucket.replaceAsync(docId, doc, { cas: cas }));
			}
			return connect().then((bucket) => bucket.upsertAsync(docId, doc));
		},
		getCouchBaseObj: () => couchbase,
		getBucketConnection: () => connectedBuckets[bucket],
	};
};

function init({ bucket, cluster: _cluster, couchbase: _couchbase }) {
	if (!_cluster) throw Error('cluster instance is required');
	if (!_couchbase) throw Error('couchbase instance is required');
	cluster = _cluster;
	couchbase = _couchbase;
	connect(bucket).catch((err) => {
		console.error('Error connecting to cluster', err);
	});
	return API(bucket);
}

module.exports = init;
