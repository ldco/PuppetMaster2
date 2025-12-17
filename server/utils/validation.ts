/**
 * Validation Schemas
 *
 * Centralized Zod schemas for API input validation.
 * Keep validation logic in one place for consistency and testability.
 */
import { z } from 'zod'
import { USER_ROLES } from '../database/schema'

// ═══════════════════════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
})

export type LoginInput = z.infer<typeof loginSchema>

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  phone: z.string().max(30, 'Phone number is too long').optional(),
  subject: z.string().max(200, 'Subject is too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long')
})

export type ContactInput = z.infer<typeof contactSchema>

// ═══════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().max(100, 'Name is too long').optional(),
  role: z.enum(USER_ROLES, { message: 'Invalid role' })
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  name: z.string().max(100, 'Name is too long').optional(),
  role: z.enum(USER_ROLES, { message: 'Invalid role' }).optional()
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const portfolioItemSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  content: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
  category: z.string().max(50, 'Category is too long').optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional()
})

export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate input and return result with typed data or formatted errors
 */
export function validateInput<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Zod uses result.error.issues
  const issues = result.error.issues
  const errors = issues.map((e) => e.message)
  return { success: false, errors }
}

