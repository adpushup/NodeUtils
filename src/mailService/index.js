const Email = require('emailjs'),
	Promise = require('bluebird');

class Mailer {
	constructor(config) {
		if (!config.SMTP_USERNAME || !config.SMTP_PASSWORD || !config.SMTP_SERVER || !config.MAIL_FROM) {
			throw new Error('Missing params during invocation. Required params : SMTP_USERNAME, SMTP_PASSWORD, SMTP_SERVER, MAIL_FROM');
		}
		this.config = config;
		this.server = Promise.promisifyAll(Email.server.connect({
			'user': this.config.SMTP_USERNAME,
			'password': this.config.SMTP_PASSWORD,
			'host': this.config.SMTP_SERVER,
			'ssl': true
		}));
		this.sendMail = this.sendMail.bind(this);
		this.getData = this.getData.bind(this);
	}

	getData(sendData) {
		if (!sendData.to || !sendData.subject || !sendData.body) {
			return Promise.reject({ message: "Incomplete params. Might be missing to/subject/body." });
		} 
		let mailMessage = {
			from: this.config.MAIL_FROM,
			to: sendData.to,
			subject: sendData.subject
		};
		
		sendData.cc ? mailMessage.cc = sendData.cc : null;
		sendData.type === 'html'
		? mailMessage.attachment = [ { data: sendData.body, alternative: true }]
		: mailMessage.text = config.body;

		return Promise.resolve(mailMessage);
	}

	sendMail(mailMessage) {
		return this.server.sendAsync(mailMessage);
	}

	send(sendData) {
		let response = { 
			error: false,
			message: `Mail sent successfully to : ${sendData.to}`
		}
		return this.getData(sendData)
		.then(this.sendMail)
		.then(() => response)
		.catch(err => {
			return Object.assign(response, {
				error: true,
				message: `Mail to ${sendData.to} failed with error : ${err.message}`
			});
		});
	}
}

module.exports = Mailer;