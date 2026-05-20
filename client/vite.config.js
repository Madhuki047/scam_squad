import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dev server runs on 5173 - this matches the CLIENT_URL the backend
// allows through CORS by default. The API is called by absolute URL
// (see src/lib/api.js), so no dev proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
