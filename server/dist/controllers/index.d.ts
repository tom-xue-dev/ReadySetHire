import { Request, Response } from 'express';
import { CRUDController } from './base';
import { JobService, InterviewService, QuestionService, ApplicantService, ApplicantAnswerService } from '../services/database';
export declare class JobController extends CRUDController<any> {
    private jobService;
    constructor(jobService: JobService);
    protected validateAndTransformData(data: any): any;
    getByUserId(req: Request, res: Response): Promise<void>;
    getPublished(req: Request, res: Response): Promise<void>;
    publish(req: Request, res: Response): Promise<void>;
}
export declare class InterviewController extends CRUDController<any> {
    private interviewService;
    constructor(interviewService: InterviewService);
    protected validateAndTransformData(data: any): any;
    getByUserId(req: Request, res: Response): Promise<void>;
    getByJobId(req: Request, res: Response): Promise<void>;
    getComplete(req: Request, res: Response): Promise<void>;
    publish(req: Request, res: Response): Promise<void>;
}
export declare class QuestionController extends CRUDController<any> {
    private questionService;
    constructor(questionService: QuestionService);
    protected validateAndTransformData(data: any): any;
    getByInterviewId(req: Request, res: Response): Promise<void>;
    getByDifficulty(req: Request, res: Response): Promise<void>;
}
export declare class ApplicantController extends CRUDController<any> {
    private applicantService;
    constructor(applicantService: ApplicantService);
    protected validateAndTransformData(data: any): any;
    getByInterviewId(req: Request, res: Response): Promise<void>;
    getByStatus(req: Request, res: Response): Promise<void>;
    getWithAnswers(req: Request, res: Response): Promise<void>;
    updateStatus(req: Request, res: Response): Promise<void>;
}
export declare class ApplicantAnswerController extends CRUDController<any> {
    private applicantAnswerService;
    constructor(applicantAnswerService: ApplicantAnswerService);
    protected validateAndTransformData(data: any): any;
    getByApplicantId(req: Request, res: Response): Promise<void>;
    getByQuestionId(req: Request, res: Response): Promise<void>;
    getByInterviewId(req: Request, res: Response): Promise<void>;
    getWithDetails(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map