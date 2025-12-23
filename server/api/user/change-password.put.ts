/**
 * Change Password API Endpoint
 *
 * PUT /api/user/change-password
 * Body: { currentPassword: string, newPassword: string }
 * Returns: { success: true }
 *
 * Security:
 * - Requires authenticated user (session)
 * - Verifies current password before allowing change
 * - Password hashed with scrypt
 * - Audit logged
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { verifyPassword, hashPassword } from '../../utils/password'
import { audit } from '../../utils/audit'

// Validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
})

export default defineEventHandler(async event => {
  // Get authenticated user from context (set by auth middleware)
  const sessionUser = event.context.user as { id: number } | undefined

  if (!sessionUser?.id) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated'
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = changePasswordSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message || 'Validation failed'
    })
  }

  const { currentPassword, newPassword } = result.data
  const db = useDatabase()

  // Get user with current password hash
  const user = db
    .select({ id: schema.users.id, passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.id, sessionUser.id))
    .get()

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  // Verify current password
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      message: 'Current password is incorrect'
    })
  }

  // Hash and update new password
  const newPasswordHash = hashPassword(newPassword)

  db.update(schema.users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    })
    .where(eq(schema.users.id, user.id))
    .run()

  // Audit log the password change
  await audit.passwordChange(event, sessionUser.id, user.id)

  return {
    success: true
  }
})
