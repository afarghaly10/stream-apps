'use strict';

const prompts = {
	getStystemPromptForJobAnalysis: (jobDescription) => {
		return `
    You are an expert in analyzing job descriptions. Given the following job description, provide a detailed breakdown of:
    1. The primary role and responsibilities.
    2. The required skills and qualifications.
    3. The industry or domain.

    Job Description: ${jobDescription}

    Format your response as a JSON object

    Response Format:
    {
      primary_role_and_responsibilities: {
        role: "Role",
        responsibilities: [responsibilities],
        department: "Department"
      },
      required_skills_and_qualifications: {
        degree: "degree required",
        experience:{
          total_experience: "total experience required",
          leadership_experience: "leadership experience required"
        }
        technical_skills: [technical_skills],
        additional_skills: [additional_skills]
      },
      industry_or_domain: {
        sector: "sector",
        sub_sector: "sub_sector",
        focus: "focus"
      }
    }
    `;
	},
	getSystemPromptForInterviewerClassifaction: (jobAnalysis) => {
		return `
    Based on the following job description, determine who the most likely invterviewer would be:
    1. Technical Lead
    2. HR / HR Manager
    3. Depeartment Head
    4. Other (specify)

    Analysis: ${jobAnalysis}

    Format your response as a JSON object

    Response Format:
    - position: [Type]
    - Justification: [Reasoning]
    `;
	},
	getSystemPromptForMatchingSkills: (jobAnalysis, resume) => {
		const {
			primary_role_and_responsibilities = {},
			required_skills_and_qualifications = {},
			industry_or_domain = '',
		} = jobAnalysis || {};

		const { role = '', responsibilities = [] } =
			primary_role_and_responsibilities;

		const {
			education = '',
			experience = '',
			techincal_skills = [],
			additional_skills = [],
		} = required_skills_and_qualifications;

		const jobDescription = `
      Role: ${role}

      Responsibilities: ${responsibilities.map((r) => `- ${r}`).join('\n')}

      Required Skills and Qualifications:

      Education:
      - ${education}

      Experience:
      - ${experience}

      Technical Skills:
      - ${techincal_skills.map((s) => `- ${s}`).join('\n')}

      Additional Skills:
      - ${additional_skills.map((s) => `- ${s}`).join('\n')}

      Industry or Domain:
      - ${industry_or_domain}
      `;
		return `
      You are a job matching assistant. Your task is to analyze how well the following resume matches the provided job description.

      # Instructions:
      1. Indetify key requirements from the job description: skills, experience, tools, certifications, etc.
      2. Compare these requirements with the candidate's resume.
      3. Calculate a match percentage based on relevance and completeness.
      4. Provide a concise summary of explaining your evaluation.
      5. Format your output as a JSON object with the following structure:
      {
        "match_percentage": <number between 0 and 100>,
        "summary": <string>,
        "matchedKeywords": ["keyword1", "keyword2", "keyword3", ...],
        "missingKeywords": ["keyword1", "keyword2", "keyword3", ...]
      }

      ### Job Description:
      """
      ${jobDescription.trim()}
      """

      ### Resume:
      """
      ${resume.trim()}
      """

      Format your answer as JSON object
      ### Output:
       {
        matchPercentage: [Match Percentage],
        summary: [Summary],
        matchedKeywords: [Matched Keywords],
        missingKeywords: [Missing Keywords]
      }
      `;
	},
	getSystemPromptForAnswerGeneration: (resume, data) => {
		const questions = data?.map((item) => item.question);
		return `
    You are an experienced job candidate preparing for an interview. Based on the following resume, generate thoughtful and personalized answers to provided interview questions.

    ### Resume:
    """
    ${resume}
    """

    Interview Questions:
    ${questions.map((q) => `- ${q}`).join('\n')}

    Ensure all ${
			questions.length
		} questions are answered. DO NOT skip any question.

    Format your answer as a JSON object
    Output Format:
    {
      "Answers": [
        {
          "question": "Original question text (match exactly)",
          "answer": "Personalized answer based on resume"
        },
        ...
      ]
    }
    `;
	},
	getSystemPromptForQuestionGeneration: (
		jobAnalysis,
		interviewer,
		numberOfQuestions = 15
	) => {
		return `
    Based on the following job description analysis and the indentified interviewer type, generate ${numberOfQuestions} relevant interview questions.

    Job Description Analysis: ${jobAnalysis}
    Interviewer Type: ${interviewer}

    Format your answer as a JSON object
    Output Format:
    {
      "Questions": [
        {
          "question": "question text",
          "category": "question category"
        }
        ...
      ]
    }
    `;
	},
	getSystemPromptForCourseSuggestion: (jobAnalysis, resume, missingSkills) => {
		return `
    You are an Udemy expert.

    This person whom resume ${resume} is applying for the position which porvided ${jobAnalysis}
    According to a developed ai program it turned out that the person is missing ${missingSkills
			.map((s) => `- ${s}`)
			.join('\n')} skills.

    1. Rank the skills in priority. Highest priority first and least priority last.
    2. For each skill missing. suggest a valid and existing course from https://www.udemy.com/ that enables this person to gain the the required skills.

    ignore masters and Ph.Ds

    Format your answer as a JSON object
    Response Format:
    "Course Title" : {
      "priority": [Rank],
      "reason": [Reasoning relative to the job task],
      "course": {
        "title": [Course Title],
        "description": [Course Description],
        "link": [Course URL],
      }
    }
    `;
	},
};

module.exports = prompts;


// https://www.linkedin.com/jobs/view/4261995297
