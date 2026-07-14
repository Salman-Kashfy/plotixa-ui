import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { existsSync } from 'fs'
import { join } from 'path'

const isProd = process.env.NODE_ENV === 'production'

const sslPaths = [
  'E:/SSL-localhost',
  './ssl',
  './certs',
  process.env.SSL_CERT_PATH
].filter(Boolean);

let httpsConfig = undefined;
for (const sslPath of sslPaths) {
  if (!sslPath) continue;
  const keyPath = join(sslPath, 'private.key');
  const certPath = join(sslPath, 'certificate.crt');
  if (existsSync(keyPath) && existsSync(certPath)) {
    httpsConfig = { key: keyPath, cert: certPath };
    break;
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsConfig,
    port: isProd ? 3000 : 5174
  },
  base: isProd ? '/' : './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})