/**
 * Create User API Endpoint
 *
 * POST /api/admin/users
 * Body: { email: string, password: string, name?: string, role: UserRole }
 * Returns: { success: true, user: User }
 *
 * Requires: admin+ role (enforced by middleware)
 */
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../database/client'
import { USER_ROLES, type UserRole } from '../../database/schema'
import { hashPassword } from '../../utils/password'
import { canManageUser, getAssignableRoles } from '../../utils/roles'
import { audit } from '../../utils/audit'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  role: z.enum(USER_ROLES)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const currentUser = event.context.user

  // Validate input
  const result = createUserSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.issues[0]?.message || 'Invalid input'
    })
  }

  const { email, password, name, role } = result.data

  // Check if current user can assign this role
  const assignableRoles = getAssignableRoles(currentUser?.role as UserRole)
  if (!assignableRoles.includes(role)) {
    throw createError({
      statusCode: 403,
      message: `You cannot assign the ${role} role`
    })
  }

  const db = useDatabase()

  // Check if email already exists
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get()

  if (existing) {
    throw createError({
      statusCode: 409,
      message: 'A user with this email already exists'
    })
  }

  // Create user
  const passwordHash = hashPassword(password)

  db.insert(schema.users).values({
    email,
    passwordHash,
    name: name || null,
    role
  }).run()

  // Get created user
  const newUser = db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt
    })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get()

  // Audit log
  if (newUser) {
    await audit.userCreate(event, currentUser!.id, newUser.id, email, role)
  }

  return {
    success: true,
    user: newUser
  }
})

