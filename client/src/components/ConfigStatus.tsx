/**
 * Configuration Status Component
 * 
 * This component displays the current API configuration status
 * and can be used for debugging and development purposes.
 */

import React, { useState, useEffect } from 'react';
import { apiConfig, getEnvironment, API_BASE_URL } from '../config/api';

interface ConfigStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const ConfigStatus: React.FC<ConfigStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'checking' | 'success' | 'error'>('unknown');

  const environment = getEnvironment();
  const isProduction = environment === 'production';

  // Simple connectivity check (just URL validation, not actual request)
  useEffect(() => {
    if (isExpanded) {
      setConnectionStatus('checking');
      try {
        new URL(API_BASE_URL);
        setConnectionStatus('success');
      } catch {
        setConnectionStatus('error');
      }
    }
  }, [isExpanded]);

  const getStatusColor = () => {
    if (!apiConfig.jwtToken || !apiConfig.username) return 'text-yellow-600';
    if (connectionStatus === 'error') return 'text-red-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!apiConfig.jwtToken || !apiConfig.username) return '⚠️';
    if (connectionStatus === 'error') return '❌';
    if (connectionStatus === 'checking') return '🔄';
    return '✅';
  };

  const getStatusText = () => {
    if (!apiConfig.jwtToken || !apiConfig.username) return 'Configuration Incomplete';
    if (connectionStatus === 'error') return 'Configuration Error';
    if (connectionStatus === 'checking') return 'Checking Configuration';
    return 'Configuration OK';
  };

  // Don't show in production unless explicitly requested
  if (isProduction && !showDetails) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className="text-sm text-gray-500">
            ({environment})
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Connection</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {environment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API URL:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                    {API_BASE_URL}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timeout:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {apiConfig.timeout}ms
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Authentication</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className={`font-mono text-xs px-2 py-1 rounded ${
                    apiConfig.username ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {apiConfig.username || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">JWT Token:</span>
                  <span className={`font-mono text-xs px-2 py-1 rounded ${
                    apiConfig.jwtToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {apiConfig.jwtToken ? 'Set' : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(!apiConfig.jwtToken || !apiConfig.username) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Configuration needed:</strong> Some API credentials are missing. 
                Create environment files (.env.development, .env.production) with VITE_JWT_TOKEN and VITE_USERNAME.
              </p>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 text-sm">
                <strong>Invalid API URL:</strong> The configured API base URL appears to be invalid.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigStatus;
