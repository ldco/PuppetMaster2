/**
 * Structured Logging Utility (HIGH-03)
 *
 * Provides structured, JSON-formatted logging for production.
 * Falls back to console in development for readability.
 *
 * Usage:
 * import { logger } from '../utils/logger'
 * logger.info('User logged in', { userId: 123 })
 * logger.error('Database error', { error: err.message, stack: err.stack })
 *
 * Log levels (in order of severity):
 * - trace: Very detailed debugging (usually disabled)
 * - debug: Debugging information
 * - info: Normal operations
 * - warn: Warning conditions
 * - error: Error conditions
 * - fatal: Critical errors
 *
 * Note: For production, install pino for better performance:
 * npm install pino
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  time: string
  msg: string
  context?: LogContext
  service?: string
  version?: string
  environment?: string
}

// Log level priority (lower = more verbose)
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
}

// Get minimum log level from environment
function getMinLevel(): number {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel
  return LOG_LEVELS[envLevel] || LOG_LEVELS.info
}

// Check if we're in production
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Format log entry
function formatLog(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    level,
    time: new Date().toISOString(),
    msg: message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
    service: 'puppetmaster2',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
}

// Output log (JSON in production, pretty in development)
function outputLog(entry: LogEntry): void {
  const minLevel = getMinLevel()
  if (LOG_LEVELS[entry.level] < minLevel) return

  if (isProduction()) {
    // JSON output for production (parseable by log aggregators)
    const output = JSON.stringify(entry)
    if (entry.level === 'error' || entry.level === 'fatal') {
      console.error(output)
    } else {
      console.log(output)
    }
  } else {
    // Pretty output for development
    const timestamp = entry.time.split('T')[1]?.slice(0, 8) || entry.time
    const levelColors: Record<LogLevel, string> = {
      trace: '\x1b[90m', // gray
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[35m'  // magenta
    }
    const reset = '\x1b[0m'
    const color = levelColors[entry.level]
    const levelStr = entry.level.toUpperCase().padEnd(5)

    let output = `${color}[${timestamp}] ${levelStr}${reset} ${entry.msg}`
    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`
    }

    if (entry.level === 'error' || entry.level === 'fatal') {
      console.error(output)
    } else {
      console.log(output)
    }
  }
}

/**
 * Logger instance
 */
export const logger = {
  trace(message: string, context?: LogContext): void {
    outputLog(formatLog('trace', message, context))
  },

  debug(message: string, context?: LogContext): void {
    outputLog(formatLog('debug', message, context))
  },

  info(message: string, context?: LogContext): void {
    outputLog(formatLog('info', message, context))
  },

  warn(message: string, context?: LogContext): void {
    outputLog(formatLog('warn', message, context))
  },

  error(message: string, context?: LogContext): void {
    outputLog(formatLog('error', message, context))
  },

  fatal(message: string, context?: LogContext): void {
    outputLog(formatLog('fatal', message, context))
  },

  /**
   * Create a child logger with pre-set context
   */
  child(defaultContext: LogContext) {
    return {
      trace: (msg: string, ctx?: LogContext) => logger.trace(msg, { ...defaultContext, ...ctx }),
      debug: (msg: string, ctx?: LogContext) => logger.debug(msg, { ...defaultContext, ...ctx }),
      info: (msg: string, ctx?: LogContext) => logger.info(msg, { ...defaultContext, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => logger.warn(msg, { ...defaultContext, ...ctx }),
      error: (msg: string, ctx?: LogContext) => logger.error(msg, { ...defaultContext, ...ctx }),
      fatal: (msg: string, ctx?: LogContext) => logger.fatal(msg, { ...defaultContext, ...ctx })
    }
  }
}

/**
 * Request logger middleware helper
 * Creates a child logger with request context
 */
export function createRequestLogger(event: { node: { req: { method?: string; url?: string } } }) {
  return logger.child({
    method: event.node.req.method,
    url: event.node.req.url
  })
}
