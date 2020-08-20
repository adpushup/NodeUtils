const couchbase = require('couchbase');
let cluster;

module.exports = (host, username, userPassword) => {
    if(cluster) return cluster;

	cluster = new couchbase.Cluster(host, {
		operation_timeout: 5000
	});

	// RBAC (Role Based Access Control) Authentication,
	// See https://docs.couchbase.com/server/5.1/security/security-rbac-user-management.html
    cluster.authenticate(username, userPassword);

    return {
        cluster,
        couchbase
    };
};