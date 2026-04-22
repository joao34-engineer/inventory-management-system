import { app } from './server.ts'
import { env } from '../env.ts'

const PORT = env.PORT || 3000

console.log('🚀 Starting SafeSite API...')
console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`🌍 Stage: ${process.env.APP_STAGE || 'dev'}`)

const server = app.listen(PORT, () => {
  console.log('')
  console.log('═══════════════════════════════════════════')
  console.log('✅ Server is listening on port', PORT)
  console.log('═══════════════════════════════════════════')
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log(`📝 API Docs: http://localhost:${PORT}/api-docs`)
  console.log('═══════════════════════════════════════════')
  console.log('')
})

server.on('error', (error) => {
  console.error('❌ Server error:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason)
})

process.on('beforeExit', (code) => {
  console.log('Process will exit with code:', code)
})

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received - graceful shutdown')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received - graceful shutdown')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})