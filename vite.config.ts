import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';

// package.json থেকে ভার্সন পড়ে নেওয়া হচ্ছে
const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  plugins: [react()],
  define: {
    // অ্যাপের ভেতরে VITE_APP_VERSION হিসেবে ভার্সনটি ব্যবহার করা যাবে
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url))
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    // বড় ফাইলের ওয়ার্নিং লিমিট বাড়িয়ে দেওয়া হলো
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks: {
          // React এর কোর লাইব্রেরিগুলো
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // ডেটা ফেচিং এবং ক্যাশিং
          'query-vendor': [
            '@tanstack/react-query', 
            '@tanstack/react-query-persist-client', 
            '@tanstack/query-sync-storage-persister'
          ],
          // ডেটাবেস ও অথেন্টিকেশন
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'supabase-vendor': ['@supabase/supabase-js'],
        }
      }
    }
  }
});
