import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // jsdom gives tests a fake browser (so localStorage works in tests)
  test: { environment: 'jsdom', globals: true },
});
