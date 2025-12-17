/**
 * POST /api/contact/submit
 *
 * Submits a contact form.
 * Public endpoint with rate limiting and validation.
 *
 * Side effects:
 * - Saves to database
 * - Sends confirmation email to user (if SMTP configured)
 * - Sends Telegram notification to admin (if bot configured)
 */
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase, schema } from '../../database/client'
import { sendContactConfirmation } from '../../utils/email'
import { notifyNewContact } from '../../utils/telegram'
import { contactRateLimiter } from '../../utils/rateLimit'
import config from '~~/app/puppet-master.config'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000)
})

export default defineEventHandler(async (event) => {
  // Get client IP for rate limiting
  const ip = getHeader(event, 'x-forwarded-for') ||
             getHeader(event, 'x-real-ip') ||
             'unknown'

  // Check rate limit
  if (!contactRateLimiter.checkRateLimit(ip)) {
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

  // Send notifications (don't await - fire and forget, don't block response)
  // Only if enabled in config

  // Email confirmation to user
  if (config.features.contactEmailConfirmation) {
    // Get site name from settings for email (legal.companyName → seo.title → fallback)
    const companyNameSetting = db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, 'legal.companyName'))
      .get()
    const seoTitleSetting = db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, 'seo.title'))
      .get()
    const siteName = companyNameSetting?.value || seoTitleSetting?.value || 'Puppet Master'

    sendContactConfirmation(data.email, data.name, siteName).catch((e) => {
      console.error('[Contact] Email notification failed:', e)
    })
  }

  // Telegram notification to admin
  if (config.features.contactTelegramNotify) {
    notifyNewContact({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message
    }).catch((e) => {
      console.error('[Contact] Telegram notification failed:', e)
    })
  }

  return {
    success: true,
    message: 'Thank you for your message. We will get back to you soon.',
    id: submission.id
  }
})

