
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext' // Ensures modern JavaScript is supported
  },
  resolve: {
    alias: {
      '@': '/src/components' // Use this to simplify imports
    }
  }
});
