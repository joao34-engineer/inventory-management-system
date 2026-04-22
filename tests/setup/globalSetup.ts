import { db } from '../../src/db/connection.ts'
import { users, protocols, complianceLogs, hazardZones, protocolZones } from '../../src/db/schema.ts'
import { sql } from 'drizzle-orm'
import { execSync } from 'child_process'


export default async function setup() {
  console.log('Setting up the SafeSite test database...')
  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${complianceLogs} CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS ${protocolZones} CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS ${protocols} CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS ${hazardZones} CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE;`);
    execSync(`npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema=./src/db/schema.ts --dialect=postgresql`, 
      { 
        stdio: 'inherit',
        cwd: process.cwd()
      }
    );
    console.log('SafeSite test database is ready')
  } catch (e) {
    console.error('Failed to setup test database', e)
    throw e
  
  }

  return async () => {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${complianceLogs} CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS ${protocolZones} CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS ${protocols} CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS ${hazardZones} CASCADE;`);
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE;`);
      process.exit(0)
    } catch (e) {
      console.error('Failed to tear down test database', e)
      throw e
    }
  }
}