/**
 * 2FA Enable Endpoint
 *
 * POST /api/user/2fa/enable
 * Body: { code: string }
 * Verifies the TOTP code and enables 2FA for the user.
 *
 * Returns: { success: true, message: string }
 *
 * Security:
 * - Requires authenticated session
 * - Requires pending setup from /setup endpoint
 * - Verifies TOTP code before enabling
 * - Rate limited: 5 attempts per 15 minutes
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../../database/client'
import { verifyTotpCode, decryptTotpSecret } from '../../../utils/totp'
import { twoFactorEnableSchema } from '../../../utils/validation'
import { audit } from '../../../utils/audit'
import { twoFactorEnableRateLimiter } from '../../../utils/rateLimit'
import { pendingSetups } from './setup.post'

export default defineEventHandler(async event => {
  // Require authentication
  if (!event.context.session?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  const userId = event.context.session.userId

  // Rate limit by user ID
  if (!twoFactorEnableRateLimiter.checkRateLimit(String(userId))) {
    throw createError({
      statusCode: 429,
      message: 'Too many verification attempts. Please try again later.'
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = twoFactorEnableSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid verification code format'
    })
  }

  const { code } = result.data

  // Get pending setup
  const pendingSetup = pendingSetups.get(userId)
  if (!pendingSetup) {
    throw createError({
      statusCode: 400,
      message: 'No pending 2FA setup found. Please start setup again.'
    })
  }

  // Check if setup has expired (10 minutes)
  const setupAge = Date.now() - pendingSetup.createdAt.getTime()
  if (setupAge > 10 * 60 * 1000) {
    pendingSetups.delete(userId)
    throw createError({
      statusCode: 400,
      message: '2FA setup has expired. Please start setup again.'
    })
  }

  const db = useDatabase()

  // Get user email for TOTP verification
  const user = db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get()

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  // Verify the TOTP code using the pending secret
  if (!verifyTotpCode(pendingSetup.secret, code, user.email)) {
    await audit.twoFactorFailed(event, userId, 'invalid_setup_code')
    throw createError({
      statusCode: 400,
      message: 'Invalid verification code. Please try again.'
    })
  }

  // Store the 2FA secret and backup codes
  // Check if user already has a 2FA record (shouldn't happen, but be safe)
  const existing2fa = db
    .select({ id: schema.user2fa.id })
    .from(schema.user2fa)
    .where(eq(schema.user2fa.userId, userId))
    .get()

  if (existing2fa) {
    // Update existing record
    db.update(schema.user2fa)
      .set({
        secret: pendingSetup.encryptedSecret,
        backupCodes: JSON.stringify(pendingSetup.backupCodes.hashed),
        backupCodesRemaining: 10,
        updatedAt: new Date()
      })
      .where(eq(schema.user2fa.userId, userId))
      .run()
  } else {
    // Create new record
    db.insert(schema.user2fa)
      .values({
        userId,
        secret: pendingSetup.encryptedSecret,
        backupCodes: JSON.stringify(pendingSetup.backupCodes.hashed),
        backupCodesRemaining: 10
      })
      .run()
  }

  // Enable 2FA on user record
  db.update(schema.users)
    .set({
      twoFactorEnabled: true,
      updatedAt: new Date()
    })
    .where(eq(schema.users.id, userId))
    .run()

  // Clean up pending setup
  pendingSetups.delete(userId)

  // Log audit event
  await audit.twoFactorEnabled(event, userId)

  return {
    success: true,
    message: 'Two-factor authentication has been enabled successfully.'
  }
})
