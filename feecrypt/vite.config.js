import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {
    'process.env': process.env,
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Set the server to listen on all network interfaces
    port: 5173,      // (Optional) Specify the port; default is 3000
  },
});
