const cbWrapper = require("../couchbase");
const connection = require("../couchbase/connection");
const api = require("../couchbase/api");
const _ = require("lodash");
const config = require("../config/config");

beforeAll((done) => {
  done();
});

test("cbWrapper returns API Object", async () => {
  const connectedObj = await cbWrapper(
    "couchbase://" + config.couchBase.HOST,
    config.couchBase.DEFAULT_BUCKET,
    config.couchBase.DEFAULT_USER_NAME,
    config.couchBase.DEFAULT_USER_PASSWORD
  );
  expect(typeof connectedObj === "object").toBe(true);
  // also test specific methods
});

// path connection object to mock couchbase connection behaviour
test("mock couchbase connection", async () => {
  const { cluster, couchbase } = connection(
    "couchbase://" + config.couchBase.HOST,
    config.couchBase.DEFAULT_USER_NAME,
    config.couchBase.DEFAULT_USER_PASSWORD
  );

  const _origOpenBucket = cluster.openBucket;
  cluster.openBucket = function (bucket, callback) {
    return _origOpenBucket.call(cluster, bucket, callback);
  };

  //from this api object we can create timer,check callback object is function,check different api poiting to same API object,All Api queries should be executed at a single time when promise is resolved.
  const apiInst = api({
    bucket: config.couchBase.DEFAULT_BUCKET,
    cluster,
    couchbase,
  });
});
