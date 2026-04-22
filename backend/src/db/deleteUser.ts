import { db } from './connection.ts'
import { users } from '../modules/user/user.schema.ts'
import { eq } from 'drizzle-orm'

async function deleteUser() {
  const email = process.argv[2]

  if (!email) {
    console.log('Usage: tsx src/db/deleteUser.ts <email>')
    console.log('Example: tsx src/db/deleteUser.ts user@example.com')
    process.exit(1)
  }

  console.log(`🗑️  Deleting user: ${email}`)

  const [deleted] = await db
    .delete(users)
    .where(eq(users.email, email))
    .returning({ email: users.email })

  if (!deleted) {
    console.log('❌ User not found')
    process.exit(1)
  }

  console.log('✅ User deleted successfully!')
  process.exit(0)
}

deleteUser().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
