# Environment Configuration for ReadySetHire Backend

## Required Environment Variables

### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/readysethire_db"
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/readysethire_test_db"
```

### JWT Configuration
```bash
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
```

### Server Configuration
```bash
NODE_ENV="development"
PORT=3000
```

### Optional Configuration
```bash
# CORS settings
CORS_ORIGIN="http://localhost:5173"

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
```

## Development Environment Setup

1. **Create `.env` file in server directory:**
```bash
# Copy from development template
cp config/development.env .env
```

2. **Update database connection:**
```bash
# Update DATABASE_URL with your PostgreSQL credentials
DATABASE_URL="postgresql://readysethire_user:password@localhost:5432/readysethire_db"
```

3. **Generate JWT secret:**
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Production Environment Setup

1. **Create `.env.production` file:**
```bash
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:secure_password@prod_host:5432/readysethire_prod"
JWT_SECRET="super-secure-production-secret"
JWT_EXPIRES_IN="1h"
PORT=3000
CORS_ORIGIN="https://yourdomain.com"
```

2. **Security considerations:**
   - Use strong, unique JWT secrets
   - Enable HTTPS in production
   - Use environment-specific database credentials
   - Implement proper CORS policies
   - Set up rate limiting
   - Use secure session management

## Testing Environment

```bash
NODE_ENV=test
DATABASE_URL="postgresql://test_user:password@localhost:5432/readysethire_test"
JWT_SECRET="test-secret-key"
JWT_EXPIRES_IN="1h"
```

## Docker Environment

```bash
# For Docker Compose
DATABASE_URL="postgresql://readysethire_user:password@postgres:5432/readysethire_db"
JWT_SECRET="docker-secret-key"
NODE_ENV="production"
```

## Environment Validation

The application validates required environment variables on startup:

- `DATABASE_URL`: Required for database connection
- `JWT_SECRET`: Required for token generation
- `NODE_ENV`: Determines application behavior

Missing required variables will cause the application to exit with an error message.

## Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use different secrets for different environments**
3. **Rotate JWT secrets regularly**
4. **Use strong passwords for database connections**
5. **Enable SSL/TLS for database connections in production**
6. **Implement proper input validation**
7. **Use HTTPS in production**
8. **Set up proper CORS policies**
9. **Implement rate limiting**
10. **Log security events**

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check credentials and permissions

2. **JWT Token Invalid**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure consistent secret across services

3. **CORS Errors**
   - Check CORS_ORIGIN setting
   - Verify frontend URL matches CORS policy

4. **Port Already in Use**
   - Change PORT environment variable
   - Kill existing process on port 3000

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL="debug"
NODE_ENV="development"
```

This will provide detailed logs for troubleshooting.
