/**
 * POST /api/admin/faq
 *
 * Create a new FAQ item.
 * Content stored in centralized translations table.
 * Supports multiple locales in one request.
 */
import { z } from 'zod'
import { useDatabase, schema } from '../../../database/client'

const createFaqSchema = z.object({
  category: z.string().max(100).nullish(),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
  translations: z.record(z.object({
    question: z.string().max(500),
    answer: z.string().max(5000)
  })).optional()
})

export default defineEventHandler(async event => {
  const db = useDatabase()
  const body = await readBody(event)

  const result = createFaqSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.flatten()
    })
  }

  const { translations, ...data } = result.data

  // Insert FAQ item metadata only
  const insertResult = db
    .insert(schema.faqItems)
    .values({
      category: data.category || null,
      order: data.order,
      published: data.published
    })
    .run()

  const faqId = Number(insertResult.lastInsertRowid)

  // Store translations in centralized table
  if (translations) {
    const translationValues = []

    for (const [locale, trans] of Object.entries(translations)) {
      if (trans.question) {
        translationValues.push({
          locale,
          key: `faq.${faqId}.question`,
          value: trans.question
        })
      }

      if (trans.answer) {
        translationValues.push({
          locale,
          key: `faq.${faqId}.answer`,
          value: trans.answer
        })
      }
    }

    if (translationValues.length > 0) {
      db.insert(schema.translations)
        .values(translationValues)
        .run()
    }
  }

  return { success: true, id: faqId }
})
