"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicantAnswerService = exports.applicantService = exports.questionService = exports.interviewService = exports.jobService = exports.userService = exports.ApplicantAnswerService = exports.ApplicantService = exports.QuestionService = exports.InterviewService = exports.JobService = exports.UserService = exports.BaseService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Singleton Prisma client instance
let prisma;
if (process.env.NODE_ENV === 'production') {
    prisma = new client_1.PrismaClient();
}
else {
    if (!global.__prisma) {
        // Use test database URL if in test environment
        const databaseUrl = process.env.NODE_ENV === 'test'
            ? process.env.TEST_DATABASE_URL
            : process.env.DATABASE_URL;
        global.__prisma = new client_1.PrismaClient({
            datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
            log: ['query', 'info', 'warn', 'error'],
        });
    }
    prisma = global.__prisma;
}
exports.default = prisma;
// Base service class with common CRUD operations
class BaseService {
    prisma;
    model;
    constructor(prisma, model) {
        this.prisma = prisma;
        this.model = model;
    }
    async create(data) {
        return this.prisma[this.model].create({ data });
    }
    async findMany(where, include) {
        return this.prisma[this.model].findMany({ where, include });
    }
    async findUnique(where, options) {
        return this.prisma[this.model].findUnique({ where, ...options });
    }
    async findFirst(where, include) {
        return this.prisma[this.model].findFirst({ where, include });
    }
    async update(id, data) {
        return this.prisma[this.model].update({ where: { id }, data });
    }
    async delete(where) {
        return this.prisma[this.model].delete({ where });
    }
    async count(where) {
        return this.prisma[this.model].count({ where });
    }
}
exports.BaseService = BaseService;
// User service with authentication methods
class UserService extends BaseService {
    constructor(prisma) {
        super(prisma, 'user');
    }
    async findByUsername(username) {
        return this.findUnique({ username });
    }
    async findByEmail(email) {
        return this.findUnique({ email });
    }
    async findWithJobs(userId) {
        return this.findUnique({ id: userId }, { include: { jobs: true } });
    }
    // Authentication methods
    async createUser(userData) {
        const { password, ...data } = userData;
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        return this.create({
            ...data,
            passwordHash,
        });
    }
    async validatePassword(user, password) {
        return bcryptjs_1.default.compare(password, user.passwordHash);
    }
    async authenticateUser(usernameOrEmail, password) {
        // Try to find user by username or email
        const user = await this.findByUsername(usernameOrEmail) ||
            await this.findByEmail(usernameOrEmail);
        if (!user) {
            return null;
        }
        const isValidPassword = await this.validatePassword(user, password);
        if (!isValidPassword) {
            return null;
        }
        // Return user without password hash
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async updatePassword(userId, newPassword) {
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        return this.update(userId, { passwordHash });
    }
}
exports.UserService = UserService;
// Job service with additional methods
class JobService extends BaseService {
    constructor(prisma) {
        super(prisma, 'job');
    }
    async findByUserId(userId) {
        return this.findMany({ userId });
    }
    async findPublished() {
        return this.findMany({ status: 'PUBLISHED' });
    }
    async findWithInterviews(jobId) {
        return this.findUnique({ id: jobId }, { include: { interviews: true } });
    }
}
exports.JobService = JobService;
// Interview service with additional methods
class InterviewService extends BaseService {
    constructor(prisma) {
        super(prisma, 'interview');
    }
    async findByUserId(userId) {
        return this.findMany({ userId });
    }
    async findByJobId(jobId) {
        return this.findMany({ jobId });
    }
    async findWithQuestions(interviewId) {
        return this.findUnique({ id: interviewId }, { include: { questions: true } });
    }
    async findWithApplicants(interviewId) {
        return this.findUnique({ id: interviewId }, { include: { applicants: true } });
    }
    async findComplete(interviewId) {
        return this.findUnique({ id: interviewId }, {
            include: {
                questions: true,
                applicants: {
                    include: {
                        applicantAnswers: {
                            include: {
                                question: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
exports.InterviewService = InterviewService;
// Question service with additional methods
class QuestionService extends BaseService {
    constructor(prisma) {
        super(prisma, 'question');
    }
    async findByInterviewId(interviewId) {
        return this.findMany({ interviewId });
    }
    async findByDifficulty(difficulty) {
        return this.findMany({ difficulty });
    }
}
exports.QuestionService = QuestionService;
// Applicant service with additional methods
class ApplicantService extends BaseService {
    constructor(prisma) {
        super(prisma, 'applicant');
    }
    async findByInterviewId(interviewId) {
        return this.prisma[this.model].findMany({
            include: {
                applicantInterviews: {
                    where: { interviewId },
                    include: {
                        interview: {
                            include: {
                                job: true
                            }
                        }
                    }
                }
            }
        });
    }
    async findByStatus(status) {
        return this.prisma[this.model].findMany({
            include: {
                applicantInterviews: {
                    where: { interviewStatus: status },
                    include: {
                        interview: {
                            include: {
                                job: true
                            }
                        }
                    }
                }
            }
        });
    }
    async findWithAnswers(applicantId) {
        return this.findUnique({ id: applicantId }, {
            include: {
                applicantAnswers: {
                    include: {
                        question: true,
                    },
                },
                applicantInterviews: {
                    include: {
                        interview: {
                            include: {
                                job: true
                            }
                        }
                    }
                }
            },
        });
    }
    async getAllWithInterviews() {
        return this.prisma[this.model].findMany({
            include: {
                applicantInterviews: {
                    include: {
                        interview: {
                            include: {
                                job: true
                            }
                        }
                    }
                }
            }
        });
    }
    async bindToInterview(applicantId, interviewId, status = 'NOT_STARTED') {
        return this.prisma.applicantInterview.create({
            data: {
                applicantId,
                interviewId,
                interviewStatus: status
            }
        });
    }
    async unbindFromInterview(applicantId, interviewId) {
        return this.prisma.applicantInterview.deleteMany({
            where: {
                applicantId,
                interviewId
            }
        });
    }
}
exports.ApplicantService = ApplicantService;
// ApplicantAnswer service with additional methods
class ApplicantAnswerService extends BaseService {
    constructor(prisma) {
        super(prisma, 'applicantAnswer');
    }
    async findByApplicantId(applicantId) {
        return this.findMany({ applicantId });
    }
    async findByQuestionId(questionId) {
        return this.findMany({ questionId });
    }
    async findByInterviewId(interviewId) {
        return this.findMany({ interviewId });
    }
    async findWithDetails(answerId) {
        return this.findUnique({ id: answerId }, {
            include: {
                question: true,
                applicant: true,
                interview: true,
            },
        });
    }
}
exports.ApplicantAnswerService = ApplicantAnswerService;
// Initialize all services
exports.userService = new UserService(prisma);
exports.jobService = new JobService(prisma);
exports.interviewService = new InterviewService(prisma);
exports.questionService = new QuestionService(prisma);
exports.applicantService = new ApplicantService(prisma);
exports.applicantAnswerService = new ApplicantAnswerService(prisma);
//# sourceMappingURL=database.js.map