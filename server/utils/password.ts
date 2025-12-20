/**
 * Password Utilities
 *
 * Secure password hashing using Node.js native scrypt.
 * No external dependencies required.
 */
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

const SALT_LENGTH = 16
const KEY_LENGTH = 64

/**
 * Hash a password using scrypt
 * Returns format: salt:hash (both hex encoded)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a password against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':')
    if (!salt || !hash) return false

    const hashBuffer = Buffer.from(hash, 'hex')
    const suppliedHashBuffer = scryptSync(password, salt, KEY_LENGTH)

    return timingSafeEqual(hashBuffer, suppliedHashBuffer)
  } catch {
    return false
  }
}

/**
 * Generate a secure random session ID
 */
export function generateSessionId(): string {
  return randomBytes(32).toString('hex')
}
