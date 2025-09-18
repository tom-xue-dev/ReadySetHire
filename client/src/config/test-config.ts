/**
 * Configuration Test Utility
 * 
 * This file provides utilities to test and validate the API configuration
 * in different environments.
 */

import { apiConfig, getEnvironment, API_BASE_URL, JWT_TOKEN, USERNAME } from './api';

/**
 * Test the current configuration and log results
 */
export function testConfiguration(): void {
  console.group('🔧 API Configuration Test');
  
  // Environment info
  console.log('📍 Environment:', getEnvironment());
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('👤 Username:', USERNAME || '(not set)');
  console.log('🔑 JWT Token:', JWT_TOKEN ? `${JWT_TOKEN.substring(0, 20)}...` : '(not set)');
  
  // Configuration object
  console.log('⚙️ Full Config:', {
    baseUrl: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    retries: apiConfig.retries,
    hasToken: !!apiConfig.jwtToken,
    hasUsername: !!apiConfig.username,
  });
  
  // Validation
  const issues: string[] = [];
  
  if (!apiConfig.baseUrl) {
    issues.push('❌ Base URL is not set');
  } else if (!apiConfig.baseUrl.startsWith('http')) {
    issues.push('❌ Base URL should start with http/https');
  } else {
    console.log('✅ Base URL is valid');
  }
  
  if (!apiConfig.jwtToken) {
    issues.push('⚠️  JWT Token is not set (may be required for authentication)');
  } else {
    console.log('✅ JWT Token is set');
  }
  
  if (!apiConfig.username) {
    issues.push('⚠️  Username is not set (may be required for API calls)');
  } else {
    console.log('✅ Username is set');
  }
  
  if (apiConfig.timeout < 1000) {
    issues.push('❌ Timeout is too low (should be at least 1000ms)');
  } else {
    console.log('✅ Timeout is reasonable');
  }
  
  // Summary
  if (issues.length === 0) {
    console.log('🎉 Configuration is valid!');
  } else {
    console.warn('⚠️  Configuration issues found:');
    issues.forEach(issue => console.warn(issue));
  }
  
  console.groupEnd();
}

/**
 * Test API connectivity (without making actual requests)
 */
export function testApiConnectivity(): Promise<boolean> {
  return new Promise((resolve) => {
    console.group('🌐 API Connectivity Test');
    
    // Simple URL validation
    try {
      const url = new URL(API_BASE_URL);
      console.log('✅ API URL is parseable');
      console.log('🔗 Protocol:', url.protocol);
      console.log('🏠 Host:', url.host);
      console.log('📁 Path:', url.pathname);
      
      // Check if it's a secure connection in production
      if (getEnvironment() === 'production' && url.protocol !== 'https:') {
        console.warn('⚠️  Using HTTP in production environment (consider HTTPS)');
      }
      
      resolve(true);
    } catch (error) {
      console.error('❌ Invalid API URL:', error);
      resolve(false);
    }
    
    console.groupEnd();
  });
}

/**
 * Run all configuration tests
 */
export async function runAllTests(): Promise<void> {
  console.log('🚀 Running API Configuration Tests...\n');
  
  testConfiguration();
  console.log('');
  
  const connectivityOk = await testApiConnectivity();
  console.log('');
  
  if (connectivityOk) {
    console.log('✅ All configuration tests passed!');
  } else {
    console.error('❌ Some configuration tests failed. Please check the settings.');
  }
}

// Auto-run tests in development mode (can be disabled)
if (getEnvironment() === 'development' && typeof window !== 'undefined') {
  // Run tests after a short delay to avoid interfering with app startup
  setTimeout(() => {
    if (window.location.search.includes('debug=config')) {
      runAllTests();
    }
  }, 1000);
}
