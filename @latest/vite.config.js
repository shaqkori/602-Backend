import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external connections (required for ALB)
    hmr: {
      // Use the ALB's public hostname and port
      host: "myalb-671503919.us-east-1.elb.amazonaws.com",
      protocol: "ws", // Use 'wss' if ALB uses HTTPS
      port: 80, // Use 443 for HTTPS
    },
    // Ensure CORS headers allow WebSocket connections
    cors: true,
  },
});
