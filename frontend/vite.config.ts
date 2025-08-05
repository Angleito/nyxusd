import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "wallet-vendor": ["wagmi", "viem", "@rainbow-me/rainbowkit"],
          "ui-vendor": ["framer-motion", "@headlessui/react"],
          // Split large individual libraries
          "metamask-sdk": ["@metamask/sdk"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
    },
  },
  server: {
    port: 3000,
    host: true,
    // Proxy for local development
    proxy: {
      "/api/oracle": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      "/api/system": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      "/api/health": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      "/api/ai/chat": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      "/api/ai/chat-stream": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
    },
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
