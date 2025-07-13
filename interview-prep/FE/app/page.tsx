'use client';

import type React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
	AlertTriangle,
	Briefcase,
	ExternalLink,
	FileText,
	Link,
	Loader2,
	MessageSquare,
	Target,
	TrendingUp,
	Upload,
	User,
} from 'lucide-react';
import { useState } from 'react';

interface AnalysisResponse {
	analysis: {
		primary_role_and_responsibilities: {
			role: string;
			department: string;
			responsibilities: string[];
		};
		required_skills_and_qualifications: {
			degree: string;
			experience: {
				total_experience: string;
				leadership_experience: string;
			};
			technical_skills: string[];
			additional_skills: string[];
		};
		industry_or_domain: {
			sector: string;
			sub_sector: string;
			focus: string;
		};
	};
	interviewer: {
		position: string;
		Justification: string;
	};
	jobMatch: {
		match_percentage: number;
		summary: string;
		matchedKeywords: string[];
		missingKeywords: string[];
	};
	questionsAndAnswers: Array<{
		question: string;
		answer: string;
	}>;
	skillsGapAnalysis: {
		[key: string]: {
			priority: number;
			reason: string;
			course: {
				title: string;
				description: string;
				link: string;
			};
		};
	};
}

export default function InterviewPrepApp() {
	const [jobUrl, setJobUrl] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [response, setResponse] = useState<AnalysisResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.type === 'application/pdf') {
			setSelectedFile(file);
			setError(null);
		} else {
			setError('Please select a valid PDF file');
			setSelectedFile(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!jobUrl || !selectedFile) {
			setError('Please provide both job URL and PDF file');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('jobUrl', jobUrl);
			formData.append('pdf', selectedFile);

			const res = await fetch('/api/', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			const data: AnalysisResponse = await res.json();
			setResponse(data);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'An error occurred while processing your request'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setJobUrl('');
		setSelectedFile(null);
		setResponse(null);
		setError(null);
	};

	// Sort skills gap analysis by priority
	const sortedSkillsGap = response?.skillsGapAnalysis
		? Object.entries(response.skillsGapAnalysis).sort(
				([, a], [, b]) => a.priority - b.priority
		  )
		: [];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
			</div>

			<div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
				<div className="text-center mb-8 animate-fade-in">
					<h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
						Interview Prep Assistant
					</h1>
					<p className="text-gray-300">
						Upload your resume and job URL to get personalized interview
						questions
					</p>
				</div>

				{!response ? (
					<Card className="mb-8 bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-slide-up">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-white">
								<Briefcase className="h-5 w-5 text-blue-400" />
								Get Started
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<label
										htmlFor="jobUrl"
										className="text-sm font-medium flex items-center gap-2 text-gray-200"
									>
										<Link className="h-4 w-4 text-blue-400" />
										Job URL
									</label>
									<Input
										id="jobUrl"
										type="url"
										placeholder="https://example.com/job-posting"
										value={jobUrl}
										onChange={(e) => setJobUrl(e.target.value)}
										className="w-full bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="resume"
										className="text-sm font-medium flex items-center gap-2 text-gray-200"
									>
										<FileText className="h-4 w-4 text-blue-400" />
										Resume (PDF)
									</label>
									<div className="flex items-center gap-4">
										<Input
											id="resume"
											type="file"
											accept=".pdf"
											onChange={handleFileChange}
											className="w-full bg-gray-700/50 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
										/>
										{selectedFile && (
											<Badge
												variant="secondary"
												className="flex items-center gap-1 bg-blue-600/20 text-blue-300 border-blue-500/30"
											>
												<FileText className="h-3 w-3" />
												{selectedFile.name}
											</Badge>
										)}
									</div>
								</div>

								{error && (
									<Alert
										variant="destructive"
										className="bg-red-900/20 border-red-500/30 text-red-300"
									>
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<Button
									type="submit"
									disabled={isLoading || !jobUrl || !selectedFile}
									className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105"
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Analyzing...
										</>
									) : (
										<>
											<Upload className="mr-2 h-4 w-4" />
											Generate Interview Questions
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6 animate-fade-in">
						<div className="flex justify-between items-center">
							<h2 className="text-3xl font-bold text-white">
								Interview Analysis Results
							</h2>
							<Button
								onClick={handleReset}
								variant="outline"
								className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 bg-transparent"
							>
								Start New Analysis
							</Button>
						</div>

						{/* Job Match Score */}
						<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-slide-up">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-white">
									<Target className="h-5 w-5 text-green-400" />
									Job Match Analysis
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-4">
									<div className="flex-1">
										<div className="flex justify-between items-center mb-2">
											<span className="text-sm font-medium text-gray-300">
												Match Percentage
											</span>
											<span className="text-2xl font-bold text-green-400">
												{response.jobMatch.match_percentage}%
											</span>
										</div>
										<Progress
											value={response.jobMatch.match_percentage}
											className="h-3 bg-gray-700"
										/>
									</div>
								</div>
								<p className="text-sm text-gray-300">
									{response.jobMatch.summary}
								</p>

								<div className="grid md:grid-cols-2 gap-4 mt-4">
									<div>
										<h4 className="font-semibold text-sm text-green-400 mb-2">
											Matched Keywords
										</h4>
										<div className="flex flex-wrap gap-2">
											{(response.jobMatch.matchedKeywords || []).map(
												(keyword, index) => (
													<Badge
														key={index}
														className="bg-green-600/20 text-green-300 border-green-500/30"
													>
														{keyword}
													</Badge>
												)
											)}
										</div>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-red-400 mb-2">
											Missing Keywords
										</h4>
										<div className="flex flex-wrap gap-2">
											{(response.jobMatch.missingKeywords || []).map(
												(keyword, index) => (
													<Badge
														key={index}
														className="bg-red-600/20 text-red-300 border-red-500/30"
													>
														{keyword}
													</Badge>
												)
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Job Analysis */}
						<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-slide-up delay-100">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-white">
									<Briefcase className="h-5 w-5 text-blue-400" />
									Job Analysis
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<h4 className="font-semibold text-sm text-blue-400 mb-2">
											Role Title
										</h4>
										<p className="text-sm text-gray-300">
											{response.analysis.primary_role_and_responsibilities.role}
										</p>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-blue-400 mb-2">
											Department
										</h4>
										<p className="text-sm text-gray-300">
											{
												response.analysis.primary_role_and_responsibilities
													.department
											}
										</p>
									</div>
								</div>
								<Separator className="bg-gray-700" />
								<div>
									<h4 className="font-semibold text-sm text-blue-400 mb-2">
										Key Responsibilities
									</h4>
									<ul className="text-sm text-gray-300 space-y-1">
										{(
											response.analysis.primary_role_and_responsibilities
												.responsibilities || []
										).map((resp, index) => (
											<li key={index} className="flex items-start gap-2">
												<span className="text-blue-400 mt-1">•</span>
												<span>{resp}</span>
											</li>
										))}
									</ul>
								</div>
								<Separator className="bg-gray-700" />
								<div className="grid md:grid-cols-3 gap-4">
									<div>
										<h4 className="font-semibold text-sm text-blue-400 mb-2">
											Sector
										</h4>
										<p className="text-sm text-gray-300">
											{response.analysis.industry_or_domain.sector}
										</p>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-blue-400 mb-2">
											Sub-Sector
										</h4>
										<p className="text-sm text-gray-300">
											{response.analysis.industry_or_domain.sub_sector}
										</p>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-blue-400 mb-2">
											Focus
										</h4>
										<p className="text-sm text-gray-300">
											{response.analysis.industry_or_domain.focus}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Required Skills */}
						<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-slide-up delay-200">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-white">
									<TrendingUp className="h-5 w-5 text-purple-400" />
									Required Skills & Qualifications
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<h4 className="font-semibold text-sm text-purple-400 mb-2">
										Education
									</h4>
									<p className="text-sm text-gray-300">
										{
											response.analysis.required_skills_and_qualifications
												.degree
										}
									</p>
								</div>
								<Separator className="bg-gray-700" />
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<h4 className="font-semibold text-sm text-purple-400 mb-2">
											Total Experience
										</h4>
										<p className="text-sm text-gray-300">
											{
												response.analysis.required_skills_and_qualifications
													.experience.total_experience
											}
										</p>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-purple-400 mb-2">
											Leadership Experience
										</h4>
										<p className="text-sm text-gray-300">
											{
												response.analysis.required_skills_and_qualifications
													.experience.leadership_experience
											}
										</p>
									</div>
								</div>
								<Separator className="bg-gray-700" />
								<div>
									<h4 className="font-semibold text-sm text-purple-400 mb-2">
										Technical Skills
									</h4>
									<div className="flex flex-wrap gap-2">
										{(
											response.analysis.required_skills_and_qualifications
												.technical_skills || []
										).map((skill, index) => (
											<Badge
												key={index}
												className="bg-purple-600/20 text-purple-300 border-purple-500/30"
											>
												{skill}
											</Badge>
										))}
									</div>
								</div>
								<Separator className="bg-gray-700" />
								<div>
									<h4 className="font-semibold text-sm text-purple-400 mb-2">
										Additional Skills
									</h4>
									<div className="flex flex-wrap gap-2">
										{(
											response.analysis.required_skills_and_qualifications
												.additional_skills || []
										).map((skill, index) => (
											<Badge
												key={index}
												className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
											>
												{skill}
											</Badge>
										))}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Skills Gap Analysis */}
						<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-slide-up delay-250">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-white">
									<AlertTriangle className="h-5 w-5 text-yellow-400" />
									Skills Gap Analysis & Recommendations
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{sortedSkillsGap.map(([skillKey, skillData], index) => (
										<div
											key={skillKey}
											className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
										>
											<div className="flex items-start justify-between mb-3">
												<div className="flex items-center gap-3">
													<Badge
														className={`text-xs ${
															skillData.priority <= 2
																? 'bg-red-600'
																: skillData.priority <= 4
																? 'bg-yellow-600'
																: 'bg-blue-600'
														}`}
													>
														Priority {skillData.priority}
													</Badge>
													<h4 className="font-semibold text-white capitalize">
														{skillKey.replace(/_/g, ' ')}
													</h4>
												</div>
											</div>
											<p className="text-sm text-gray-300 mb-3">
												{skillData.reason}
											</p>
											<div className="bg-gray-800/50 p-3 rounded-md">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<h5 className="font-medium text-blue-300 mb-1">
															{skillData.course.title}
														</h5>
														<p className="text-xs text-gray-400 mb-2">
															{skillData.course.description}
														</p>
													</div>
													<Button
														size="sm"
														variant="outline"
														className="ml-3 border-blue-500/30 text-blue-300 hover:bg-blue-600/20 bg-transparent"
														onClick={() =>
															window.open(skillData.course.link, '_blank')
														}
													>
														<ExternalLink className="h-3 w-3 mr-1" />
														View Course
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Interviewer Type */}
						<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-slide-up delay-300">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-white">
									<User className="h-5 w-5 text-orange-400" />
									Expected Interviewer
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center gap-2">
									<Badge className="bg-orange-600/20 text-orange-300 border-orange-500/30">
										{response.interviewer.position}
									</Badge>
								</div>
								<p className="text-sm text-gray-300">
									{response.interviewer.Justification}
								</p>
							</CardContent>
						</Card>

						{/* Interview Questions & Answers */}
						<Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm animate-slide-up delay-400">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-white">
									<MessageSquare className="h-5 w-5 text-cyan-400" />
									Interview Questions & Sample Answers (
									{response['questionsAndAnswers']?.length || 0})
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									{(response['questionsAndAnswers'] || []).map((qa, index) => (
										<div key={index} className="space-y-3">
											<div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
												<div className="flex items-start gap-3">
													<Badge className="text-xs bg-blue-600 hover:bg-blue-700">
														Q{index + 1}
													</Badge>
													<p className="text-sm font-medium flex-1 text-blue-200">
														{qa.question}
													</p>
												</div>
											</div>
											<div className="p-3 bg-emerald-900/20 rounded-lg ml-6 border border-emerald-500/30">
												<div className="flex items-start gap-3">
													<Badge className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
														A
													</Badge>
													<p className="text-sm flex-1 text-emerald-200">
														{qa.answer}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>

			<style jsx>{`
				@keyframes fade-in {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes slide-up {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-fade-in {
					animation: fade-in 0.6s ease-out;
				}

				.animate-slide-up {
					animation: slide-up 0.6s ease-out;
				}

				.delay-100 {
					animation-delay: 0.1s;
				}
				.delay-200 {
					animation-delay: 0.2s;
				}
				.delay-250 {
					animation-delay: 0.25s;
				}
				.delay-300 {
					animation-delay: 0.3s;
				}
				.delay-400 {
					animation-delay: 0.4s;
				}
				.delay-500 {
					animation-delay: 0.5s;
				}
			`}</style>
		</div>
	);
}
