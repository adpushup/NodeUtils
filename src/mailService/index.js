const Promise = require('bluebird');
const Email = require('emailjs');

class Mailer {
	constructor(config) {
		if (!config.SMTP_USERNAME || !config.SMTP_PASSWORD || !config.SMTP_SERVER || !config.MAIL_FROM) {
			throw new Error(
				'Missing params during invocation. Required params : SMTP_USERNAME, SMTP_PASSWORD, SMTP_SERVER, MAIL_FROM'
			);
		}
		this.config = config;
		this.server = Promise.promisifyAll(
			Email.server.connect({
				user: this.config.SMTP_USERNAME,
				password: this.config.SMTP_PASSWORD,
				host: this.config.SMTP_SERVER,
				ssl: true
			})
		);
		this.sendMail = this.sendMail.bind(this);
		this.getData = this.getData.bind(this);
	}

	getData(data) {
		if (!data.to || !data.subject || !data.body) {
			return Promise.reject({ message: 'Incomplete params. Might be missing to/subject/body.' });
		}
		const message = {
			from: this.config.MAIL_FROM,
			to: data.to,
			subject: data.subject
		};

		data.cc ? (message.cc = data.cc) : null;
		data.bcc ? (message.bcc = data.bcc) : null;
		data.type === 'html'
			? (message.attachment = [{ data: data.body, alternative: true }])
			: (message.text = data.body);

		if (data.attachments) {
			message.attachment = message.attachment || [];
			message.attachment = [...message.attachment, ...data.attachments];
		}

		return Promise.resolve(message);
	}

	sendMail(mail) {
		return this.server.sendAsync(mail);
	}

	send(data) {
		const response = {
			error: false,
			message: `Mail sent successfully to : ${data.to}`
		};
		return this.getData(data)
			.then(this.sendMail)
			.then(() => response)
			.catch(err => {
				const response = {
					error: true,
					message: `Mail to ${data.to} failed with error : ${err.message}`
				};
				return Promise.reject(response);
			});
	}
}

module.exports = Mailer;
