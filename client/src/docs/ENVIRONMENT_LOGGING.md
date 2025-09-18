# Environment Logging Documentation

## Overview

The frontend application now includes comprehensive environment logging that displays configuration information in the browser console when the application starts.

## Console Output Example

When you start the application, you'll see output like this in the browser console:

```
🚀 ReadySetHire Frontend Starting...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: DEVELOPMENT
🌐 API Base URL: http://localhost:3000/api
⏱️  Request Timeout: 10000ms
🔄 Max Retries: 3
👤 Username: s4831227
🔑 JWT Token: eyJhbGciOiJIUzI1NiIsIn...
🕒 Timestamp: 9/18/2025, 11:05:55 AM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Development mode - Debug features enabled

🔍 Checking server connection...
✅ Server connection successful
```

## Environment-Specific Messages

### Development Mode
- Shows "🔧 Development mode - Debug features enabled"
- More verbose logging for debugging

### Staging Mode  
- Shows "🧪 Staging mode - Testing environment"
- Balanced logging for testing

### Production Mode
- Shows "🏭 Production mode - Optimized build"
- Warns if authentication is not configured
- Minimal logging for performance

## Connection Status Logging

The application also logs connection status changes:

- `🔍 Checking server connection...` - When checking connectivity
- `🔍 Retrying server connection...` - When retrying after failure
- `✅ Server connection successful` - When connection succeeds
- `❌ Server connection failed: [error message]` - When connection fails

## Configuration Validation

The logging system also validates configuration and shows warnings:

- `⚠️ Warning: Missing authentication configuration in production`
- `❌ Error: Invalid API base URL format`
- `⚠️ Warning: Request timeout seems too short`

## How to View Logs

### In Development
1. Start the dev server: `npm run dev`
2. Open browser and navigate to the application
3. Open Developer Tools (F12)
4. Check the Console tab

### In Production/Staging
1. Build the application: `npm run build:staging` or `npm run build:production`
2. Serve the built files: `npm run preview`
3. Open browser and check console

## Security Considerations

- JWT tokens are truncated in logs (only first 20 characters shown)
- Sensitive configuration is masked in production builds
- Full error details are only shown in development mode

## Environment Variables Used

The logging displays information from these environment variables:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_JWT_TOKEN` - Authentication token (truncated in logs)
- `VITE_USERNAME` - Username for API requests
- `VITE_DEBUG` - Debug mode flag

## Customizing Logs

To modify the logging behavior, edit `src/config/api.ts`:

```typescript
export function logEnvironmentInfo() {
  // Customize logging logic here
}
```

## Troubleshooting

### No Logs Appearing
- Check if console is open in browser dev tools
- Verify the application is actually starting
- Check for JavaScript errors that might prevent execution

### Missing Configuration
- Ensure environment files (.env.development, etc.) are created
- Verify environment variables start with `VITE_` prefix
- Check that environment variables are properly formatted

### Connection Logs Not Showing
- Verify pages are wrapped with `SimpleConnectionGuard`
- Check if connection checking is enabled
- Look for network-related errors in console

## Benefits

1. **Quick Environment Verification** - Instantly see which environment you're running
2. **Configuration Debugging** - Easily spot misconfigured API URLs or missing tokens
3. **Connection Monitoring** - Track server connectivity issues
4. **Development Efficiency** - Faster debugging and setup verification
5. **Production Safety** - Warnings for missing production configuration
