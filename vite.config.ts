import { defineConfig } from 'vite';
import polyfillNode from 'rollup-plugin-polyfill-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  define: {
    // Define 'process' for development
    'process.env': {}
  },
  build: {
    rollupOptions: {
      plugins: [
        // Define 'process' for production
        polyfillNode({}),
      ],
    },
  },
});
