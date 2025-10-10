import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    
    // Ensure consistent entry point regardless of mode
    root: '.',
    
    // Define global constants for better development experience
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    
    // Server configuration for development
    server: {
      port: 5173,
      host: true, // Allow external connections
      proxy: {
        // Proxy API calls to backend during development
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
      // Ensure Transformers.js can make external requests
      cors: true,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    
    // Environment variables configuration
    envPrefix: 'VITE_',
  }
})
