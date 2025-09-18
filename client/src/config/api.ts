/**
 * API Configuration
 * 
 * This file centralizes all API-related configuration settings.
 * It supports different environments (development, production, etc.)
 * and provides a single source of truth for API endpoints and authentication.
 */

// Environment-specific configuration
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  jwtToken?: string;
  username?: string;
}

// Default configuration values
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds
  retries: 3,
};

// Helper function to safely get environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined' && window.location) {
    // Browser environment - use import.meta.env
    return (import.meta as any).env?.[key] || defaultValue;
  }
  return defaultValue;
};

// Get current environment
const getEnvironment = (): string => {
  return getEnvVar('MODE', 'development');
};

// Development configuration
const DEVELOPMENT_CONFIG: ApiConfig = {
  ...DEFAULT_CONFIG,
  baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  jwtToken: getEnvVar('VITE_JWT_TOKEN', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4MzEyMjcifQ.YEX2eDDydA3u65FSVQYmtDFR5GgsEDwksjgXFXsrLio'),
  username: getEnvVar('VITE_USERNAME', 's4831227'),
};

// Production configuration
const PRODUCTION_CONFIG: ApiConfig = {
  ...DEFAULT_CONFIG,
  baseUrl: getEnvVar('VITE_API_BASE_URL', 'https://comp2140a2.uqcloud.net/api'),
  timeout: 15000, // Longer timeout for production
  jwtToken: getEnvVar('VITE_JWT_TOKEN', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4MzEyMjcifQ.YEX2eDDydA3u65FSVQYmtDFR5GgsEDwksjgXFXsrLio'),
  username: getEnvVar('VITE_USERNAME', 's4831227'),
};

// Staging configuration
const STAGING_CONFIG: ApiConfig = {
  ...DEFAULT_CONFIG,
  baseUrl: getEnvVar('VITE_API_BASE_URL', 'https://comp2140a2.uqcloud.net/api'),
  jwtToken: getEnvVar('VITE_JWT_TOKEN', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4MzEyMjcifQ.YEX2eDDydA3u65FSVQYmtDFR5GgsEDwksjgXFXsrLio'),
  username: getEnvVar('VITE_USERNAME', 's4831227'),
};

// Get configuration based on current environment
const getConfig = (): ApiConfig => {
  const env = getEnvironment();
  
  switch (env) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'staging':
      return STAGING_CONFIG;
    case 'development':
    default:
      return DEVELOPMENT_CONFIG;
  }
};

// Export the current configuration
export const apiConfig = getConfig();

// Export individual configuration values for convenience
export const {
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  retries: API_RETRIES,
  jwtToken: JWT_TOKEN,
  username: USERNAME,
} = apiConfig;

// Console logging for environment information
export function logEnvironmentInfo() {
  const env = getEnvironment();
  const config = getConfig();
  
  console.log('🚀 ReadySetHire Frontend Starting...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Environment: ${env.toUpperCase()}`);
  console.log(`🌐 API Base URL: ${config.baseUrl}`);
  console.log(`⏱️  Request Timeout: ${config.timeout}ms`);
  console.log(`🔄 Max Retries: ${config.retries}`);
  console.log(`👤 Username: ${config.username || '(not configured)'}`);
  console.log(`🔑 JWT Token: ${config.jwtToken ? `${config.jwtToken.substring(0, 20)}...` : '(not configured)'}`);
  console.log(`🕒 Timestamp: ${new Date().toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Environment-specific warnings
  if (env === 'development') {
    console.log('🔧 Development mode - Debug features enabled');
  } else if (env === 'staging') {
    console.log('🧪 Staging mode - Testing environment');
  } else if (env === 'production') {
    console.log('🏭 Production mode - Optimized build');
    if (!config.jwtToken || !config.username) {
      console.warn('⚠️  Warning: Missing authentication configuration in production');
    }
  }
  
  // Configuration validation
  if (!config.baseUrl.startsWith('http')) {
    console.error('❌ Error: Invalid API base URL format');
  }
  
  if (config.timeout < 1000) {
    console.warn('⚠️  Warning: Request timeout seems too short');
  }
  
  console.log('');
}

// Export configuration getter for dynamic access
export { getConfig, getEnvironment };

// Export types for TypeScript support
export type { ApiConfig };
