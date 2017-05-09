var google = require('googleapis'),
	Promise = require('bluebird'),
	moment = require('moment'),
	_ = require('lodash'),
	googOauthHelper = require('./googleOauth'),
	Adsense = google.adsense('v1.4'),
	adsenseHost = google.adsensehost('v4.1'),
	adUnits = Promise.promisifyAll(adsenseHost.accounts.adunits),
	Accounts = Promise.promisifyAll(Adsense.accounts),
	adclients = Promise.promisifyAll(Adsense.adclients),
	Reports = Promise.promisifyAll(Adsense.reports),
	AdsenseApi = function (oauthClient) {
		this.oauthClient = oauthClient;
		google.options({ auth: oauthClient });
	};

AdsenseApi.prototype = {
	listAccounts: function () {
		return Accounts.listAsync({ auth: this.oauthClient })
			.then(function (json) {
				if (json.items) {
					return json.items;
				}
			});
	},
	doesAccountExists: function (pubId) {
		return Accounts.getAsync({ accountId: pubId }).then(function () {
			return true;
		}).catch(function (err) {
			// obvious error is 404 but if some other error then console log it
			if (err.code !== 404) {
				console.log(err);
			}
			return false;
		});
		/* return this.listAccounts()
			.then(function(accounts) {
				return _.find(accounts, { id: pubId }) ? true : false;
			})*/
	},
	getDomains: function (accountId) {
		return Reports.generateAsync({
			accountId: accountId,
			dimension: 'DOMAIN_NAME',
			metric: 'INDIVIDUAL_AD_IMPRESSIONS',
			sort: 'DOMAIN_NAME',
			startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
			endDate: 'today'
		});
	},
	getAdclients: function () {
		return adclients.listAsync();
	},
	generate: function (config) {
		if (!config.accountId) {
			throw new Error('Account Id not provided in config.')
		}
		return Reports.generateAsync(config)
			.then(function (data) {
				return data;
			});
	},
	getReport: function (config) {
		return this.generate(config)
	},
	getStats: function (config) {
		return this.generate(config)
			.then(function (data) {
				return data.rows;
			});
	}

};

module.exports = {
	getAdsense: function (config, tokens) {
		return googOauthHelper(config).getClient(tokens)
			.then(function (oauthClient) {
				return new AdsenseApi(oauthClient);
			});
	}
};
