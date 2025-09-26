# ReadysetHire - A AI integrated hiring System


# Instructions:

## Start Backend Service:

### 🚀 One-Command Solution (Recommended)
```bash
cd server
docker compose up -d
```

That's it! This single command will:
- ✅ Start PostgreSQL database
- ✅ Wait for database to be ready
- ✅ Run all database migrations automatically
- ✅ Generate Prisma client
- ✅ Seed database (if seed file exists)
- ✅ Start the backend server

### Monitor the startup process:
```bash
# View logs to see the setup progress
docker compose logs -f backend

# Check service status
docker compose ps
```

### Manual Development (Alternative)
```bash
cd server
npm install
docker compose up postgres -d
npx prisma migrate deploy
npm run dev
```

```
note that the project code can be a little bit heavy compared to other assignments, here's might be some key files that you might want to see to mark the assignment.

for front end:
1. all files in client folder, which demonstrate the front end design for the assignment

for backend:
1. /server/prisma indicates the structure of the database
2. /src/routes/v2.ts indicates the backend  RESTful API endpoints.
3. /src/services/llm.ts shows how LLM is integrated in generating questions for user.
4. /src/services/whisper.ts shows how to convert the speech to text
```

## Start Frontend Service:

```bash
cd client
npm install
npm run dev
```

The frontend will be available at: http://localhost:5173

## Troubleshooting:

### Database Migration Issues:
If you encounter "table does not exist" errors:

```bash
cd server
# Stop all containers
docker compose down -v

# Rebuild and restart (this will run migrations automatically)
docker compose up -d --build

# Check logs
docker compose logs -f backend
```

### Manual Migration (if needed):
```bash
cd server
# Connect to running backend container
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

Please note that the project is not fully completed yet(for a fullstack project), There are still a lot of pages/functions which might seem to be redundant but might be used in the future, So please just ignore all of the files.