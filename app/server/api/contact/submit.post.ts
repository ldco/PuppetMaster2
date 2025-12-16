/**
 * POST /api/contact/submit
 *
 * Submits a contact form.
 * Public endpoint with rate limiting and validation.
 */
import { z } from 'zod'
import { useDatabase, schema } from '../../database/client'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000)
})

// Simple in-memory rate limiting (per IP, 5 submissions per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT) {
    return false
  }

  entry.count++
  return true
}

export default defineEventHandler(async (event) => {
  // Get client IP for rate limiting
  const ip = getHeader(event, 'x-forwarded-for') ||
             getHeader(event, 'x-real-ip') ||
             'unknown'

  // Check rate limit
  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.'
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  const result = contactSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: result.error.flatten()
    })
  }

  const data = result.data
  const db = useDatabase()

  // Insert contact submission
  const submission = db
    .insert(schema.contactSubmissions)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
      read: false
    })
    .returning()
    .get()

  return {
    success: true,
    message: 'Thank you for your message. We will get back to you soon.',
    id: submission.id
  }
})

