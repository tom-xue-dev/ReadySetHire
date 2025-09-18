# ReadySetHire Docker Setup

This directory contains Docker configurations for running the ReadySetHire backend with PostgreSQL database.

## Quick Start

### 1. Start all services
```bash
npm run docker:up
```

### 2. View logs
```bash
npm run docker:logs
```

### 3. Stop services
```bash
npm run docker:down
```

## Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: readysethire
- **Username**: readysethire_user
- **Password**: readysethire_password
- **Data Volume**: `postgres_data`

### Backend API Server
- **Port**: 3000
- **Health Check**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api
- **Config Volume**: `./config` (read-only)
- **Logs Volume**: `./logs`

### pgAdmin (Optional)
- **Port**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@readysethire.com
- **Password**: admin123

## Environment Configuration

### Development
- Uses `config/development.env`
- Debug logging enabled
- CORS allows localhost:5173

### Production
- Uses `config/production.env`
- Info logging only
- CORS restricted to production domain

## Database Initialization

The database is automatically initialized with:
1. **Schema**: Tables, indexes, constraints
2. **Sample Data**: Users, jobs, interviews, questions, applicants

## Docker Commands

```bash
# Build backend image
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart services
npm run docker:restart

# Clean up (removes volumes)
npm run docker:clean
```

## Manual Docker Commands

```bash
# Start specific service
docker-compose up -d postgres

# View specific service logs
docker-compose logs -f backend

# Execute commands in running container
docker-compose exec backend sh
docker-compose exec postgres psql -U readysethire_user -d readysethire

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Database Connection Issues
1. Check if PostgreSQL is healthy: `docker-compose ps`
2. View PostgreSQL logs: `docker-compose logs postgres`
3. Test connection: `docker-compose exec postgres pg_isready -U readysethire_user`

### Backend Issues
1. Check backend logs: `docker-compose logs backend`
2. Verify environment variables: `docker-compose exec backend env`
3. Test health endpoint: `curl http://localhost:3000/health`

### Port Conflicts
If ports 3000, 5432, or 5050 are already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

## Data Persistence

- **PostgreSQL Data**: Stored in `postgres_data` volume
- **pgAdmin Data**: Stored in `pgadmin_data` volume
- **Backend Logs**: Stored in `./logs` directory
- **Configuration**: Mounted from `./config` directory

## Security Notes

- Change default passwords in production
- Update JWT_SECRET in production
- Restrict CORS_ORIGIN to your domain
- Use Docker secrets for sensitive data in production
