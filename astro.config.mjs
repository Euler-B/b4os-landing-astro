// astro.config.mjs
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://b4os.dev',
  
  compressHTML: true,

  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  i18n: {
    defaultLocale: "es",
    locales: ["es", "en", "pt"],
    routing: {
      prefixDefaultLocale: false // español sin prefijo (/), inglés (/en/), portugués (/pt/)
    }
  },
    
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('astro-icon')) {
              return 'icons';
            }
          },
        }
      }
    }
  },
  
  integrations: [
    icon({
      include: {
        'simple-icons': ['bitcoin'], // Solo Bitcoin de Simple Icons
        'heroicons': ['chat-bubble-left-right','book-open','bolt', 
          'code-bracket-square', 'computer-desktop', 'wrench-screwdriver',
          'globe-americas', 'globe-europe-africa', 'envelope-solid'
        ],
      },
    }),
  ],  
});