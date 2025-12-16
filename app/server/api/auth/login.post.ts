/**
 * Login API Endpoint
 *
 * POST /api/auth/login
 * Body: { email: string, password: string, rememberMe?: boolean }
 * Returns: { success: true, user: { id, email, name, role } }
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { verifyPassword, generateSessionId } from '../../utils/password'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false)
})

export default defineEventHandler(async (event) => {
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
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get()

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }

  // Verify password
  if (!verifyPassword(password, user.passwordHash)) {
    throw createError({
      statusCode: 401,
      message: 'Invalid email or password'
    })
  }

  // Create session
  const sessionId = generateSessionId()
  const expiresAt = new Date()

  // Session duration: 30 days if rememberMe, otherwise 24 hours
  if (rememberMe) {
    expiresAt.setDate(expiresAt.getDate() + 30)
  } else {
    expiresAt.setHours(expiresAt.getHours() + 24)
  }

  db.insert(schema.sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt
  }).run()

  // Set session cookie
  setCookie(event, 'pm-session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
})

