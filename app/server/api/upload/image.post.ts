/**
 * POST /api/upload/image
 *
 * Uploads and processes an image using Sharp.
 * - Resizes to max 1920x1080 (preserving aspect ratio)
 * - Converts to WebP format
 * - Generates thumbnail (400x300)
 *
 * Requires admin authentication.
 * Returns URLs for the processed image and thumbnail.
 */
import sharp from 'sharp'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default defineEventHandler(async (event) => {
  // Check authentication
  const session = event.context.session
  if (!session?.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No form data provided'
    })
  }

  // Find the image file
  const file = formData.find(f => f.name === 'image')
  if (!file?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No image provided'
    })
  }

  // Validate file type
  const mimeType = file.type || ''
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`
    })
  }

  // Validate file size
  if (file.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    })
  }

  // Generate unique ID for the file
  const id = randomUUID()
  const uploadDir = './public/uploads'

  // Ensure upload directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  try {
    // Process main image: resize + convert to WebP
    const mainImage = await sharp(file.data)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toBuffer()

    // Generate thumbnail
    const thumbnail = await sharp(file.data)
      .resize(400, 300, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 75 })
      .toBuffer()

    // Save files
    await writeFile(`${uploadDir}/${id}.webp`, mainImage)
    await writeFile(`${uploadDir}/${id}-thumb.webp`, thumbnail)

    // Get image metadata
    const metadata = await sharp(file.data).metadata()

    return {
      success: true,
      id,
      url: `/uploads/${id}.webp`,
      thumbnailUrl: `/uploads/${id}-thumb.webp`,
      originalName: file.filename,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    }
  } catch (error) {
    console.error('Image processing error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process image'
    })
  }
})

