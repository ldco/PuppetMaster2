/**
 * DELETE /api/admin/pricing/:id
 * Delete a pricing tier
 */
import { eq } from 'drizzle-orm'
import { useDatabase, schema } from '../../../database/client'

export default defineEventHandler(async event => {
  const db = useDatabase()
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid tier ID' })
  }

  // Check if tier exists
  const [existing] = await db
    .select()
    .from(schema.pricingTiers)
    .where(eq(schema.pricingTiers.id, id))

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Tier not found' })
  }

  // Delete tier (features cascade automatically)
  await db
    .delete(schema.pricingTiers)
    .where(eq(schema.pricingTiers.id, id))

  return { success: true }
})
