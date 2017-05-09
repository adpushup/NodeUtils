const google = require('googleapis'),
	OAuth2 = google.auth.OAuth2,
	Promise = require('bluebird'),
	getOauth2Client = (config) => {
		let oauth2Client = new OAuth2(config.OAUTH_CLIENT_ID, config.OAUTH_CLIENT_SECRET, config.OAUTH_CALLBACK);
		return Promise.promisifyAll(oauth2Client);
	}


module.exports = (config) => {
	const oauth2Client = getOauth2Client(config);
	return {
		getClient: function ({ accessToken, refreshToken }) {

			oauth2Client.setCredentialsAsync({
				access_token: accessToken,
				refresh_token: refreshToken
			})
				.then(oauth2UpdatedClient.refreshAccessTokenAsync)
				.then(oauth2Client.setCredentialsAsync)
				.then(() => { oauth2Client })
		},
		getRedirectUrl: function (state) {
			return oauth2Client.generateAuthUrl({
				access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
				scope: config.googleOauth.OAUTH_SCOPE, // If you only need one scope you can pass it as string
				// eslint-disable-next-line new-undef
				'client_id': config.googleOauth.OAUTH_CLIENT_ID,
				approval_prompt: 'force',
				state: state// unique long string
			});
		},
		getAccessTokens: function (code) {
			return oauth2Client.getTokenAsync(code);
		}
	}
};

