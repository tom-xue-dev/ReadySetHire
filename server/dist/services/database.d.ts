import { PrismaClient } from '@prisma/client';
declare let prisma: PrismaClient;
declare global {
    var __prisma: PrismaClient | undefined;
}
export default prisma;
export declare abstract class BaseService<T> {
    protected prisma: PrismaClient;
    protected model: string;
    constructor(prisma: PrismaClient, model: string);
    create(data: any): Promise<T>;
    findMany(where?: any, include?: any): Promise<T[]>;
    findUnique(where: any, include?: any): Promise<T | null>;
    findFirst(where: any, include?: any): Promise<T | null>;
    update(where: any, data: any): Promise<T>;
    delete(where: any): Promise<T>;
    count(where?: any): Promise<number>;
}
export declare class UserService extends BaseService<any> {
    constructor(prisma: PrismaClient);
    findByUsername(username: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    findWithJobs(userId: number): Promise<any>;
}
export declare class JobService extends BaseService<any> {
    constructor(prisma: PrismaClient);
    findByUserId(userId: number): Promise<any[]>;
    findPublished(): Promise<any[]>;
    findWithInterviews(jobId: number): Promise<any>;
}
export declare class InterviewService extends BaseService<any> {
    constructor(prisma: PrismaClient);
    findByUserId(userId: number): Promise<any[]>;
    findByJobId(jobId: number): Promise<any[]>;
    findWithQuestions(interviewId: number): Promise<any>;
    findWithApplicants(interviewId: number): Promise<any>;
    findComplete(interviewId: number): Promise<any>;
}
export declare class QuestionService extends BaseService<any> {
    constructor(prisma: PrismaClient);
    findByInterviewId(interviewId: number): Promise<any[]>;
    findByDifficulty(difficulty: string): Promise<any[]>;
}
export declare class ApplicantService extends BaseService<any> {
    constructor(prisma: PrismaClient);
    findByInterviewId(interviewId: number): Promise<any[]>;
    findByStatus(status: string): Promise<any[]>;
    findWithAnswers(applicantId: number): Promise<any>;
}
export declare class ApplicantAnswerService extends BaseService<any> {
    constructor(prisma: PrismaClient);
    findByApplicantId(applicantId: number): Promise<any[]>;
    findByQuestionId(questionId: number): Promise<any[]>;
    findByInterviewId(interviewId: number): Promise<any[]>;
    findWithDetails(answerId: number): Promise<any>;
}
export declare const userService: UserService;
export declare const jobService: JobService;
export declare const interviewService: InterviewService;
export declare const questionService: QuestionService;
export declare const applicantService: ApplicantService;
export declare const applicantAnswerService: ApplicantAnswerService;
//# sourceMappingURL=database.d.ts.map