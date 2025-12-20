/**
 * Environment Variable Validation (HIGH-08)
 *
 * Validates required environment variables at startup.
 * Fails fast if critical variables are missing.
 *
 * Usage:
 * import { validateEnv, env } from '../utils/env'
 * validateEnv() // Call once at startup
 * console.log(env.DATABASE_URL) // Type-safe access
 */
import { z } from 'zod'
import { logger } from './logger'

// Define environment variable schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server
  HOST: z.string().default('0.0.0.0'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),

  // Database
  DATABASE_URL: z.string().min(1).default('/app/data/sqlite.db'),

  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Telegram (optional)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  // External API (optional)
  API_BASE_URL: z.string().url().optional(),
  API_CLIENT_ID: z.string().optional(),
  API_CLIENT_SECRET: z.string().optional()
})

// Parsed environment type
export type Env = z.infer<typeof envSchema>

// Validated environment (populated after validation)
let _env: Env | null = null

/**
 * Get validated environment variables
 * Throws if validateEnv() hasn't been called
 */
export function getEnv(): Env {
  if (!_env) {
    // Auto-validate on first access
    validateEnv()
  }
  return _env!
}

/**
 * Validate environment variables at startup
 * Call this early in application initialization
 */
export function validateEnv(): void {
  if (_env) return // Already validated

  try {
    _env = envSchema.parse(process.env)

    logger.info('Environment validated', {
      nodeEnv: _env.NODE_ENV,
      hasSmtp: !!_env.SMTP_HOST,
      hasTelegram: !!_env.TELEGRAM_BOT_TOKEN,
      hasExternalApi: !!_env.API_BASE_URL
    })

    // Warn about missing optional but recommended variables
    if (_env.NODE_ENV === 'production') {
      const warnings: string[] = []

      if (!_env.SMTP_HOST) {
        warnings.push('SMTP not configured - email notifications disabled')
      }
      if (!_env.TELEGRAM_BOT_TOKEN) {
        warnings.push('Telegram not configured - admin notifications disabled')
      }

      warnings.forEach(w => logger.warn(w))
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
      logger.fatal('Environment validation failed', { issues })

      // In production, exit immediately
      if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: Environment validation failed:')
        issues.forEach(i => console.error(`  - ${i}`))
        process.exit(1)
      }

      throw new Error(`Environment validation failed: ${issues.join(', ')}`)
    }
    throw error
  }
}

/**
 * Check if a feature is enabled based on environment
 */
export const features = {
  get email(): boolean {
    const e = getEnv()
    return !!(e.SMTP_HOST && e.SMTP_USER && e.SMTP_PASS && e.SMTP_FROM)
  },

  get telegram(): boolean {
    const e = getEnv()
    return !!(e.TELEGRAM_BOT_TOKEN && e.TELEGRAM_CHAT_ID)
  },

  get externalApi(): boolean {
    const e = getEnv()
    return !!(e.API_BASE_URL && e.API_CLIENT_ID && e.API_CLIENT_SECRET)
  }
}

/**
 * Convenience export for direct env access
 * Usage: import { env } from '../utils/env'
 */
export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env]
  }
})
