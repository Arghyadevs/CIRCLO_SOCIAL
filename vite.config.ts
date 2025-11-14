import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: 'Public',
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@clerk/clerk-react',
    ],
  },
  build: {
    // Target modern browsers
    target: 'esnext',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') && !id.includes('@clerk')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            if (id.includes('@clerk')) {
              return 'vendor-auth';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            return 'vendor-other';
          }
        },
      },
    },
    
    // Source maps for production debugging
    sourcemap: true,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Lib mode false (we're building an app)
    lib: false,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Rollup warning handling
    commonjsOptions: {
      include: /node_modules/,
    },
  },
  
  server: {
    middlewareMode: false,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  preview: {
    port: 3000,
  },
});