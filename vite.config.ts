import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repository = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? ''
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const isUserSite = repository.endsWith('.github.io')
const baseFromEnv = process.env.VITE_BASE_PATH
const base = baseFromEnv ?? (isGithubActions && !isUserSite && repository ? `/${repository}/` : '/')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
