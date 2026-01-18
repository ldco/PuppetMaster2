/**
 * 2FA Verify Endpoint
 *
 * POST /api/user/2fa/verify
 * Body: { code: string }
 * Verifies a TOTP code or backup code during login.
 *
 * This endpoint is called after password verification when 2FA is required.
 * It requires a pending 2FA session (set during login).
 *
 * Returns: { success: true, user: { id, email, name, role }, csrfToken: string }
 *
 * Security:
 * - Requires pending 2FA session
 * - Rate limited: 5 attempts per 15 minutes
 * - Supports both TOTP and backup codes
 * - Backup codes are consumed on use
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../../database/client'
import { verify2faCode } from '../../../utils/totp'
import { generateSessionId } from '../../../utils/password'
import { generateCsrfToken, setCsrfCookie } from '../../../utils/csrf'
import { twoFactorVerifySchema } from '../../../utils/validation'
import { audit } from '../../../utils/audit'
import { twoFactorVerifyRateLimiter, getClientIp } from '../../../utils/rateLimit'

// Store pending 2FA verifications (userId -> { expiresAt, attempts })
// In production, consider using Redis with TTL
const pending2faVerifications = new Map<
  string,
  {
    userId: number
    email: string
    rememberMe: boolean
    expiresAt: Date
    attempts: number
  }
>()

// Export for use in login endpoint
export { pending2faVerifications }

// Maximum verification attempts before session expires
const MAX_ATTEMPTS = 5
const SESSION_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

// Clean up expired sessions
function cleanupExpiredSessions() {
  const now = Date.now()
  for (const [token, session] of pending2faVerifications.entries()) {
    if (now > session.expiresAt.getTime()) {
      pending2faVerifications.delete(token)
    }
  }
}

export default defineEventHandler(async event => {
  // Rate limit by client IP to prevent distributed attacks
  const clientIp = getClientIp(event)
  if (!twoFactorVerifyRateLimiter.checkRateLimit(clientIp)) {
    throw createError({
      statusCode: 429,
      message: 'Too many verification attempts. Please try again later.'
    })
  }

  // Get the pending 2FA token from cookie
  const pendingToken = getCookie(event, 'pm-2fa-pending')

  if (!pendingToken) {
    throw createError({
      statusCode: 400,
      message: 'No pending two-factor verification. Please log in again.'
    })
  }

  // Clean up expired sessions
  cleanupExpiredSessions()

  // Get pending verification
  const pendingSession = pending2faVerifications.get(pendingToken)
  if (!pendingSession) {
    deleteCookie(event, 'pm-2fa-pending', { path: '/' })
    throw createError({
      statusCode: 400,
      message: 'Verification session expired. Please log in again.'
    })
  }

  // Check if session has expired
  if (Date.now() > pendingSession.expiresAt.getTime()) {
    pending2faVerifications.delete(pendingToken)
    deleteCookie(event, 'pm-2fa-pending', { path: '/' })
    throw createError({
      statusCode: 400,
      message: 'Verification session expired. Please log in again.'
    })
  }

  // Check attempts
  if (pendingSession.attempts >= MAX_ATTEMPTS) {
    pending2faVerifications.delete(pendingToken)
    deleteCookie(event, 'pm-2fa-pending', { path: '/' })
    throw createError({
      statusCode: 429,
      message: 'Too many failed attempts. Please log in again.'
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = twoFactorVerifySchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid code format'
    })
  }

  const { code } = result.data
  const db = useDatabase()

  // Get user's 2FA data
  const user2fa = db
    .select()
    .from(schema.user2fa)
    .where(eq(schema.user2fa.userId, pendingSession.userId))
    .get()

  if (!user2fa) {
    // 2FA was disabled between login and verification - shouldn't happen
    pending2faVerifications.delete(pendingToken)
    deleteCookie(event, 'pm-2fa-pending', { path: '/' })
    throw createError({
      statusCode: 400,
      message: 'Two-factor authentication is no longer enabled. Please log in again.'
    })
  }

  // Parse backup codes
  const hashedBackupCodes: string[] = JSON.parse(user2fa.backupCodes)

  // Verify the code
  const verifyResult = verify2faCode(
    code,
    user2fa.secret,
    hashedBackupCodes,
    pendingSession.email
  )

  if (!verifyResult.success) {
    // Increment attempts
    pendingSession.attempts++
    await audit.twoFactorFailed(event, pendingSession.userId, 'invalid_code')

    const remainingAttempts = MAX_ATTEMPTS - pendingSession.attempts
    throw createError({
      statusCode: 401,
      message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
      data: { attemptsRemaining: remainingAttempts }
    })
  }

  // If backup code was used, mark it as consumed
  if (verifyResult.method === 'backup' && verifyResult.backupCodeIndex !== undefined) {
    hashedBackupCodes.splice(verifyResult.backupCodeIndex, 1)
    db.update(schema.user2fa)
      .set({
        backupCodes: JSON.stringify(hashedBackupCodes),
        backupCodesRemaining: hashedBackupCodes.length,
        updatedAt: new Date()
      })
      .where(eq(schema.user2fa.userId, pendingSession.userId))
      .run()
  }

  // Log successful 2FA verification
  await audit.twoFactorVerified(event, pendingSession.userId, verifyResult.method!)

  // Clean up pending session
  pending2faVerifications.delete(pendingToken)
  deleteCookie(event, 'pm-2fa-pending', { path: '/' })

  // Get full user data
  const user = db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role
    })
    .from(schema.users)
    .where(eq(schema.users.id, pendingSession.userId))
    .get()

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  // Delete any existing session (session fixation prevention)
  const oldSessionId = getCookie(event, 'pm-session')
  if (oldSessionId) {
    db.delete(schema.sessions).where(eq(schema.sessions.id, oldSessionId)).run()
  }

  // Create session (same logic as login)
  const sessionId = generateSessionId()
  const expiresAt = new Date()

  if (pendingSession.rememberMe) {
    expiresAt.setDate(expiresAt.getDate() + 30)
  } else {
    expiresAt.setHours(expiresAt.getHours() + 24)
  }

  db.insert(schema.sessions)
    .values({
      id: sessionId,
      userId: user.id,
      expiresAt
    })
    .run()

  // Set session cookie
  setCookie(event, 'pm-session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt
  })

  // Generate and set CSRF token
  const csrfToken = generateCsrfToken()
  setCsrfCookie(event, csrfToken)

  // Log successful login
  await audit.login(event, user.id)

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    csrfToken,
    // Warn if backup codes are running low
    backupCodesRemaining:
      verifyResult.method === 'backup' ? hashedBackupCodes.length : undefined
  }
})
