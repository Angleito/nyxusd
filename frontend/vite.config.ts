import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // Proxy disabled for Vercel deployment
    // Uncomment for local development with separate backend
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:8080",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: {
        "import-assertions": true,
      },
    },
  },
});
