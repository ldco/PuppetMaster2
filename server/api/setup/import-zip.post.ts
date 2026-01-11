/**
 * Upload Zip for Import API
 *
 * POST /api/setup/import-zip
 * Body: FormData with 'file' field
 * Returns: { files: string[] }
 *
 * Extracts zip to ./import/ folder for brownfield migration
 */
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from 'fs'
import { resolve, join } from 'path'
import { createGunzip } from 'zlib'
import { pipeline } from 'stream/promises'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No file uploaded'
    })
  }

  const file = formData.find(f => f.name === 'file')
  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      message: 'No file data found'
    })
  }

  if (!file.filename?.endsWith('.zip')) {
    throw createError({
      statusCode: 400,
      message: 'Only .zip files are allowed'
    })
  }

  const importDir = resolve(process.cwd(), 'import')
  const tempZipPath = resolve(process.cwd(), 'data', 'temp-import.zip')

  try {
    // Ensure data directory exists
    const dataDir = resolve(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }

    // Clear existing import folder
    if (existsSync(importDir)) {
      rmSync(importDir, { recursive: true, force: true })
    }
    mkdirSync(importDir, { recursive: true })

    // Write zip to temp file
    const writeStream = createWriteStream(tempZipPath)
    writeStream.write(file.data)
    writeStream.end()

    // Wait for write to complete
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // Extract zip using unzip command (cross-platform alternative to native Node.js)
    const { execSync } = await import('child_process')

    try {
      execSync(`unzip -o "${tempZipPath}" -d "${importDir}"`, {
        stdio: 'pipe'
      })
    } catch {
      // Try with node-based extraction if unzip not available
      throw createError({
        statusCode: 500,
        message: 'Failed to extract zip. Please ensure unzip is installed on the server.'
      })
    }

    // Clean up temp file
    if (existsSync(tempZipPath)) {
      unlinkSync(tempZipPath)
    }

    // Get list of extracted files
    const files = getFilesRecursive(importDir)

    return {
      success: true,
      files: files.map(f => f.replace(importDir + '/', ''))
    }
  } catch (e: any) {
    // Clean up on error
    if (existsSync(tempZipPath)) {
      try { unlinkSync(tempZipPath) } catch {}
    }

    throw createError({
      statusCode: 500,
      message: e.message || 'Failed to process zip file'
    })
  }
})

// Recursively get all files in a directory
function getFilesRecursive(dir: string): string[] {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip hidden directories and node_modules
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...getFilesRecursive(fullPath))
      }
    } else {
      // Skip hidden files
      if (!entry.name.startsWith('.')) {
        files.push(fullPath)
      }
    }
  }

  return files
}
