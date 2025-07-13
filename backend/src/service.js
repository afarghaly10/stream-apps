'use strict';

const prompts = require('./prompts');
const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');
const cheerio = require('cheerio');

const openai = new OpenAI();

const extractTextFromHTML = async (html) => {
	const $ = cheerio.load(html);

	$('script, style, nav, header, footer, a, button, svg, noscript').remove();

	let jobText = '';

	const selectors = [
		'div.description__text',
		'div.job-description',
		'section.core-rail',
		'div.pvs-list__outer-container',
		'main',
	];

	for (const selector of selectors) {
		const content = $(selector).text().trim();
		if (content.length > 200) {
			jobText = content;
			break;
		}
	}

	if (!jobText) jobText = $('body').text();

	jobText = jobText.replace(/\s+/g, ' ').trim();
	jobText = jobText.replace(/show more/g, '').replace(/show less/g, '');

	return jobText;
};

const pdfReader = async (filePathOrBuffer) => {
	let buffer;

	if (Buffer.isBuffer(filePathOrBuffer)) {
		buffer = filePathOrBuffer;
	} else if (typeof filePathOrBuffer === 'string') {
		// URL
		if (filePathOrBuffer.startsWith('https')) {
			const response = await axios.get(filePathOrBuffer, {
				responseType: 'arraybuffer',
			});
			buffer = Buffer.from(response.data);
		} else {
			//  Local file
			const resolvedPath = path.resolve(__dirname, filePathOrBuffer);
			if (!fs.existsSync(resolvedPath)) {
				throw new Error('Invalid input type');
			}
			buffer = fs.readFileSync(resolvedPath);
		}
	} else {
		throw new TypeError('Input must be a buffer or a string');
	}

	const pdfData = await pdfParse(buffer);
	return pdfData.text;
};

const promptGenerator = async (prompt, userContent) => {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content: prompt,
			},
			{
				role: 'user',
				content: userContent,
			},
		],
	});
	return response.choices[0].message.content.trim();
};
const responseParser = (response) => {
    return JSON.parse(response.replace(/[\n\r\t]/g, ''));
};
const service = {
	jobAnalysis: async (jobUrl, pdf) => {
    let finalResult = null;
		try {
			const jobDescription = await axios.get(jobUrl);
			const html = jobDescription?.data;
			const initialGoal = await extractTextFromHTML(html);

			// const inputPath = pdf || './resumer.pdf'
			const resume = await pdfReader(pdf);

			// step 1: analyze the job description
			const analysisResponse = await promptGenerator(
				prompts.getStystemPromptForJobAnalysis(initialGoal),
				initialGoal
			);
			const jobAnalysis = responseParser(analysisResponse);

      console.log('----------------------------');
      console.log(`Job Analysis Done`);
      console.log('----------------------------');

			// step 2: Interviewer
			const interviewerResponse = await promptGenerator(
				prompts.getSystemPromptForInterviewerClassifaction(jobAnalysis),
				analysisResponse
			);
			const interviewer = responseParser(interviewerResponse);

      console.log('----------------------------');
			console.log(`Interviewer Done`);
			console.log('----------------------------');

			// step 3: matching skills
			const matchingSkillsResponse = await promptGenerator(
				prompts.getSystemPromptForMatchingSkills(jobAnalysis, resume),
				analysisResponse
			);
			const matchingSkills = responseParser(matchingSkillsResponse);
			const missingSkills = matchingSkills.missingKeywords;

      console.log('----------------------------');
			console.log(`Matching Skills Done`);
			console.log('----------------------------');

			// step 4: generate Questions
			const questionResponse = await promptGenerator(
				prompts.getSystemPromptForQuestionGeneration(jobAnalysis, interviewer),
				analysisResponse
			);
			const questions =
				JSON.parse(questionResponse.replace(/[\n\r\t]/g, '')).questions ||
				JSON.parse(questionResponse.replace(/[\n\r\t]/g, '')).Questions;

      console.log('----------------------------');
			console.log(`Questions Done`);
			console.log('----------------------------');

			// step 5:Answers
			const answerResponse = await promptGenerator(
				prompts.getSystemPromptForAnswerGeneration(resume, questions),
				questionResponse
			);
			const answers = JSON.parse(
				answerResponse.replace(/[\n\r\t]/g, '')
			).Answers;

      console.log('----------------------------');
			console.log(`Answers Done`);
			console.log('----------------------------');

			// step 6: suggest the courses
			const courseResponse = await promptGenerator(
				prompts.getSystemPromptForCourseSuggestion(
					jobAnalysis,
					resume,
					missingSkills
				),
				analysisResponse
			);
			const courses = responseParser(courseResponse);

      console.log('----------------------------');
			console.log(`Courses Done`);
			console.log('----------------------------');

			finalResult = {
				analysis: jobAnalysis,
				interviewer,
				jobMatch: matchingSkills,
				questionsAndAnswers: answers,
				skillsGapAnalysis: courses,
			};
      console.log('----------------------------');
      console.log(`finalResult: >> `, finalResult);
      console.log('----------------------------');
		} catch (error) {
			console.error(`
        Error in jobAnalysis: \n
        ${error?.message} \n
        ${error?.stack} \n
        `);
		}
		return finalResult;
	},
};

module.exports = service;
