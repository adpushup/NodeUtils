/**
 * Created by Dhiraj on 3/4/2016.
 */
var url = require('url'),
	logger = require('./logger'),
	CryptoJS = require('crypto-js'),
	API = {
		random: function(low, high) {
			return Math.floor(Math.random() * (high - low) + low);
		},
		randomString: function(len) {
			len = (len && this.toNumber(len) && (len > 1)) ? len : 10;

			return Math.random().toString(16).substr(2, len);
		},
		domanize: function(domain) {
			return domain ? API.rightTrim(domain.replace('http://', '').replace('https://', '').replace('www.', ''), '/') : '';
		},
		rightTrim: function(string, s) {
			return string ? string.replace(new RegExp(s + '*$'), '') : '';
		},
		getDomain: function(u) {
			var parsedUrl = url.parse(u);
			return parsedUrl.protocol + '//' + parsedUrl.hostname;
		},
		toNumber: function(a) {
			a = parseInt(a, 10);
			return isNaN(a) ? 0 : a;
		},
		htmlEntities: function(str) {
			return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},
		toFloat: function(a, precison) {
			a = parseFloat(a);
			return (isNaN(a) || 0) ? 0 : parseFloat(a.toFixed(precison || 2));
		},
		logInfo: function(message) {
			logger.info(message);
		},
		logError: function(err) {
			logger.log('error', err);
		},
		getHmacSHA256: function(message, secretKey) {
			var hash = CryptoJS.HmacSHA256(message, secretKey),
				hashInHex = CryptoJS.enc.Hex.stringify(hash);

			return hashInHex;
		},
		sanitiseString: function(str) {
			return str.trim().toLowerCase();
		},
		trimString: function(str) {
			return str.trim();
		},
		// getSafeUrl, Generates a safe url by using url.parse
		// @return String
		// @param String
		getSafeUrl: function(unsafeUrl) {
			var str = url.parse((typeof unsafeUrl === 'string') ? unsafeUrl.trim() : '');

			return str.href;
		}
	};

module.exports = API;
