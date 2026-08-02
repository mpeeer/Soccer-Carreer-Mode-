import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = dirname(fileURLToPath(import.meta.url))

function mirrorBranchPagesBuild() {
  return {
    name: 'mirror-branch-pages-build',
    closeBundle() {
      const distDir = resolve(projectRoot, 'dist')
      const rootAssetsDir = resolve(projectRoot, 'assets')
      const rootIndex = resolve(projectRoot, 'index.html')
      const distIndex = resolve(distDir, 'index.html')
      const distAssetsDir = resolve(distDir, 'assets')

      if (!existsSync(distIndex) || !existsSync(distAssetsDir)) return
      rmSync(rootAssetsDir, { recursive: true, force: true })
      mkdirSync(rootAssetsDir, { recursive: true })
      cpSync(distAssetsDir, rootAssetsDir, { recursive: true })
      cpSync(distIndex, rootIndex)
    },
  }
}

export default defineConfig({
  root: 'src',
  plugins: [react(), mirrorBranchPagesBuild()],
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
