/**
 * S3 Storage Adapter
 *
 * Stores files in S3-compatible bucket (AWS S3, Cloudflare R2, MinIO).
 * For production sites with CDN needs or large media libraries.
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import type { StorageAdapter, UploadResult, UploadOptions, ImageProcessingOptions, VideoProcessingOptions } from './types'

export class S3Storage implements StorageAdapter {
  private client: S3Client
  private bucket: string
  private publicUrl: string
  private imageOptions: ImageProcessingOptions
  private videoOptions: VideoProcessingOptions

  constructor(imageOptions: ImageProcessingOptions, videoOptions: VideoProcessingOptions) {
    this.imageOptions = imageOptions
    this.videoOptions = videoOptions

    // Initialize S3 client from environment variables
    const endpoint = process.env.S3_ENDPOINT
    const accessKeyId = process.env.S3_ACCESS_KEY
    const secretAccessKey = process.env.S3_SECRET_KEY
    const region = process.env.S3_REGION || 'auto'

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 credentials not configured. Set S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY in .env')
    }

    this.bucket = process.env.S3_BUCKET || 'uploads'
    this.publicUrl = process.env.S3_PUBLIC_URL || endpoint

    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      forcePathStyle: true // Required for MinIO and some S3-compatible services
    })
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const id = randomUUID()

    if (options.type === 'image') {
      return this.uploadImage(buffer, id, options)
    } else {
      return this.uploadVideo(buffer, id, options)
    }
  }

  private async uploadImage(buffer: Buffer, id: string, options: UploadOptions): Promise<UploadResult> {
    const { maxWidth, maxHeight, quality, thumbnailWidth, thumbnailHeight, thumbnailQuality } = this.imageOptions

    // Get original metadata
    const metadata = await sharp(buffer).metadata()

    // Process main image
    const mainImage = await sharp(buffer)
      .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()

    // Generate thumbnail
    const thumbnail = await sharp(buffer)
      .resize(thumbnailWidth, thumbnailHeight, { fit: 'cover', position: 'center' })
      .webp({ quality: thumbnailQuality })
      .toBuffer()

    // Upload to S3
    await Promise.all([
      this.putObject(`${id}.webp`, mainImage, 'image/webp'),
      this.putObject(`${id}-thumb.webp`, thumbnail, 'image/webp')
    ])

    return {
      id,
      url: `${this.publicUrl}/${id}.webp`,
      thumbnailUrl: `${this.publicUrl}/${id}-thumb.webp`,
      originalName: options.originalName,
      size: mainImage.length,
      mimeType: 'image/webp',
      width: metadata.width,
      height: metadata.height
    }
  }

  private async uploadVideo(buffer: Buffer, id: string, options: UploadOptions): Promise<UploadResult> {
    const ext = this.videoOptions.outputFormat
    const key = `${id}.${ext}`
    const contentType = ext === 'mp4' ? 'video/mp4' : 'video/webm'

    await this.putObject(key, buffer, contentType)

    return {
      id,
      url: `${this.publicUrl}/${key}`,
      originalName: options.originalName,
      size: buffer.length,
      mimeType: contentType
    }
  }

  private async putObject(key: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    }))
  }

  async delete(id: string): Promise<void> {
    const keys = [
      `${id}.webp`,
      `${id}-thumb.webp`,
      `${id}.mp4`,
      `${id}.webm`,
      `${id}-thumb.jpg`
    ]

    await Promise.all(
      keys.map(key =>
        this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
          .catch(() => { /* Ignore if file doesn't exist */ })
      )
    )
  }

  getUrl(id: string, variant: 'original' | 'thumbnail' = 'original'): string {
    const suffix = variant === 'thumbnail' ? '-thumb' : ''
    return `${this.publicUrl}/${id}${suffix}.webp`
  }
}

