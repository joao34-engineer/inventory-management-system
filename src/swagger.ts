import swaggerJsdoc from 'swagger-jsdoc'
import { env } from '../env.ts'

const isProduction = env.NODE_ENV === 'production'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SafeSite Field Compliance & Inspection API',
      version: '1.0.0',
      description: 'Enterprise-grade safety compliance API for industrial environments. Enables safety officers to define recurring inspection protocols and allows field technicians to log daily compliance checks.',
      contact: {
        name: 'João Marcelo',
        email: 'support@safesite.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: isProduction ? [
      {
        url: '/',
        description: 'Production server (uses current domain)'
      }
    ] : [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server'
      },
      {
        url: '/',
        description: 'Current domain'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            username: {
              type: 'string',
              description: 'User username'
            },
            firstName: {
              type: 'string',
              description: 'User first name'
            },
            lastName: {
              type: 'string',
              description: 'User last name'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Protocol: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Protocol unique identifier'
            },
            name: {
              type: 'string',
              description: 'Protocol name'
            },
            description: {
              type: 'string',
              description: 'Protocol description'
            },
            frequency: {
              type: 'string',
              enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'SHIFT_START', 'SHIFT_END'],
              description: 'Inspection frequency'
            },
            targetCount: {
              type: 'integer',
              description: 'Target number of inspections'
            },
            isActive: {
              type: 'boolean',
              description: 'Protocol active status'
            },
            hazardZoneId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated hazard zone ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        HazardZone: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Hazard zone unique identifier'
            },
            name: {
              type: 'string',
              description: 'Zone name'
            },
            color: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Hex color code (Red=#dc2626, Yellow=#eab308, Green=#16a34a)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ComplianceLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Compliance log unique identifier'
            },
            protocolId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated protocol ID'
            },
            completionDate: {
              type: 'string',
              format: 'date-time',
              description: 'When the inspection was completed'
            },
            note: {
              type: 'string',
              description: 'Technician observations'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Protocols',
        description: 'Safety inspection protocol management'
      },
      {
        name: 'Hazard Zones',
        description: 'Hazard zone categorization and management'
      },
      {
        name: 'Health',
        description: 'API health check endpoint'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/server.ts'] // Path to the API routes
}

export const swaggerSpec = swaggerJsdoc(options)
