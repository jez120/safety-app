/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use global APIs like describe, it, expect
    environment: 'jsdom', // Simulate browser environment
    setupFiles: './src/setupTests.ts', // Optional setup file
    // include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Default include pattern
    // reporters: ['default', 'html'], // Optional: Add HTML reporter
    // coverage: { // Optional: Configure coverage
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html'],
    // },
  },
})
