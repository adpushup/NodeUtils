const api = require("../couchbase/index");
const _ = require("lodash");
const config = require("../config/config");

beforeAll((done) => {
  done();
});

test("is connected to couchbase", async () => {
  const connectedObj = await api(
    "couchbase://" + config.couchBase.HOST,
    config.couchBase.DEFAULT_BUCKET,
    config.couchBase.DEFAULT_USER_NAME,
    config.couchBase.DEFAULT_USER_PASSWORD
  );
  expect(typeof connectedObj === "object").toBe(true);
});
