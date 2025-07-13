// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const AWS = require('aws-sdk');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Enable CORS
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
	origin: (origin, callback) => {
		// If we're on a test server or a domain is not provided
		if (process.env.NODE_ENV == 'test' || origin == undefined) {
			callback(null, true);
			return;
		}
	},
}));

app.use((req, res, next) => {
	if (process.env.DISABLE_API === 'true') {
		res.sendStatus(503);
	}
	next();
});

// app.use(cors({exposedHeaders: 'Authorization', origin: '*'}));
const xmlparser = require('express-xml-bodyparser');
app.use(xmlparser());
const rawBodySaver = function(req, res, buf, encoding) {
	if (buf && buf.length) {
		req.rawBody = buf.toString(encoding || 'utf8');
	}
};
// Set json as response.
app.use(bodyParser.urlencoded({extended: false, verify: rawBodySaver}));
app.use(bodyParser.json({verify: rawBodySaver}));


// Routes
const routes = require('./src/routes');

// using the routes
app.use('/', routes);


module.exports = app;
