'use strict';

const service = require('./service');

const controller = {
	jobAnalysis: async (req, res, next) => {
		try {
      console.log('----------------------------');
      console.log(`Process Started`);
      console.log('----------------------------');
      const { jobUrl } = req.body
      const pdf = req.file?.buffer

      const response = await service.jobAnalysis(jobUrl, pdf)

      res.json(response)

    } catch (error) {
      next(error);
    }
	},
};

module.exports = controller;
