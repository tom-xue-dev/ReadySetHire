/**
 * Connection Status Components
 * 
 * Beautiful UI components for displaying connection status,
 * loading states, and error handling.
 */

import React from 'react';
import { useConnection } from '../hooks/useConnection';

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg className="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Connection Error Component
interface ConnectionErrorProps {
  error: string;
  onRetry?: () => void;
  canRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  error,
  onRetry,
  canRetry = true,
  retryCount = 0,
  maxRetries = 3,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800">
            Connection Failed
          </h3>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-red-700 mb-2">
          Unable to connect to the server. Please check your network connection or try again later.
        </p>
        <p className="text-sm text-red-600">
          Error details: {error}
        </p>
        {retryCount > 0 && (
          <p className="text-sm text-red-600 mt-1">
            Retry attempts: {retryCount}/{maxRetries}
          </p>
        )}
      </div>

      {canRetry && onRetry && (
        <div className="flex space-x-3">
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Retry Connection
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Reload Page
          </button>
        </div>
      )}
    </div>
  );
};

// Loading State Component
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Connecting to server...",
  className = ''
}) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-8 text-center ${className}`}>
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <h3 className="mt-4 text-lg font-medium text-blue-800">
          {message}
        </h3>
        <p className="mt-2 text-blue-600">
          Please wait, establishing connection...
        </p>
      </div>
    </div>
  );
};

// Connection Status Indicator (small badge)
interface ConnectionIndicatorProps {
  className?: string;
  showText?: boolean;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  className = '',
  showText = true
}) => {
  const { isConnected, hasError, isConnecting } = useConnection();

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500';
    if (hasError) return 'bg-red-500';
    if (isConnecting) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (hasError) return 'Connection Failed';
    if (isConnecting) return 'Connecting';
    return 'Disconnected';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}>
        {isConnecting && (
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
        )}
      </div>
      {showText && (
        <span className="text-sm text-gray-600">
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

// Full Page Connection Guard
interface ConnectionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showRetry?: boolean;
}

export const ConnectionGuard: React.FC<ConnectionGuardProps> = ({
  children,
  fallback,
  showRetry = true
}) => {
  const connection = useConnection({
    autoCheck: true,
    checkOnMount: true,
    checkOnFocus: true,
    maxRetries: 3,
    retryInterval: 5000,
  });

  if (connection.isConnecting) {
    return fallback || <LoadingState message="正在检查服务器连接..." />;
  }

  if (connection.hasError) {
    return fallback || (
      <ConnectionError
        error={connection.error || '未知错误'}
        onRetry={showRetry ? connection.retry : undefined}
        canRetry={connection.canRetry}
        retryCount={connection.retryCount}
        maxRetries={3}
      />
    );
  }

  if (connection.isConnected) {
    return <>{children}</>;
  }

  // Idle state - show children but maybe with a warning
  return (
    <div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-yellow-800 text-sm">
          ⚠️ 服务器连接状态未知，某些功能可能不可用
        </p>
      </div>
      {children}
    </div>
  );
};
