/**
 * POST /api/upload/image
 *
 * Uploads and processes an image using Sharp.
 * Uses storage adapter (local or S3) based on config.
 *
 * Security:
 * - Validates file content by magic bytes (not just MIME type)
 * - Requires admin authentication
 *
 * Returns URLs for the processed image and thumbnail.
 */
import config from '../../../app/puppet-master.config'
import { useFileStorage } from '../../utils/storage'
import { validateImageFile } from '../../utils/fileValidation'

export default defineEventHandler(async event => {
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

  // Validate file size first (before expensive validation)
  const maxSize = config.storage.image.maxSizeMB * 1024 * 1024
  if (file.data.length > maxSize) {
    throw createError({
      statusCode: 400,
      statusMessage: `File too large. Maximum size: ${config.storage.image.maxSizeMB}MB`
    })
  }

  // Validate file by magic bytes (not just client-provided MIME type)
  const validation = validateImageFile(file.data)
  if (!validation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error || 'Invalid file type'
    })
  }

  // Use detected MIME type (from magic bytes) instead of client-provided
  const mimeType = validation.detectedMime!

  try {
    const storage = useFileStorage()
    const result = await storage.upload(file.data, {
      type: 'image',
      originalName: file.filename,
      mimeType
    })

    return {
      success: true,
      ...result
    }
  } catch (error) {
    console.error('Image upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process image'
    })
  }
})
