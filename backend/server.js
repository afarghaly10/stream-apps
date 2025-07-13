const app = require('./app');

const port = process.env.PORT || 9300;

const enforceSsl = process.env.ENFORCE_SSL || 'false';

if (enforceSsl === 'false') {
	app.listen(port);
	console.log(
		`${new Date(Date.now()).toLocaleString()}:
	API running on port ${port}, using host ${process.env.DB_HOST} db_name ${
			process.env.DB_NAME
		}`
	);
} else {
	const https = require('https');
	const fs = require('fs');

	console.log(
		`Using SSL on port ${port}.`
	);

	/**
	 * To generate ssl cert for local (tested on macos)
	 * > openssl req -x509 -days 365 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -config req.cnf -sha256
	 * > openssl rsa -in keytmp.pem -out key.pem
	 */
	const httpsOptions = {
		key: fs.readFileSync('./security/key.pem'),
		cert: fs.readFileSync('./security/cert.pem'),
	};
	https.createServer(httpsOptions, app).listen(port);
}
