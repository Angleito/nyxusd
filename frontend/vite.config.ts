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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'wallet-vendor': ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // Split large individual libraries
          'metamask-sdk': ['@metamask/sdk']
        }
      }
    }
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
