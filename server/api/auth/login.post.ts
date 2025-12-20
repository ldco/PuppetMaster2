/**
 * Login API Endpoint
 *
 * POST /api/auth/login
 * Body: { email: string, password: string, rememberMe?: boolean }
 * Returns: { success: true, user: { id, email, name, role }, csrfToken: string }
 *
 * Security:
 * - Rate limited: 5 attempts per 15 minutes per IP
 * - Account lockout: 5 failed attempts = 30 min lockout
 * - Password hashed with scrypt
 * - CSRF token generated on success
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { verifyPassword, generateSessionId } from '../../utils/password'
import { generateCsrfToken, setCsrfCookie } from '../../utils/csrf'
import { loginRateLimiter, getClientIp } from '../../utils/rateLimit'
import {
  checkAccountLocked,
  recordFailedAttempt,
  resetFailedAttempts
} from '../../utils/accountLockout'
import { audit } from '../../utils/audit'
import { loginSchema } from '../../utils/validation'

export default defineEventHandler(async event => {
  // Rate limit check - 5 attempts per 15 minutes per IP
  const clientIp = getClientIp(event)

  if (!loginRateLimiter.checkRateLimit(clientIp)) {
    throw createError({
      statusCode: 429,
      message: 'Too many login attempts. Please try again in 15 minutes.',
      data: {
        retryAfter: 15 * 60, // seconds
        remaining: 0
      }
    })
  }

  const body = await readBody(event)

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid email or password format'
    })
  }

  const { email, password, rememberMe } = result.data
  const db = useDatabase()

  // Find user by email
  const user = db.select().from(schema.users).where(eq(schema.users.email, email)).get()

  if (!user) {
    // Don't reveal that user doesn't exist - but log it
    await audit.loginFailed(event, email, 'user_not_found')
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }

  // Check if account is locked
  const lockoutStatus = await checkAccountLocked(user.id)
  if (lockoutStatus.isLocked) {
    await audit.loginFailed(event, email, 'account_locked', user.id)
    throw createError({
      statusCode: 423, // Locked
      message: `Account temporarily locked due to too many failed attempts. Try again in ${lockoutStatus.minutesRemaining} minutes.`,
      data: {
        lockedUntil: lockoutStatus.lockedUntil,
        minutesRemaining: lockoutStatus.minutesRemaining
      }
    })
  }

  // Verify password
  if (!verifyPassword(password, user.passwordHash)) {
    // Record failed attempt
    const lockoutResult = await recordFailedAttempt(user.id)

    if (lockoutResult.isLocked) {
      await audit.accountLocked(event, user.id, 'max_failed_attempts')
      await audit.loginFailed(event, email, 'invalid_password_locked', user.id)
      throw createError({
        statusCode: 423, // Locked
        message: `Account locked due to too many failed attempts. Try again in ${lockoutResult.lockoutMinutes} minutes.`,
        data: {
          attemptsRemaining: 0,
          lockoutMinutes: lockoutResult.lockoutMinutes
        }
      })
    }

    await audit.loginFailed(event, email, 'invalid_password', user.id)
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password',
      data: {
        attemptsRemaining: lockoutResult.attemptsRemaining
      }
    })
  }

  // Successful login - reset failed attempts and log
  await resetFailedAttempts(user.id)
  await audit.login(event, user.id)

  // Create session
  const sessionId = generateSessionId()
  const expiresAt = new Date()

  // Session duration: 30 days if rememberMe, otherwise 24 hours
  if (rememberMe) {
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

  // Set session cookie (upgraded to strict SameSite for CSRF protection)
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

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    csrfToken
  }
})
