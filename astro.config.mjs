import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

// Keep the HTML readable (compressHTML is off) but strip trailing whitespace
// and blank lines from the built pages. The site has no <pre> or <textarea>
// elements, so this is safe.
const trimHtmlWhitespace = {
  name: 'trim-html-whitespace',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const outDir = fileURLToPath(dir);
      const files = await readdir(outDir, { recursive: true });
      const htmlFiles = files.filter((file) => file.endsWith('.html'));

      await Promise.all(
        htmlFiles.map(async (file) => {
          const path = `${outDir}/${file}`;
          const html = await readFile(path, 'utf8');
          const trimmed = `${html
            .split('\n')
            .map((line) => line.trimEnd())
            .filter((line) => line !== '')
            .join('\n')}\n`;
          await writeFile(path, trimmed);
        })
      );
    },
  },
};

export default defineConfig({
  site: 'https://playground.htmlhint.com',
  compressHTML: false,
  integrations: [trimHtmlWhitespace],
  build: {
    cssMinify: true,
  },
  vite: {
    css: {
      postcss: './postcss.config.cjs',
    },
    build: {
      cssCodeSplit: true,
    },
  },
});
