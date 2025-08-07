import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://your-backend.onrender.com", // <-- CHANGE THIS to your Render backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
