'use strict';

const router = require('express').Router();
const multer = require('multer');
const controller = require('./controller');

router
	.route('/')
	.post(
		multer({
			storage: multer.memoryStorage(),
			fileFilter(req, file, next) {
				next(null, true);
				const allowedMimetypes = ['application/pdf'];
				const isFile = allowedMimetypes.includes(file.mimetype);
				if (isFile) {
					next(null, true);
				} else {
					next(new Error('Invalid file type'), false);
				}
			},
		}).single('pdf'),
		controller.jobAnalysis
	);

module.exports = router;
