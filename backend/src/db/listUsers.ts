import { db } from './connection.ts'
import { users } from '../modules/user/user.schema.ts'

async function listUsers() {
  console.log('📋 Listing all users...\n')

  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    username: users.username,
    firstName: users.firstName,
    lastName: users.lastName,
    role: users.role,
    createdAt: users.createdAt
  }).from(users)

  if (allUsers.length === 0) {
    console.log('No users found in database.')
  } else {
    console.log(`Found ${allUsers.length} user(s):\n`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })
  }

  process.exit(0)
}

listUsers().catch(err => {
  console.error('❌ Error listing users:', err)
  process.exit(1)
})
