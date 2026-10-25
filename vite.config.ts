import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 项目页路径，仓库名即子路径
  base: '/portfolio/',
  plugins: [react()],
  server: { host: true, port: 5173 },
})
