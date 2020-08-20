const connection = require('./connection');
const api = require('./api');

module.exports = (host, bucket, username, userPassword) => {
	const cbConnection = connection(host, username, userPassword);
	return api({ bucket, ...cbConnection });
};
