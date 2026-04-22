import {drizzle} from 'drizzle-orm/node-postgres'
import {Pool} from 'pg'
import * as schema from './schema.ts'
import {env, isProd} from '../../env.ts'
import {remember} from '@epic-web/remember'

let pool: Pool | null = null
let initAttempted = false

const createPool = () => {
  try {
    console.log('📊 Creating PostgreSQL connection pool...')
    return new Pool({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
      max: 10,
    })
  } catch (error) {
    console.error('❌ Failed to create database pool:', error)
    return null
  }
}

const getClient = (): Pool => {
  if (!initAttempted) {
    initAttempted = true
    if (isProd()) {
      pool = createPool()
      if (!pool) {
        console.warn('⚠️  Database pool creation failed - routes may not work')
      } else {
        console.log('✅ Database pool initialized')
      }
    } else {
      pool = remember('dbPool', () => createPool()) as Pool
    }
  }
  
  if (!pool) {
    // Create a dummy pool that won't throw errors
    const dummyPool = createPool()
    if (!dummyPool) {
      console.warn('⚠️  Using fallback - database will not be available')
      throw new Error('Database connection unavailable')
    }
    return dummyPool
  }
  
  return pool
}

// Export a function that returns the client, not the client itself
export const getDb = getClient

// Create db instance with lazy initialization
export const db = drizzle({ 
  client: new Proxy({} as Pool, {
    get(target, prop) {
      try {
        const client = getClient()
        return (client as any)[prop]
      } catch (error) {
        console.error(`Database method ${String(prop)} failed:`, error)
        return null
      }
    }
  }), 
  schema 
})

export default db