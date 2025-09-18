/**
 * Higher-Order Component for Connection Management
 * 
 * This HOC wraps pages that require database/backend connection
 * and provides automatic connection checking with beautiful UI feedback.
 */

import React, { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useConnection } from '../hooks/useConnection';
import { LoadingState, ConnectionError } from './ConnectionStatus';

interface WithConnectionOptions {
  // Whether to show loading state while checking connection
  showLoadingState?: boolean;
  // Custom loading message
  loadingMessage?: string;
  // Whether to enable auto-retry
  autoRetry?: boolean;
  // Maximum retry attempts
  maxRetries?: number;
  // Retry interval in milliseconds
  retryInterval?: number;
  // Custom error component
  errorComponent?: React.ComponentType<{
    error: string;
    onRetry: () => void;
    canRetry: boolean;
  }>;
  // Custom loading component
  loadingComponent?: React.ComponentType;
  // Whether to check connection on route change
  checkOnRouteChange?: boolean;
}

const defaultOptions: Required<WithConnectionOptions> = {
  showLoadingState: true,
  loadingMessage: 'Connecting to database...',
  autoRetry: true,
  maxRetries: 3,
  retryInterval: 5000,
  errorComponent: ConnectionError,
  loadingComponent: LoadingState,
  checkOnRouteChange: true,
};

export function withConnection<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithConnectionOptions = {}
) {
  const opts = { ...defaultOptions, ...options };

  const WithConnectionComponent = (props: P) => {
    const connection = useConnection({
      autoCheck: opts.autoRetry,
      checkOnMount: true,
      checkOnFocus: true,
      maxRetries: opts.maxRetries,
      retryInterval: opts.retryInterval,
    });

    const [hasCheckedInitially, setHasCheckedInitially] = useState(false);

    // Initial connection check
    useEffect(() => {
      if (!hasCheckedInitially && connection.status !== 'idle') {
        setHasCheckedInitially(true);
      }
    }, [connection.status, hasCheckedInitially]);

    // Route change detection (if enabled)
    useEffect(() => {
      if (opts.checkOnRouteChange && hasCheckedInitially) {
        // Re-check connection when component mounts (route change)
        connection.checkConnection();
      }
    }, [opts.checkOnRouteChange, hasCheckedInitially, connection]);

    // Show loading state while initially connecting
    if (!hasCheckedInitially || connection.isConnecting) {
      if (opts.showLoadingState) {
        const LoadingComponent = opts.loadingComponent;
        return <LoadingComponent />;
      }
      return null;
    }

    // Show error state if connection failed
    if (connection.hasError) {
      const ErrorComponent = opts.errorComponent;
      return (
        <ErrorComponent
          error={connection.error || 'Connection failed'}
          onRetry={connection.retry}
          canRetry={connection.canRetry}
        />
      );
    }

    // Show the wrapped component if connected
    if (connection.isConnected) {
      return <WrappedComponent {...props} />;
    }

    // Fallback for unknown states
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          Connection status unknown. Please refresh and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Reload Page
        </button>
      </div>
    );
  };

  WithConnectionComponent.displayName = `withConnection(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithConnectionComponent;
}

// Convenience wrapper for pages that need database connection
export const withDatabaseConnection = <P extends object>(
  Component: ComponentType<P>,
  options?: WithConnectionOptions
) => {
  return withConnection(Component, {
    loadingMessage: 'Connecting to database...',
    ...options,
  });
};

// Convenience wrapper for API-dependent pages
export const withAPIConnection = <P extends object>(
  Component: ComponentType<P>,
  options?: WithConnectionOptions
) => {
  return withConnection(Component, {
    loadingMessage: 'Connecting to API service...',
    ...options,
  });
};

// Hook for manual connection management in components
export const useConnectionGuard = (options: WithConnectionOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  const connection = useConnection({
    autoCheck: opts.autoRetry,
    checkOnMount: true,
    checkOnFocus: true,
    maxRetries: opts.maxRetries,
    retryInterval: opts.retryInterval,
  });

  const renderConnectionState = () => {
    if (connection.isConnecting && opts.showLoadingState) {
      const LoadingComponent = opts.loadingComponent;
      return <LoadingComponent />;
    }

    if (connection.hasError) {
      const ErrorComponent = opts.errorComponent;
      return (
        <ErrorComponent
          error={connection.error || 'Connection failed'}
          onRetry={connection.retry}
          canRetry={connection.canRetry}
        />
      );
    }

    return null;
  };

  return {
    ...connection,
    renderConnectionState,
    shouldRenderContent: connection.isConnected,
    isReady: connection.isConnected && !connection.isConnecting,
  };
};
