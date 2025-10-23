import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-gluestack-style'],
      },
    }),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
