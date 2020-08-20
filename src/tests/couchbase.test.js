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
  const cbConnection = connection(
    "couchbase://" + config.couchBase.HOST,
    config.couchBase.DEFAULT_USER_NAME,
    config.couchBase.DEFAULT_USER_PASSWORD
  );
  const _origOpenBucket = cbConnection.openBucket;
  cbConnection.openBucket = function(bucket, callback) {
    console.log("patched openBucket called", bucket);
    return _origOpenBucket(bucket, callback);
  };
  const apiInst = api({bucket: config.couchBase.DEFAULT_BUCKET, ...cbConnection});
});
