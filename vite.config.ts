import { defineConfig } from 'vite'
import polyfillNode from 'rollup-plugin-polyfill-node';
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      plugins: [
        polyfillNode({}),
      ],
    },
  },
});
