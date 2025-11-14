import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente do arquivo .env na raiz do projeto
  const env = loadEnv(mode, '../', '')

  return {
    plugins: [react()],
    envDir: '../',
    server: {
      port: parseInt(env.FRONTEND_PORT || '5173'),
      host: true,
    },
  }
})
