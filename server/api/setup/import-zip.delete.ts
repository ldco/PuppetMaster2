/**
 * Delete Import Files API
 *
 * DELETE /api/setup/import-zip
 * Returns: { success: true }
 *
 * Clears the ./import/ folder
 */
import { existsSync, rmSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(async () => {
  const importDir = resolve(process.cwd(), 'import')

  if (existsSync(importDir)) {
    rmSync(importDir, { recursive: true, force: true })
  }

  return { success: true }
})
