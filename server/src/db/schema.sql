-- Database schema for ReadySetHire
-- Run this script to create all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'recruiter' CHECK (role IN ('admin', 'recruiter', 'interviewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interviews table (updated to reference jobs)
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'intermediate', 'advanced')),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applicants table
CREATE TABLE IF NOT EXISTS applicants (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    title VARCHAR(20) NOT NULL CHECK (title IN ('Mr', 'Ms', 'Dr')),
    firstname VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    email_address VARCHAR(255) NOT NULL,
    interview_status VARCHAR(50) DEFAULT 'not_started' CHECK (interview_status IN ('not_started', 'completed')),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applicant answers table
CREATE TABLE IF NOT EXISTS applicant_answers (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    answer TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_questions_interview_id ON questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_applicants_interview_id ON applicants(interview_id);
CREATE INDEX IF NOT EXISTS idx_applicant_answers_applicant_id ON applicant_answers(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applicant_answers_question_id ON applicant_answers(question_id);

-- Insert sample data
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@readysethire.com', '$2b$10$example_hash', 'Admin', 'User', 'admin'),
('recruiter1', 'recruiter1@company.com', '$2b$10$example_hash', 'John', 'Doe', 'recruiter')
ON CONFLICT (username) DO NOTHING;

INSERT INTO jobs (title, description, requirements, location, status, user_id, published_at) VALUES
('Frontend Developer', 'We are looking for a skilled frontend developer...', 'React, TypeScript, CSS', 'Remote', 'published', 1, CURRENT_TIMESTAMP),
('Backend Developer', 'Join our backend team...', 'Node.js, PostgreSQL, Express', 'Sydney', 'published', 1, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO interviews (title, job_role, description, status, user_id, job_id) VALUES
('Frontend Developer Interview', 'Senior Frontend Developer', 'Interview for candidates with React experience', 'published', 1, 1),
('Backend Developer Interview', 'Mid-level Backend Developer', 'Technical interview for backend positions', 'published', 1, 2)
ON CONFLICT DO NOTHING;
