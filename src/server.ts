import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { isTest } from '../env.ts'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.ts'

const app = express()

// Core middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}))

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

if (!isTest()) {
  app.use(morgan('combined'))
}

// ========================================
// HEALTH CHECK - CRITICAL FIRST ROUTE
// ========================================
app.get('/health', (req: Request, res: Response) => {
  console.log('✅ Health check OK')
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'SafeSite API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  })
})

// Root redirect
app.get('/', (req: Request, res: Response) => {
  res.redirect(301, '/api-docs')
})

// ========================================
// Swagger Documentation
// ========================================
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { font-size: 2.5rem; color: #16a34a }
    .swagger-ui .info .description { font-size: 1.1rem; margin-top: 20px }
  `,
  customSiteTitle: 'SafeSite API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    url: undefined,
    validatorUrl: null
  }
}))

console.log('✅ Swagger UI loaded')

// ========================================
// Load API Routes with error handling
// ========================================
(async () => {
  try {
    console.log('📚 Loading API routes...')
    
    try {
      const authRoutes = (await import('./routes/authRoutes.ts')).default
      app.use('/api/auth', authRoutes)
      console.log('✅ Auth routes loaded')
    } catch (e) {
      console.error('❌ Failed to load auth routes:', (e as Error).message)
    }

    try {
      const userRoutes = (await import('./routes/userRoutes.ts')).default
      app.use('/api/users', userRoutes)
      console.log('✅ User routes loaded')
    } catch (e) {
      console.error('❌ Failed to load user routes:', (e as Error).message)
    }

    try {
      const protocolRoutes = (await import('./routes/protocolRoutes.ts')).default
      app.use('/api/protocols', protocolRoutes)
      console.log('✅ Protocol routes loaded')
    } catch (e) {
      console.error('❌ Failed to load protocol routes:', (e as Error).message)
    }

    try {
      const hazardZoneRoutes = (await import('./routes/hazardZoneRoutes.ts')).default
      app.use('/api/hazard-zones', hazardZoneRoutes)
      console.log('✅ Hazard zone routes loaded')
    } catch (e) {
      console.error('❌ Failed to load hazard zone routes:', (e as Error).message)
    }

    console.log('✅ Route loading complete')
  } catch (error) {
    console.error('❌ Error in route initialization:', error)
  }
})()

// ========================================
// 404 Handler
// ========================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: `No route found for ${req.method} ${req.path}`
  })
})

// ========================================
// Global Error Handler (must be last)
// ========================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.message)
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  })
})

export { app }
export default app







