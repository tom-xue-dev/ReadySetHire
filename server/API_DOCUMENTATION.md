# ReadySetHire API Documentation

## Overview

The ReadySetHire API provides comprehensive CRUD operations for managing jobs, interviews, questions, applicants, and applicant answers. The API follows RESTful principles and includes JWT-based authentication.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "RECRUITER"
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "RECRUITER"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}
```

## User Roles

- **ADMIN**: Full access to all resources
- **RECRUITER**: Can manage jobs, interviews, questions, and applicants
- **INTERVIEWER**: Can manage interviews and questions

## API Endpoints

### Jobs

#### Get All Jobs
```http
GET /api/jobs?page=1&limit=10&status=PUBLISHED&location_contains=Remote
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (DRAFT, PUBLISHED, CLOSED)
- `location_contains`: Filter by location
- `salaryRange_gte`: Minimum salary range
- `salaryRange_lte`: Maximum salary range

#### Get Job by ID
```http
GET /api/jobs/:id
```

#### Create Job
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Software Engineer",
  "description": "Job description",
  "requirements": "Required skills",
  "location": "Remote",
  "salaryRange": "$80,000 - $120,000",
  "status": "DRAFT"
}
```

#### Update Job
```http
PATCH /api/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "PUBLISHED"
}
```

#### Publish Job
```http
PATCH /api/jobs/:id/publish
Authorization: Bearer <token>
```

#### Delete Job
```http
DELETE /api/jobs/:id
Authorization: Bearer <token>
```

#### Get Jobs by User
```http
GET /api/jobs/user/:userId
Authorization: Bearer <token>
```

#### Get Published Jobs
```http
GET /api/jobs/published
```

### Interviews

#### Get All Interviews
```http
GET /api/interviews?page=1&limit=10&status=PUBLISHED&jobId=1
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (DRAFT, PUBLISHED, ARCHIVED)
- `jobId`: Filter by job ID
- `userId`: Filter by user ID

#### Get Interview by ID
```http
GET /api/interviews/:id
```

#### Get Complete Interview (with questions and applicants)
```http
GET /api/interviews/:id/complete
Authorization: Bearer <token>
```

#### Create Interview
```http
POST /api/interviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Technical Interview",
  "jobRole": "Software Engineer",
  "description": "Interview description",
  "status": "DRAFT",
  "jobId": 1
}
```

#### Update Interview
```http
PATCH /api/interviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "PUBLISHED"
}
```

#### Publish Interview
```http
PATCH /api/interviews/:id/publish
Authorization: Bearer <token>
```

#### Delete Interview
```http
DELETE /api/interviews/:id
Authorization: Bearer <token>
```

#### Get Interviews by User
```http
GET /api/interviews/user/:userId
Authorization: Bearer <token>
```

#### Get Interviews by Job
```http
GET /api/interviews/job/:jobId
```

### Questions

#### Get All Questions
```http
GET /api/questions?page=1&limit=10&interviewId=1&difficulty=EASY
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `interviewId`: Filter by interview ID
- `difficulty`: Filter by difficulty (EASY, INTERMEDIATE, ADVANCED)

#### Get Question by ID
```http
GET /api/questions/:id
```

#### Create Question
```http
POST /api/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is your experience with React?",
  "difficulty": "INTERMEDIATE",
  "interviewId": 1
}
```

#### Update Question
```http
PATCH /api/questions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Updated question",
  "difficulty": "ADVANCED"
}
```

#### Delete Question
```http
DELETE /api/questions/:id
Authorization: Bearer <token>
```

#### Get Questions by Interview
```http
GET /api/questions/interview/:interviewId
```

#### Get Questions by Difficulty
```http
GET /api/questions/difficulty/:difficulty
```

### Applicants

#### Get All Applicants
```http
GET /api/applicants?page=1&limit=10&interviewId=1&status=NOT_STARTED
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `interviewId`: Filter by interview ID
- `status`: Filter by status (NOT_STARTED, IN_PROGRESS, COMPLETED)

#### Get Applicant by ID
```http
GET /api/applicants/:id
Authorization: Bearer <token>
```

#### Get Applicant with Answers
```http
GET /api/applicants/:id/answers
Authorization: Bearer <token>
```

#### Create Applicant
```http
POST /api/applicants
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "MR",
  "firstname": "John",
  "surname": "Doe",
  "phoneNumber": "+1234567890",
  "emailAddress": "john.doe@example.com",
  "interviewStatus": "NOT_STARTED",
  "interviewId": 1
}
```

#### Update Applicant
```http
PATCH /api/applicants/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstname": "Updated Name",
  "interviewStatus": "IN_PROGRESS"
}
```

#### Update Applicant Status
```http
PATCH /api/applicants/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

#### Delete Applicant
```http
DELETE /api/applicants/:id
Authorization: Bearer <token>
```

#### Get Applicants by Interview
```http
GET /api/applicants/interview/:interviewId
Authorization: Bearer <token>
```

#### Get Applicants by Status
```http
GET /api/applicants/status/:status
Authorization: Bearer <token>
```

### Applicant Answers

#### Get All Answers
```http
GET /api/applicant_answers?page=1&limit=10&applicantId=1&questionId=1
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `applicantId`: Filter by applicant ID
- `questionId`: Filter by question ID
- `interviewId`: Filter by interview ID

#### Get Answer by ID
```http
GET /api/applicant_answers/:id
Authorization: Bearer <token>
```

#### Get Answer with Details
```http
GET /api/applicant_answers/:id/details
Authorization: Bearer <token>
```

#### Create Answer
```http
POST /api/applicant_answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "answer": "I have 3 years of experience with React",
  "interviewId": 1,
  "questionId": 1,
  "applicantId": 1
}
```

#### Update Answer
```http
PATCH /api/applicant_answers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "answer": "Updated answer"
}
```

#### Delete Answer
```http
DELETE /api/applicant_answers/:id
Authorization: Bearer <token>
```

#### Get Answers by Applicant
```http
GET /api/applicant_answers/applicant/:applicantId
Authorization: Bearer <token>
```

#### Get Answers by Question
```http
GET /api/applicant_answers/question/:questionId
Authorization: Bearer <token>
```

#### Get Answers by Interview
```http
GET /api/applicant_answers/interview/:interviewId
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Query Operators

The API supports advanced query operators for filtering:

- `_gte`: Greater than or equal
- `_lte`: Less than or equal
- `_gt`: Greater than
- `_lt`: Less than
- `_in`: In array (comma-separated values)
- `_contains`: Contains substring
- `_startsWith`: Starts with
- `_endsWith`: Ends with

**Examples:**
```
GET /api/jobs?salaryRange_gte=50000&salaryRange_lte=100000
GET /api/questions?difficulty_in=EASY,INTERMEDIATE
GET /api/applicants?firstname_contains=John
```

## Legacy API Compatibility

The API maintains backward compatibility with the existing frontend by providing legacy endpoints:

- `/api/interview` (singular) - maps to interviews
- `/api/question` (singular) - maps to questions
- `/api/applicant` (singular) - maps to applicants
- `/api/applicant_answer` (singular) - maps to applicant_answers

## Rate Limiting

API requests are rate-limited to prevent abuse. Current limits:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

## CORS

The API supports CORS for cross-origin requests from the frontend application.

## Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-18T03:30:00.000Z"
}
```

## Error Handling

The API provides detailed error messages and proper HTTP status codes. Common error scenarios:

1. **Authentication Errors**: Invalid or expired tokens
2. **Authorization Errors**: Insufficient permissions for the requested operation
3. **Validation Errors**: Invalid input data format or missing required fields
4. **Resource Errors**: Resource not found or already exists
5. **Server Errors**: Internal server errors with generic messages

## Examples

### Complete Workflow Example

1. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "recruiter1", "password": "password"}'
```

2. **Create Job**
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Senior Developer", "description": "Senior developer position"}'
```

3. **Create Interview**
```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Technical Interview", "jobRole": "Senior Developer", "jobId": 1}'
```

4. **Add Questions**
```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"question": "Explain your experience with Node.js", "interviewId": 1, "difficulty": "INTERMEDIATE"}'
```

5. **Add Applicant**
```bash
curl -X POST http://localhost:3000/api/applicants \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstname": "Jane", "surname": "Smith", "emailAddress": "jane@example.com", "interviewId": 1}'
```

6. **Submit Answer**
```bash
curl -X POST http://localhost:3000/api/applicant_answers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"answer": "I have 5 years of Node.js experience", "interviewId": 1, "questionId": 1, "applicantId": 1}'
```
