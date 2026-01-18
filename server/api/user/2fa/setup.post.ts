/**
 * 2FA Setup Endpoint
 *
 * POST /api/user/2fa/setup
 * Generates a new TOTP secret and returns QR code for authenticator app setup.
 * Does NOT enable 2FA - user must verify with /enable endpoint.
 *
 * Returns: { secret: string, qrCode: string, uri: string }
 *
 * Security:
 * - Requires authenticated session
 * - Rate limited: 5 requests per 15 minutes
 * - Returns temp secret (not stored until verified)
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../../database/client'
import {
  generateTotpSecret,
  generateTotpQRCode,
  getTotpUri,
  encryptTotpSecret,
  generateBackupCodes
} from '../../../utils/totp'
import { twoFactorSetupRateLimiter } from '../../../utils/rateLimit'
import config from '../../../../app/puppet-master.config'

// Store pending 2FA setups (in-memory for simplicity, cleared on server restart)
// In production, consider using Redis or database with TTL
const pendingSetups = new Map<
  number,
  {
    secret: string
    encryptedSecret: string
    backupCodes: { plain: string[]; hashed: string[] }
    createdAt: Date
  }
>()

// Clean up expired pending setups (older than 10 minutes)
function cleanupPendingSetups() {
  const now = Date.now()
  const expiryMs = 10 * 60 * 1000 // 10 minutes
  for (const [userId, setup] of pendingSetups.entries()) {
    if (now - setup.createdAt.getTime() > expiryMs) {
      pendingSetups.delete(userId)
    }
  }
}

export { pendingSetups }

export default defineEventHandler(async event => {
  // Check if 2FA is enabled in config
  if (!config.has2FA) {
    throw createError({
      statusCode: 403,
      message: 'Two-factor authentication is not enabled for this project'
    })
  }

  // Require authentication
  if (!event.context.session?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  const userId = event.context.session.userId

  // Rate limit by user ID
  if (!twoFactorSetupRateLimiter.checkRateLimit(String(userId))) {
    throw createError({
      statusCode: 429,
      message: 'Too many setup attempts. Please try again later.'
    })
  }

  const db = useDatabase()

  // Get user to check if 2FA is already enabled
  const user = db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      twoFactorEnabled: schema.users.twoFactorEnabled
    })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get()

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  if (user.twoFactorEnabled) {
    throw createError({
      statusCode: 400,
      message: 'Two-factor authentication is already enabled. Disable it first to set up a new device.'
    })
  }

  // Clean up old pending setups
  cleanupPendingSetups()

  // Generate new TOTP secret and backup codes
  const secret = generateTotpSecret()
  const encryptedSecret = encryptTotpSecret(secret)
  const backupCodes = generateBackupCodes()

  // Generate QR code and URI
  const qrCode = await generateTotpQRCode(secret, user.email)
  const uri = getTotpUri(secret, user.email)

  // Store pending setup
  pendingSetups.set(userId, {
    secret,
    encryptedSecret,
    backupCodes,
    createdAt: new Date()
  })

  return {
    // Don't expose the raw secret - only the QR code and manual entry URI
    qrCode,
    uri,
    // Return plain backup codes (only shown once during setup)
    backupCodes: backupCodes.plain
  }
})
