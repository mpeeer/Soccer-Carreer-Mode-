import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: 'strip-branch-pages-fallback',
      transformIndexHtml: {
        order: 'post' as const,
        handler(html: string) {
          return command === 'build' ? html.replace(/\s*<script data-branch-pages-fallback>[\s\S]*?<\/script>/, '') : html
        },
      },
    },
  ],
  base: './',
}))
