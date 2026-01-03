/**
 * PUT /api/admin/faq/:id/translations
 *
 * Update or create translations for a FAQ item.
 * Uses centralized translations table with key pattern: faq.{id}.{field}
 */
import { eq, and } from 'drizzle-orm'
import { useDatabase, schema } from '../../../../database/client'

export default defineEventHandler(async event => {
  const db = useDatabase()
  const id = parseInt(event.context.params?.id || '')

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid ID' })
  }

  const body = await readBody(event)
  const { locale, question, answer } = body

  if (!locale) {
    throw createError({ statusCode: 400, message: 'Locale is required' })
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

  // Upsert question translation
  if (question !== undefined) {
    const questionKey = `faq.${id}.question`
    const existingQuestion = db
      .select()
      .from(schema.translations)
      .where(and(eq(schema.translations.key, questionKey), eq(schema.translations.locale, locale)))
      .get()

    if (existingQuestion) {
      db.update(schema.translations)
        .set({ value: question, updatedAt: new Date() })
        .where(eq(schema.translations.id, existingQuestion.id))
        .run()
    } else {
      db.insert(schema.translations)
        .values({ locale, key: questionKey, value: question })
        .run()
    }
  }

  // Upsert answer translation
  if (answer !== undefined) {
    const answerKey = `faq.${id}.answer`
    const existingAnswer = db
      .select()
      .from(schema.translations)
      .where(and(eq(schema.translations.key, answerKey), eq(schema.translations.locale, locale)))
      .get()

    if (existingAnswer) {
      db.update(schema.translations)
        .set({ value: answer, updatedAt: new Date() })
        .where(eq(schema.translations.id, existingAnswer.id))
        .run()
    } else {
      db.insert(schema.translations)
        .values({ locale, key: answerKey, value: answer })
        .run()
    }
  }

  return { success: true }
})
