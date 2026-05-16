// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => `[data-theme="${theme.name === 'github-light' ? 'acid' : 'sunset'}"]`,
      styleOverrides: {
        borderRadius: '0.75rem',
        codeFontFamily: 'var(--font-mono, monospace)',
      },
    }),
    mdx(),
  ],
});
