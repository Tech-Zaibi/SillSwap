import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // jsdom gives tests a fake browser (so localStorage works in tests)
  test: { environment: 'jsdom', globals: true },
});
