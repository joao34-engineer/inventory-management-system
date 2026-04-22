import { db } from './connection.ts'
import { users } from '../modules/user/user.schema.ts'
import { hashPassword } from '../shared/utils/auth-utils.ts'
import { eq } from 'drizzle-orm'

async function resetPassword() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.log('Usage: tsx src/db/resetPassword.ts <email> <new-password>')
    console.log('Example: tsx src/db/resetPassword.ts user@example.com newpass123')
    process.exit(1)
  }

  console.log(`🔄 Resetting password for: ${email}`)

  const hashedPassword = await hashPassword(newPassword)

  const [updated] = await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.email, email))
    .returning({ email: users.email })

  if (!updated) {
    console.log('❌ User not found')
    process.exit(1)
  }

  console.log('✅ Password reset successfully!')
  process.exit(0)
}

resetPassword().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
