<div align="center">

# ReadySetHire

AI-powered interview platform that streamlines hiring with voice transcription (Whisper ASR), LLM-generated interview questions, and full CRUD for jobs, interviews, questions, applicants, and answers.

</div>

## Overview

ReadySetHire is a full‑stack web application for recruiters to create jobs and interviews, generate interview questions via LLM, invite applicants, capture spoken answers in the browser, and review transcribed results. The system includes:

- Backend API (Node.js + Express + TypeScript) with Prisma ORM (PostgreSQL)
- JWT authentication and role-based access (ADMIN/RECRUITER/INTERVIEWER)
- Whisper ASR service (HuggingFace Transformers) for speech‑to‑text
- Frontend (React + TypeScript + Vite + Tailwind) with protected routes and interview flow
- Docker Compose for one‑command backend startup

## Key Features

- Jobs and Interviews management (CRUD, publishing)
- Questions management and LLM‑based generation per interview/job description
- Applicants management and interview binding/unbinding
- Applicant answers capture and review
- Browser audio recording (WAV/WebM→WAV) and binary streaming to ASR endpoint
- Health checks, API logging, and robust error handling

## Project Structure

```
.
├── client/                  # React + TS frontend
│   ├── src/
│   │   ├── api/             # API helper & ASR client
│   │   ├── components/      # UI components (incl. AudioCapture)
│   │   ├── contexts/        # Auth & i18n contexts
│   │   ├── pages/           # Jobs/Interviews/Applicants/Interview flow
│   │   └── config/          # API base URL, timeouts, env logging
│   └── ...
├── server/                  # Node + Express + Prisma backend
│   ├── src/
│   │   ├── controllers/     # CRUD controllers (typed, validated)
│   │   ├── routes/          # v2 REST routes (mounted at /api)
│   │   ├── services/        # Prisma service, LLM, Whisper
│   │   └── middleware/      # auth (JWT, RBAC)
│   ├── prisma/              # Prisma schema & migrations
│   └── docker-compose.yml   # DB + backend one‑command startup
└── README.md
```

## Backend Setup

### One‑Command (Recommended)
```bash
cd server
docker compose up -d
```
This will:
- Start PostgreSQL
- Run migrations and generate Prisma client
- Seed data (if seed present)
- Start the backend service

Check status/logs:
```bash
docker compose ps
docker compose logs -f backend
```

API base: `http://localhost:3000/api`

Health check:
```bash
curl http://localhost:3000/health
```

### Manual Dev
```bash
cd server
npm install
docker compose up postgres -d
npx prisma migrate deploy
npm run dev
```

Environment (`server/.env`):
```
DATABASE_URL=postgresql://readysethire_user:readysethire_password@localhost:5432/readysethire?schema=public
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
OPENAI_API_KEY=your-openai-api-key
```

### Notable Endpoints (mounted under /api)
- Auth: `POST /auth/login`, `POST /auth/register`, `GET/PATCH /auth/profile`
- Jobs: `GET/POST/PATCH/DELETE /jobs`, `GET /jobs/published`, `GET /jobs/user/:userId`, `PATCH /jobs/:id/publish`
- Interviews: `GET/POST/PATCH/DELETE /interviews`, `GET /interviews/:id`
- Questions: `GET /question/interview/:interviewId`, `POST /question`, `PATCH /question/:id`, `DELETE /question/:id`, `POST /question/generate/:interviewId`
- Applicants: `GET/POST/PATCH/DELETE /applicents`, `GET /interviews/:interviewId/applicants`, `POST /interviews/:interviewId/applicants`
- Answers: `GET /applicant_answers/...`, `POST /applicant_answers`, `PATCH /applicant_answers/:id`
- ASR: `HEAD /model/whisper` (health), `POST /model/whisper` (binary audio, JWT required)

## Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend: `http://localhost:5173`

Environment (`client/.env` or via Vite vars):
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_JWT_TOKEN=<optional-dev-token>
VITE_USERNAME=<optional-dev-username>
```



## Development Notes
- Prisma schema: `server/prisma/schema.prisma`
- Routes: `server/src/routes/v2.ts`
- LLM service: `server/src/services/llm.ts`
- Whisper service: `server/src/services/whisper.ts`
- API helper: `client/src/api/helper.js`
- Audio capture: `client/src/components/EnhancedAudioCapture.tsx`

## Troubleshooting
Database migration issues:
```bash
cd server
docker compose down -v
docker compose up -d --build
docker compose logs -f backend
```

Manual migration (container running):
```bash
cd server
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

## License

MIT License

Copyright (c) 2025 ReadySetHire

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
