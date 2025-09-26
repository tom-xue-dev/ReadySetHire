import { Request, Response } from 'express';
import { CRUDController } from './base';
import { JobService, InterviewService, QuestionService, ApplicantService, ApplicantAnswerService } from '../services/database';
import { WhisperService } from '../services/whisper';
import { LLMService } from '../services/llm';
export declare class JobController extends CRUDController<any> {
    private jobService;
    constructor(jobService: JobService);
    protected validateAndTransformData(data: any, req?: any): any;
    create(req: Request, res: Response): Promise<void>;
    getByUserId(req: Request, res: Response): Promise<void>;
    getPublished(req: Request, res: Response): Promise<void>;
    publish(req: Request, res: Response): Promise<void>;
}
export declare class InterviewController extends CRUDController<any> {
    private interviewService;
    constructor(interviewService: InterviewService);
    protected validateAndTransformData(data: any, req?: any): any;
    create(req: Request, res: Response): Promise<void>;
    getByUserId(req: Request, res: Response): Promise<void>;
    getByJobId(req: Request, res: Response): Promise<void>;
    getComplete(req: Request, res: Response): Promise<void>;
    publish(req: Request, res: Response): Promise<void>;
}
export declare class QuestionController extends CRUDController<any> {
    private questionService;
    private llmService?;
    constructor(questionService: QuestionService, llmService?: LLMService | undefined);
    protected validateAndTransformData(data: any, req?: any): any;
    getByInterviewId(req: Request, res: Response): Promise<void>;
    getByDifficulty(req: Request, res: Response): Promise<void>;
    /**
     * Generate questions using LLM based on job description
     */
    generateQuestions(req: Request, res: Response): Promise<void>;
}
export declare class ApplicantController extends CRUDController<any> {
    private applicantService;
    constructor(applicantService: ApplicantService);
    protected validateAndTransformData(data: any, req?: any): any;
    getAll(req: Request, res: Response): Promise<void>;
    getByInterviewId(req: Request, res: Response): Promise<void>;
    getByStatus(req: Request, res: Response): Promise<void>;
    getWithAnswers(req: Request, res: Response): Promise<void>;
    bindToInterview(req: Request, res: Response): Promise<void>;
    unbindFromInterview(req: Request, res: Response): Promise<void>;
    updateInterviewStatus(req: Request, res: Response): Promise<void>;
}
export declare class ApplicantAnswerController extends CRUDController<any> {
    private applicantAnswerService;
    constructor(applicantAnswerService: ApplicantAnswerService);
    protected validateAndTransformData(data: any, req?: any): any;
    getByApplicantId(req: Request, res: Response): Promise<void>;
    getByQuestionId(req: Request, res: Response): Promise<void>;
    getByInterviewId(req: Request, res: Response): Promise<void>;
    getByInterviewAndApplicant(req: Request, res: Response): Promise<void>;
    getWithDetails(req: Request, res: Response): Promise<void>;
}
export declare class AudioController {
    private whisperService;
    constructor(whisperService: WhisperService);
    transcribe(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map