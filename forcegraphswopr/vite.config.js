import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react-force-graph", "three"],
  },
  build: {
    target: "esnext", // Ensures modern JavaScript is supported
  },
  resolve: {
    alias: {
      "@": "/src/components", // Use this to simplify imports
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ['./src/tests/NodeCard.test.jsx'],
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'] 
  },
});
