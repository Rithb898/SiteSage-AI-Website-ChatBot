import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { splitVendorChunkPlugin } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    splitVendorChunkPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: ".",
        },
      ],
    }),
  ],
  build: {
    outDir: "build",
    // Enable minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Improve chunk size
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
        // Optimize chunk naming for better caching
        manualChunks: (id) => {
          // Create separate chunks for large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('lucide')) {
              return 'vendor-icons';
            }
            if (id.includes('syntax-highlighter')) {
              return 'vendor-syntax';
            }
            if (id.includes('motion')) {
              return 'vendor-motion';
            }
            return 'vendor'; // Other dependencies
          }
        },
      },
    },
    // Enable source maps for production (can be disabled for smaller builds)
    sourcemap: false,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: true,
    },
    // Optimize memory usage
    fs: {
      strict: true,
    },
  },
  // Optimize asset handling
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf'],
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'motion/react', 'lucide-react'],
  },
});
