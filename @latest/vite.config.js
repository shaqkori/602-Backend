import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external connections
    hmr: {
      // Use the ALB's public hostname and protocol
      host: "myalb-671503919.us-east-1.elb.amazonaws.com",
      protocol: "ws", // Use 'wss' if HTTPS/SSL is enabled
      port: 80, // Use 443 for HTTPS
    },
    // If behind a proxy (like ALB), set the origin explicitly
    origin: "http://myalb-671503919.us-east-1.elb.amazonaws.com",
  },
});
