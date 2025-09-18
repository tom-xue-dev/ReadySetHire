# Connection Management System Usage

This document explains how to use the connection management system that automatically handles database/backend connectivity with beautiful UI feedback.

## Overview

The system provides automatic connection checking when navigating to pages that require database access, with elegant loading states and error handling in English.

## Components

### SimpleConnectionGuard
Wraps pages that need database connection and automatically handles connection states.

```tsx
import { SimpleConnectionGuard } from '../components/SimpleConnectionStatus';

function MyPage() {
  return (
    <SimpleConnectionGuard>
      <div>
        {/* Your page content that needs database */}
      </div>
    </SimpleConnectionGuard>
  );
}
```

### SimpleConnectionIndicator
Shows a small status indicator (green dot = connected, red = failed, yellow = connecting).

```tsx
import { SimpleConnectionIndicator } from '../components/SimpleConnectionStatus';

function MyPageHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <h2>My Page</h2>
      <SimpleConnectionIndicator />
    </div>
  );
}
```

### SimpleLoadingState
Shows a loading spinner with message during connection attempts.

```tsx
import { SimpleLoadingState } from '../components/SimpleConnectionStatus';

// Used automatically by SimpleConnectionGuard, or manually:
<SimpleLoadingState message="Loading data..." />
```

### SimpleConnectionError
Shows error message with retry options when connection fails.

```tsx
import { SimpleConnectionError } from '../components/SimpleConnectionStatus';

// Used automatically by SimpleConnectionGuard, or manually:
<SimpleConnectionError 
  error="Connection failed" 
  onRetry={() => {/* retry logic */}}
  canRetry={true}
/>
```

## How It Works

1. **Automatic Detection**: When you navigate to a page wrapped with `SimpleConnectionGuard`, it automatically checks server connectivity.

2. **Health Check**: Uses the `/interview?limit=1` endpoint to verify the server is responding.

3. **Loading State**: Shows a clean loading spinner while checking connection.

4. **Error Handling**: If connection fails, shows a user-friendly error with retry options.

5. **Success**: Once connected, displays your page content normally.

6. **Status Indicator**: Shows real-time connection status in the page header.

## Current Implementation

The following pages now have connection management:

- **Interviews** (`/interviews`) - Main interviews list
- **Questions** (`/interviews/:id/questions`) - Interview questions
- **Applicants** (`/interviews/:id/applicants`) - Interview applicants

## Features

### ✅ Clean, Modern UI
- No external CSS dependencies
- Consistent styling with inline styles
- Responsive design
- Professional appearance

### ✅ English Language
- All messages and UI text in English
- Clear, professional wording
- Consistent terminology

### ✅ Automatic Retry
- Configurable retry attempts (default: 3)
- Exponential backoff (5 second intervals)
- Manual retry button
- Page reload option

### ✅ Real-time Status
- Live connection status indicator
- Color-coded status (green/red/yellow)
- Automatic reconnection on network recovery
- Focus-based connection checking

### ✅ Error Recovery
- Graceful error handling
- Detailed error messages
- Multiple recovery options
- No app crashes

## Configuration

The connection system can be configured in `useConnection` hook:

```tsx
const connection = useConnection({
  autoCheck: true,        // Auto-check connection
  checkOnMount: true,     // Check when component mounts
  checkOnFocus: true,     // Check when window gains focus
  maxRetries: 3,          // Maximum retry attempts
  retryInterval: 5000,    // Retry interval in milliseconds
});
```

## API Health Check

The system uses a custom health check function in `api/helper.js`:

```javascript
export async function healthCheck() {
  // Attempts to fetch interview data with timeout
  // Returns success/failure status
}
```

## Best Practices

1. **Use SimpleConnectionGuard** for any page that makes API calls
2. **Add SimpleConnectionIndicator** to page headers for status visibility  
3. **Handle loading states** gracefully in your components
4. **Test connection failure scenarios** during development
5. **Configure appropriate timeouts** for your network conditions

## Troubleshooting

### Connection Always Fails
- Check if backend server is running
- Verify API base URL in configuration
- Check JWT token validity
- Confirm network connectivity

### Slow Connection Checks
- Reduce timeout values in health check
- Check server response times
- Consider network latency

### UI Issues
- Ensure proper component wrapping
- Check for CSS conflicts
- Verify React version compatibility

## Future Enhancements

- [ ] Connection quality metrics
- [ ] Offline mode support
- [ ] Background sync capabilities
- [ ] Performance monitoring
- [ ] Custom health check endpoints
