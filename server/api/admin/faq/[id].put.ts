/**
 * PUT /api/admin/faq/:id
 *
 * Update a FAQ item.
 * Content stored in centralized translations table.
 * Supports multiple locales in one request.
 */
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase, schema } from '../../../database/client'

const updateFaqSchema = z.object({
  category: z.string().max(100).nullish(),
  order: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  translations: z.record(z.object({
    question: z.string().max(500),
    answer: z.string().max(5000)
  })).optional()
})

export default defineEventHandler(async event => {
  const db = useDatabase()
  const id = parseInt(event.context.params?.id || '')

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid ID' })
  }

  const body = await readBody(event)

  const result = updateFaqSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.flatten()
    })
  }

  // Check if FAQ item exists
  const existing = db
    .select()
    .from(schema.faqItems)
    .where(eq(schema.faqItems.id, id))
    .get()

  if (!existing) {
    throw createError({ statusCode: 404, message: 'FAQ item not found' })
  }

  const { translations, ...data } = result.data

  // Build update values
  const updateValues: Record<string, unknown> = { updatedAt: new Date().toISOString() }

  if (data.category !== undefined) updateValues.category = data.category
  if (data.order !== undefined) updateValues.order = data.order
  if (data.published !== undefined) updateValues.published = data.published

  db.update(schema.faqItems)
    .set(updateValues)
    .where(eq(schema.faqItems.id, id))
    .run()

  // Update translations in centralized table
  if (translations) {
    for (const [locale, trans] of Object.entries(translations)) {
      const questionKey = `faq.${id}.question`
      const answerKey = `faq.${id}.answer`

      // Upsert question
      const existingQuestion = db
        .select()
        .from(schema.translations)
        .where(and(eq(schema.translations.key, questionKey), eq(schema.translations.locale, locale)))
        .get()

      if (existingQuestion) {
        db.update(schema.translations)
          .set({ value: trans.question || '', updatedAt: new Date() })
          .where(eq(schema.translations.id, existingQuestion.id))
          .run()
      } else if (trans.question) {
        db.insert(schema.translations)
          .values({ locale, key: questionKey, value: trans.question })
          .run()
      }

      // Upsert answer
      const existingAnswer = db
        .select()
        .from(schema.translations)
        .where(and(eq(schema.translations.key, answerKey), eq(schema.translations.locale, locale)))
        .get()

      if (existingAnswer) {
        db.update(schema.translations)
          .set({ value: trans.answer || '', updatedAt: new Date() })
          .where(eq(schema.translations.id, existingAnswer.id))
          .run()
      } else if (trans.answer) {
        db.insert(schema.translations)
          .values({ locale, key: answerKey, value: trans.answer })
          .run()
      }
    }
  }

  return { success: true }
})
