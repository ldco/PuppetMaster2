/**
 * Global Error Handlers Plugin
 *
 * Catches unhandled promise rejections and uncaught exceptions
 * to prevent silent failures and ensure proper logging.
 */
import { logger } from '../utils/logger'

export default defineNitroPlugin(() => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, _promise) => {
    logger.error(
      {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined
      },
      'Unhandled promise rejection'
    )
  })

  // Handle uncaught exceptions (non-fatal logging only)
  process.on('uncaughtException', (error) => {
    logger.error(
      {
        error: error.message,
        stack: error.stack
      },
      'Uncaught exception'
    )
    // Don't exit process - let Nitro handle it
  })

  logger.info('Global error handlers registered')
})
