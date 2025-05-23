import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://extensions.aitopia.ai',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ai': {
        target: 'https://extensions.aitopia.ai',
        changeOrigin: true,
        secure: false
      },
      '/languages': {
        target: 'https://extensions.aitopia.ai',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('cloudinary')) {
              return 'vendor-cloudinary';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@cloudinary/url-gen', '@cloudinary/react']
  }
})
