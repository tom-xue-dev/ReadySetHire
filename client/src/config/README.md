# API Configuration

This directory contains the centralized configuration system for the ReadySetHire frontend application.

## Files

- `api.ts` - Main configuration file that manages API settings for different environments

## Environment Configuration

The application supports multiple environments with different API configurations:

### Development
- **API Base URL**: `http://localhost:3000/api`
- **Timeout**: 10 seconds
- **Debug**: Enabled

### Production
- **API Base URL**: `https://comp2140a2.uqcloud.net/api`
- **Timeout**: 15 seconds
- **Debug**: Disabled

### Staging
- **API Base URL**: `https://staging.comp2140a2.uqcloud.net/api`
- **Timeout**: 10 seconds
- **Debug**: Enabled

## Environment Variables

The configuration system uses the following environment variables (prefixed with `VITE_`):

- `VITE_API_BASE_URL` - Override the default API base URL
- `VITE_JWT_TOKEN` - JWT token for API authentication
- `VITE_USERNAME` - Username for API requests
- `VITE_NODE_ENV` - Environment identifier
- `VITE_DEBUG` - Enable/disable debug mode

## Setup Instructions

### 1. Create Environment Files

Create the appropriate environment files in the `client` directory:

```bash
# Development environment
# File: client/.env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_JWT_TOKEN=your_development_jwt_token
VITE_USERNAME=your_username
VITE_NODE_ENV=development
VITE_DEBUG=true

# Production environment
# File: client/.env.production
VITE_API_BASE_URL=https://comp2140a2.uqcloud.net/api
VITE_JWT_TOKEN=your_production_jwt_token
VITE_USERNAME=your_username
VITE_NODE_ENV=production
VITE_DEBUG=false

# Staging environment
# File: client/.env.staging
VITE_API_BASE_URL=https://staging.comp2140a2.uqcloud.net/api
VITE_JWT_TOKEN=your_staging_jwt_token
VITE_USERNAME=your_username
VITE_NODE_ENV=staging
VITE_DEBUG=true
```

### 2. Running in Different Environments

```bash
# Development (default)
npm run dev

# Production build
npm run build

# Staging build
npm run build --mode staging
```

## Usage in Code

### Basic Import
```javascript
import { API_BASE_URL, JWT_TOKEN, USERNAME } from '../config/api.ts';
```

### Advanced Usage
```javascript
import { apiConfig, getConfig, getEnvironment } from '../config/api.ts';

// Get current environment
const env = getEnvironment(); // 'development', 'production', or 'staging'

// Get full configuration object
const config = getConfig();
console.log('API Base URL:', config.baseUrl);
console.log('Timeout:', config.timeout);
```

## Features

### Automatic Environment Detection
The configuration system automatically detects the current environment and loads appropriate settings.

### Timeout Handling
API requests include configurable timeouts with automatic abort functionality.

### Error Handling
Enhanced error messages with status codes and response details.

### TypeScript Support
Full TypeScript support with proper type definitions.

### Proxy Support
Development server includes proxy configuration for seamless local development.

## Security Notes

1. **Never commit sensitive tokens** to version control
2. **Use environment variables** for all sensitive configuration
3. **Validate JWT tokens** before using in production
4. **Use HTTPS** in production environments
5. **Implement proper token refresh** mechanisms

## Migration from Legacy Code

The old hardcoded configuration:
```javascript
const API_BASE_URL = 'https://comp2140a2.uqcloud.net/api';
const JWT_TOKEN = 'hardcoded_token';
const USERNAME = 'hardcoded_username';
```

Has been replaced with:
```javascript
import { API_BASE_URL, JWT_TOKEN, USERNAME } from '../config/api.ts';
```

This provides:
- Environment-specific configurations
- Better error handling
- Timeout management
- TypeScript support
- Easier maintenance and deployment
