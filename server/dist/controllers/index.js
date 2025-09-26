"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioController = exports.ApplicantAnswerController = exports.ApplicantController = exports.QuestionController = exports.InterviewController = exports.JobController = void 0;
const base_1 = require("./base");
// Job Controller
class JobController extends base_1.CRUDController {
    jobService;
    constructor(jobService) {
        super(jobService);
        this.jobService = jobService;
    }
    validateAndTransformData(data, req) {
        base_1.ValidationUtils.validateRequired(data, ['title', 'description']);
        return {
            title: base_1.ValidationUtils.sanitizeString(data.title),
            description: base_1.ValidationUtils.sanitizeString(data.description),
            requirements: data.requirements ? base_1.ValidationUtils.sanitizeString(data.requirements) : null,
            location: data.location ? base_1.ValidationUtils.sanitizeString(data.location) : null,
            salaryRange: data.salaryRange ? base_1.ValidationUtils.sanitizeString(data.salaryRange) : null,
            status: data.status || 'DRAFT',
            userId: req?.user?.id || data.userId || data.user_id
        };
    }
    async create(req, res) {
        try {
            const data = this.validateAndTransformData(req.body, req);
            const item = await this.service.create(data);
            res.status(201).json(item);
        }
        catch (error) {
            console.error(`Error creating ${this.modelName}:`, error);
            res.status(500).json({ error: `Failed to create ${this.modelName}` });
        }
    }
    async getByUserId(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID format' });
                return;
            }
            const jobs = await this.jobService.findByUserId(userId);
            res.json(jobs);
        }
        catch (error) {
            console.error('Error fetching jobs by user:', error);
            res.status(500).json({ error: 'Failed to fetch jobs' });
        }
    }
    async getPublished(req, res) {
        try {
            const jobs = await this.jobService.findPublished();
            res.json(jobs);
        }
        catch (error) {
            console.error('Error fetching published jobs:', error);
            res.status(500).json({ error: 'Failed to fetch published jobs' });
        }
    }
    async publish(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const job = await this.jobService.update(id, { status: 'PUBLISHED', publishedAt: new Date() });
            res.json(job);
        }
        catch (error) {
            console.error('Error publishing job:', error);
            res.status(500).json({ error: 'Failed to publish job' });
        }
    }
}
exports.JobController = JobController;
// Interview Controller
class InterviewController extends base_1.CRUDController {
    interviewService;
    constructor(interviewService) {
        super(interviewService);
        this.interviewService = interviewService;
    }
    validateAndTransformData(data, req) {
        const isUpdate = req?.method === 'PATCH' || req?.method === 'PUT';
        // For create, require essential fields. For update, allow partial payloads
        if (!isUpdate) {
            base_1.ValidationUtils.validateRequired(data, ['title', 'jobRole']);
        }
        // Build payload conditionally to avoid overwriting fields with undefined
        const out = {};
        if (isUpdate) {
            if (data.title !== undefined)
                out.title = base_1.ValidationUtils.sanitizeString(data.title);
            if (data.jobRole !== undefined)
                out.jobRole = base_1.ValidationUtils.sanitizeString(data.jobRole);
            if (data.description !== undefined)
                out.description = data.description ? base_1.ValidationUtils.sanitizeString(data.description) : null;
            if (data.status !== undefined)
                out.status = data.status;
            if (data.jobId !== undefined || data.job_id !== undefined)
                out.jobId = data.jobId ?? data.job_id;
            // Do not change userId on update
        }
        else {
            out.title = base_1.ValidationUtils.sanitizeString(data.title);
            out.jobRole = base_1.ValidationUtils.sanitizeString(data.jobRole);
            out.description = data.description ? base_1.ValidationUtils.sanitizeString(data.description) : null;
            out.status = data.status || 'DRAFT';
            out.userId = req?.user?.id || data.userId || data.user_id;
            if (data.jobId || data.job_id)
                out.jobId = data.jobId || data.job_id;
        }
        return out;
    }
    async create(req, res) {
        try {
            const data = this.validateAndTransformData(req.body, req);
            const item = await this.service.create(data);
            res.status(201).json(item);
        }
        catch (error) {
            console.error(`Error creating ${this.modelName}:`, error);
            res.status(500).json({ error: `Failed to create ${this.modelName}` });
        }
    }
    async getByUserId(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID format' });
                return;
            }
            const interviews = await this.interviewService.findByUserId(userId);
            res.json({
                data: interviews
            });
        }
        catch (error) {
            console.error('Error fetching interviews by user:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    }
    async getByJobId(req, res) {
        try {
            const jobId = parseInt(req.params.jobId);
            if (isNaN(jobId)) {
                res.status(400).json({ error: 'Invalid job ID format' });
                return;
            }
            const interviews = await this.interviewService.findByJobId(jobId);
            res.json({
                data: interviews
            });
        }
        catch (error) {
            console.error('Error fetching interviews by job:', error);
            res.status(500).json({ error: 'Failed to fetch interviews' });
        }
    }
    async getComplete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const interview = await this.interviewService.findComplete(id);
            if (!interview) {
                res.status(404).json({ error: 'Interview not found' });
                return;
            }
            res.json(interview);
        }
        catch (error) {
            console.error('Error fetching complete interview:', error);
            res.status(500).json({ error: 'Failed to fetch interview' });
        }
    }
    async publish(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const interview = await this.interviewService.update(id, { status: 'PUBLISHED' });
            res.json(interview);
        }
        catch (error) {
            console.error('Error publishing interview:', error);
            res.status(500).json({ error: 'Failed to publish interview' });
        }
    }
}
exports.InterviewController = InterviewController;
// Question Controller
class QuestionController extends base_1.CRUDController {
    questionService;
    llmService;
    constructor(questionService, llmService) {
        super(questionService);
        this.questionService = questionService;
        this.llmService = llmService;
    }
    validateAndTransformData(data, req) {
        // Handle both camelCase and snake_case field names from frontend
        const interviewId = data.interviewId || data.interview_id;
        const userId = req?.user?.id || data.userId || data.user_id;
        base_1.ValidationUtils.validateRequired(data, ['question']);
        // Check required fields with proper field names
        if (!interviewId) {
            throw new Error('Missing required field: interviewId');
        }
        if (!userId) {
            throw new Error('Missing required field: userId - user must be authenticated');
        }
        // Convert difficulty to uppercase enum value
        let difficulty = 'EASY';
        if (data.difficulty) {
            const diff = String(data.difficulty).toUpperCase();
            if (['EASY', 'INTERMEDIATE', 'ADVANCED'].includes(diff)) {
                difficulty = diff;
            }
        }
        return {
            question: base_1.ValidationUtils.sanitizeString(data.question),
            difficulty: difficulty,
            interviewId: interviewId,
            userId: req?.user?.id || data.userId || data.user_id,
        };
    }
    async getByInterviewId(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            if (isNaN(interviewId)) {
                res.status(400).json({ error: 'Invalid interview ID format' });
                return;
            }
            const questions = await this.questionService.findByInterviewId(interviewId);
            res.json({
                data: questions
            });
        }
        catch (error) {
            console.error('Error fetching questions by interview:', error);
            res.status(500).json({ error: 'Failed to fetch questions' });
        }
    }
    // (removed misplaced method)
    async getByDifficulty(req, res) {
        try {
            const difficulty = req.params.difficulty;
            if (!base_1.ValidationUtils.validateEnum(difficulty, ['EASY', 'INTERMEDIATE', 'ADVANCED'])) {
                res.status(400).json({ error: 'Invalid difficulty level' });
                return;
            }
            const questions = await this.questionService.findByDifficulty(difficulty);
            res.json({
                data: questions
            });
        }
        catch (error) {
            console.error('Error fetching questions by difficulty:', error);
            res.status(500).json({ error: 'Failed to fetch questions' });
        }
    }
    /**
     * Generate questions using LLM based on job description
     */
    async generateQuestions(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            const { count = 5 } = req.body;
            const userId = req.user?.id;
            if (isNaN(interviewId)) {
                res.status(400).json({ error: 'Invalid interview ID' });
                return;
            }
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            if (!this.llmService) {
                res.status(503).json({ error: 'LLM service not available' });
                return;
            }
            console.log(`🤖 Generating questions for interview ${interviewId}`);
            // Get interview with job details
            const interview = await this.questionService.prisma.interview.findUnique({
                where: { id: interviewId },
                include: {
                    job: true
                }
            });
            if (!interview) {
                res.status(404).json({ error: 'Interview not found' });
                return;
            }
            const jobDescription = interview.job?.description || interview.description || '';
            const jobTitle = interview.job?.title || interview.jobRole || 'Unknown Position';
            if (!jobDescription.trim()) {
                res.status(400).json({
                    error: 'No job description available. Please add a job description to generate relevant questions.'
                });
                return;
            }
            console.log(`📋 Job: ${jobTitle}`);
            console.log(`📝 Description length: ${jobDescription.length} characters`);
            // Generate questions using LLM
            const generatedQuestions = await this.llmService.generateQuestions(jobDescription, jobTitle, count);
            // Save generated questions to database
            const savedQuestions = [];
            for (const gq of generatedQuestions) {
                try {
                    const question = await this.questionService.create({
                        interviewId: interviewId,
                        question: gq.question,
                        difficulty: gq.difficulty,
                        userId: userId
                    });
                    savedQuestions.push(question);
                    console.log(`✅ Saved question: ${gq.question.substring(0, 50)}...`);
                }
                catch (error) {
                    console.error(`❌ Failed to save question: ${gq.question}`, error);
                }
            }
            res.json({
                success: true,
                data: {
                    generated: generatedQuestions.length,
                    saved: savedQuestions.length,
                    questions: savedQuestions
                }
            });
        }
        catch (error) {
            console.error('❌ Error generating questions:', error);
            res.status(500).json({
                error: `Question generation failed: ${error.message}`
            });
        }
    }
}
exports.QuestionController = QuestionController;
// Applicant Controller
class ApplicantController extends base_1.CRUDController {
    applicantService;
    constructor(applicantService) {
        super(applicantService);
        this.applicantService = applicantService;
    }
    validateAndTransformData(data, req) {
        // Handle both camelCase and snake_case field names from frontend
        const emailAddress = data.emailAddress || data.email_address;
        const phoneNumber = data.phoneNumber || data.phone_number;
        const ownerId = req?.user?.id || data.ownerId || data.owner_id;
        base_1.ValidationUtils.validateRequired(data, ['firstname', 'surname']);
        // Check required fields with proper field names
        if (!emailAddress) {
            throw new Error('Missing required field: emailAddress');
        }
        if (!ownerId) {
            throw new Error('Missing required field: ownerId - user must be authenticated');
        }
        if (!base_1.ValidationUtils.validateEmail(emailAddress)) {
            throw new Error('Invalid email address');
        }
        if (phoneNumber && !base_1.ValidationUtils.validatePhone(phoneNumber)) {
            throw new Error('Invalid phone number');
        }
        return {
            firstname: base_1.ValidationUtils.sanitizeString(data.firstname),
            surname: base_1.ValidationUtils.sanitizeString(data.surname),
            phoneNumber: phoneNumber ? base_1.ValidationUtils.sanitizeString(phoneNumber) : null,
            emailAddress: base_1.ValidationUtils.sanitizeString(emailAddress),
            ownerId: ownerId
        };
    }
    async getAll(req, res) {
        try {
            const applicants = await this.applicantService.getAllWithInterviews();
            res.json({
                data: applicants
            });
        }
        catch (error) {
            console.error('Error fetching applicants:', error);
            res.status(500).json({ error: 'Failed to fetch applicants' });
        }
    }
    async getByInterviewId(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            if (isNaN(interviewId)) {
                res.status(400).json({ error: 'Invalid interview ID format' });
                return;
            }
            const applicants = await this.applicantService.findByInterviewId(interviewId);
            res.json({
                data: applicants
            });
        }
        catch (error) {
            console.error('Error fetching applicants by interview:', error);
            res.status(500).json({ error: 'Failed to fetch applicants' });
        }
    }
    async getByStatus(req, res) {
        try {
            const status = req.params.status;
            if (!base_1.ValidationUtils.validateEnum(status, ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])) {
                res.status(400).json({ error: 'Invalid status' });
                return;
            }
            const applicants = await this.applicantService.findByStatus(status);
            res.json({
                data: applicants
            });
        }
        catch (error) {
            console.error('Error fetching applicants by status:', error);
            res.status(500).json({ error: 'Failed to fetch applicants' });
        }
    }
    async getWithAnswers(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const applicant = await this.applicantService.findWithAnswers(id);
            if (!applicant) {
                res.status(404).json({ error: 'Applicant not found' });
                return;
            }
            res.json(applicant);
        }
        catch (error) {
            console.error('Error fetching applicant with answers:', error);
            res.status(500).json({ error: 'Failed to fetch applicant' });
        }
    }
    async bindToInterview(req, res) {
        try {
            const applicantId = parseInt(req.params.applicantId);
            const { interviewId, status = 'NOT_STARTED' } = req.body;
            if (isNaN(applicantId)) {
                res.status(400).json({ error: 'Invalid applicant ID format' });
                return;
            }
            if (!interviewId) {
                res.status(400).json({ error: 'Interview ID is required' });
                return;
            }
            const result = await this.applicantService.bindToInterview(applicantId, interviewId, status);
            res.json(result);
        }
        catch (error) {
            console.error('Error binding applicant to interview:', error);
            res.status(500).json({ error: 'Failed to bind applicant to interview' });
        }
    }
    async unbindFromInterview(req, res) {
        try {
            const applicantId = parseInt(req.params.applicantId);
            // Accept interviewId from body or query for flexibility
            let interviewId = (req.body && (req.body.interviewId ?? req.body.interview_id)) ?? req.query.interviewId;
            if (typeof interviewId === 'string' && interviewId.startsWith('eq.')) {
                interviewId = interviewId.substring(3);
            }
            if (isNaN(applicantId)) {
                res.status(400).json({ error: 'Invalid applicant ID format' });
                return;
            }
            if (!interviewId || isNaN(Number(interviewId))) {
                res.status(400).json({ error: 'Interview ID is required' });
                return;
            }
            await this.applicantService.unbindFromInterview(applicantId, Number(interviewId));
            res.status(204).send();
        }
        catch (error) {
            console.error('Error unbinding applicant from interview:', error);
            res.status(500).json({ error: 'Failed to unbind applicant from interview' });
        }
    }
    async updateInterviewStatus(req, res) {
        try {
            const applicantId = parseInt(req.params.applicantId);
            const { interviewId, status } = req.body;
            if (isNaN(applicantId)) {
                res.status(400).json({ error: 'Invalid applicant ID format' });
                return;
            }
            if (!interviewId) {
                res.status(400).json({ error: 'Interview ID is required' });
                return;
            }
            if (!base_1.ValidationUtils.validateEnum(String(status), ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])) {
                res.status(400).json({ error: 'Invalid status' });
                return;
            }
            const result = await this.applicantService.updateInterviewStatus(applicantId, Number(interviewId), String(status));
            res.json({ count: result.count });
        }
        catch (error) {
            console.error('Error updating applicant interview status:', error);
            res.status(500).json({ error: 'Failed to update applicant interview status' });
        }
    }
}
exports.ApplicantController = ApplicantController;
// Applicant Answer Controller
class ApplicantAnswerController extends base_1.CRUDController {
    applicantAnswerService;
    constructor(applicantAnswerService) {
        super(applicantAnswerService);
        this.applicantAnswerService = applicantAnswerService;
    }
    validateAndTransformData(data, req) {
        const isUpdate = req?.method === 'PATCH' || req?.method === 'PUT';
        const interviewId = data.interviewId ?? data.interview_id;
        const questionId = data.questionId ?? data.question_id;
        const applicantId = data.applicantId ?? data.applicant_id;
        const userId = req?.user?.id || data.userId || data.user_id;
        if (!isUpdate) {
            if (!interviewId || !questionId || !applicantId) {
                throw new Error('Missing required fields: interviewId, questionId, applicantId');
            }
        }
        const out = {};
        if (isUpdate) {
            if (data.answer !== undefined)
                out.answer = data.answer ? base_1.ValidationUtils.sanitizeString(data.answer) : null;
            if (interviewId !== undefined)
                out.interviewId = interviewId;
            if (questionId !== undefined)
                out.questionId = questionId;
            if (applicantId !== undefined)
                out.applicantId = applicantId;
            // do not overwrite userId on update unless explicitly provided or from req
            if (userId)
                out.userId = userId;
        }
        else {
            out.answer = data.answer ? base_1.ValidationUtils.sanitizeString(data.answer) : null;
            out.interviewId = interviewId;
            out.questionId = questionId;
            out.applicantId = applicantId;
            out.userId = userId;
        }
        return out;
    }
    async getByApplicantId(req, res) {
        try {
            const applicantId = parseInt(req.params.applicantId);
            if (isNaN(applicantId)) {
                res.status(400).json({ error: 'Invalid applicant ID format' });
                return;
            }
            const answers = await this.applicantAnswerService.findByApplicantId(applicantId);
            res.json({
                data: answers
            });
        }
        catch (error) {
            console.error('Error fetching answers by applicant:', error);
            res.status(500).json({ error: 'Failed to fetch answers' });
        }
    }
    async getByQuestionId(req, res) {
        try {
            const questionId = parseInt(req.params.questionId);
            if (isNaN(questionId)) {
                res.status(400).json({ error: 'Invalid question ID format' });
                return;
            }
            const answers = await this.applicantAnswerService.findByQuestionId(questionId);
            res.json({
                data: answers
            });
        }
        catch (error) {
            console.error('Error fetching answers by question:', error);
            res.status(500).json({ error: 'Failed to fetch answers' });
        }
    }
    async getByInterviewId(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            if (isNaN(interviewId)) {
                res.status(400).json({ error: 'Invalid interview ID format' });
                return;
            }
            const answers = await this.applicantAnswerService.findByInterviewId(interviewId);
            res.json({
                data: answers
            });
        }
        catch (error) {
            console.error('Error fetching answers by interview:', error);
            res.status(500).json({ error: 'Failed to fetch answers' });
        }
    }
    async getByInterviewAndApplicant(req, res) {
        try {
            const interviewId = parseInt(req.params.interviewId);
            const applicantId = parseInt(req.params.applicantId);
            if (isNaN(interviewId) || isNaN(applicantId)) {
                res.status(400).json({ error: 'Invalid interview/applicant ID format' });
                return;
            }
            const answers = await this.applicantAnswerService.findByInterviewAndApplicant(interviewId, applicantId);
            res.json({ data: answers });
        }
        catch (error) {
            console.error('Error fetching answers by interview and applicant:', error);
            res.status(500).json({ error: 'Failed to fetch answers' });
        }
    }
    async getWithDetails(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const answer = await this.applicantAnswerService.findWithDetails(id);
            if (!answer) {
                res.status(404).json({ error: 'Answer not found' });
                return;
            }
            res.json(answer);
        }
        catch (error) {
            console.error('Error fetching answer with details:', error);
            res.status(500).json({ error: 'Failed to fetch answer' });
        }
    }
}
exports.ApplicantAnswerController = ApplicantAnswerController;
class AudioController {
    whisperService;
    constructor(whisperService) {
        this.whisperService = whisperService;
        this.whisperService = whisperService;
    }
    async transcribe(req, res) {
        try {
            console.log('req.body type:', typeof req.body);
            console.log('req.body length:', req.body ? req.body.length : 'no body');
            console.log('req.headers:', req.headers);
            console.log('req.body:', req.body);
            const audioBuffer = req.body;
            const result = await this.whisperService.transcribe(audioBuffer);
            console.log('Transcribing audio...');
            res.json(result);
            console.log('Transcribed audio finished，res = ', result);
        }
        catch (error) {
            console.error('Error transcribing audio:', error);
        }
    }
}
exports.AudioController = AudioController;
//# sourceMappingURL=index.js.map