const Promise = require("bluebird");
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

const API = {
  queryDB: (query) => {
    return connect().then((bucket) =>
      bucket.queryAsync(N1qlQuery.fromString(query))
    );
  },
  getDoc: (docId) => {
    return connect()
      .then((bucket) => bucket.getAsync(docId))
      .then((res) => res);
  },
  createDoc: (key, json, option) => {
    return connect().then((bucket) => {
      json.dateCreated = +new Date();
      return bucket.insertAsync(key, json, option);
    });
  },
  updateDoc: function (docId, doc, cas) {
    if (cas) {
      return connect().then((bucket) =>
        bucket.replaceAsync(docId, doc, { cas: cas })
      );
    }
    return connect().then((bucket) => bucket.upsertAsync(docId, doc));
  },
};

function init({ bucket, cluster: _cluster, couchbase: _couchbase }) {
  if (!_cluster) throw Error("cluster instance is required");
  if (!_couchbase) throw Error("couchbase instance is required");
  cluster = _cluster;
  couchbase = _couchbase;
  connect(bucket).catch((err) => {
    console.error("Error connecting to cluster", err);
  });

  return API;
}

module.exports = init;
