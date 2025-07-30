import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // *** ADDED: Explicit host ***
    port: 3000,
    strictPort: true,  // *** ADDED: Fail if port is busy ***
    open: false,       // *** ADDED: Don't auto-open browser ***
    
    // *** ENHANCED HMR CONFIGURATION ***
    hmr: {
      port: 3001,      // Use different port for Hot Module Replacement
      host: 'localhost'
    },
    
    // *** ADDED: WebSocket configuration ***
    ws: {
      port: 3002       // Use different port for WebSocket to avoid conflicts
    },
    
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  
  // *** ADDED: Build configuration to reduce warnings ***
  build: {
    sourcemap: false,  // Disable sourcemaps in development
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  
  // *** ADDED: Define global constants ***
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // Suppress React DevTools warnings in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  
  // *** ADDED: ESBuild options to reduce warnings ***
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent' 
    }
  }
})