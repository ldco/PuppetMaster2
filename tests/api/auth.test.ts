/**
 * Auth API Integration Tests
 *
 * Tests for /api/auth/* endpoints using @nuxt/test-utils
 * These tests run against a real Nuxt server instance.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Auth API', async () => {
  await setup({
    server: true,
    browser: false
  })

  describe('POST /api/auth/login', () => {
    it('rejects invalid email format', async () => {
      try {
        await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            email: 'not-an-email',
            password: 'somepassword'
          }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(400)
        expect(error.data?.message).toContain('Invalid')
      }
    })

    it('rejects empty password', async () => {
      try {
        await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            email: 'test@example.com',
            password: ''
          }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(400)
      }
    })

    it('rejects non-existent user with generic message', async () => {
      try {
        await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            email: 'nonexistent@example.com',
            password: 'somepassword123'
          }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        // Should NOT reveal that user doesn't exist
        expect(error.statusCode).toBe(401)
        expect(error.data?.message).toBe('Invalid email or password')
      }
    })

    it('rejects wrong password with generic message', async () => {
      try {
        await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            email: 'master@example.com', // Default seeded user
            password: 'wrongpassword'
          }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        // Should NOT reveal that password is wrong specifically
        expect(error.statusCode).toBe(401)
        expect(error.data?.message).toBe('Invalid email or password')
      }
    })

    it('returns user data and CSRF token on successful login', async () => {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'master@example.com',
          password: 'master123' // Default seeded password
        }
      })

      expect(response.success).toBe(true)
      expect(response.user).toBeDefined()
      expect(response.user.email).toBe('master@example.com')
      expect(response.user.id).toBeDefined()
      expect(response.user.role).toBeDefined()
      expect(response.csrfToken).toBeDefined()
      // Password hash should NOT be returned
      expect(response.user.passwordHash).toBeUndefined()
    })

    it('supports rememberMe option', async () => {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'master@example.com',
          password: 'master123',
          rememberMe: true
        }
      })

      expect(response.success).toBe(true)
    })
  })

  describe('GET /api/auth/session', () => {
    it('returns null user when not authenticated', async () => {
      const response = await $fetch('/api/auth/session')

      expect(response.user).toBeNull()
      expect(response.csrfToken).toBeNull()
    })
  })

  describe('POST /api/auth/logout', () => {
    it('succeeds even when not authenticated', async () => {
      const response = await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      expect(response.success).toBe(true)
    })
  })
})
