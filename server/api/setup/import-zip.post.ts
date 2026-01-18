/**
 * Upload Zip for Import API
 *
 * POST /api/setup/import-zip
 * Body: FormData with 'file' field
 * Returns: { files: string[], extractionMethod: 'system' | 'node' }
 *
 * Extracts zip to ./import/ folder for brownfield migration.
 * Cross-platform: uses system unzip first, falls back to adm-zip.
 */
import { createWriteStream, existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from 'fs'
import { resolve, join } from 'path'
import AdmZip from 'adm-zip'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PM_ZIP_001: No file uploaded',
      message: 'No file uploaded. Please select a ZIP file to import.'
    })
  }

  const file = formData.find(f => f.name === 'file')
  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PM_ZIP_002: No file data found',
      message: 'No file data found. Please try uploading again.'
    })
  }

  if (!file.filename?.endsWith('.zip')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PM_ZIP_003: Invalid file type',
      message: 'Only .zip files are allowed. Please compress your project as a ZIP file.'
    })
  }

  const importDir = resolve(process.cwd(), 'import')
  const tempZipPath = resolve(process.cwd(), 'data', 'temp-import.zip')
  let extractionMethod: 'system' | 'node' = 'system'

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

    // Try system unzip first (faster for large files)
    let extracted = false

    try {
      const { execSync } = await import('child_process')
      execSync(`unzip -o "${tempZipPath}" -d "${importDir}"`, {
        stdio: 'pipe'
      })
      extracted = true
      extractionMethod = 'system'
    } catch {
      // System unzip not available, fall back to adm-zip
    }

    // Fallback to Node.js-based extraction
    if (!extracted) {
      try {
        const zip = new AdmZip(tempZipPath)
        zip.extractAllTo(importDir, true)
        extracted = true
        extractionMethod = 'node'
      } catch (e: any) {
        throw createError({
          statusCode: 500,
          statusMessage: 'PM_ZIP_004: Extraction failed',
          message: `Failed to extract ZIP file: ${e.message}. The file may be corrupted or use unsupported compression.`
        })
      }
    }

    // Clean up temp file
    if (existsSync(tempZipPath)) {
      unlinkSync(tempZipPath)
    }

    // Get list of extracted files
    const files = getFilesRecursive(importDir)

    return {
      success: true,
      files: files.map(f => f.replace(importDir + '/', '')),
      extractionMethod,
      fileCount: files.length
    }
  } catch (e: any) {
    // Clean up on error
    if (existsSync(tempZipPath)) {
      try { unlinkSync(tempZipPath) } catch {}
    }

    // Re-throw createError instances
    if (e.statusCode) {
      throw e
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'PM_ZIP_005: Processing failed',
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
