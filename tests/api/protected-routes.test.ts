/**
 * Protected Routes API Tests
 *
 * Tests that protected routes properly enforce authentication.
 */
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Protected Routes', async () => {
  await setup({
    server: true,
    browser: false
  })

  describe('Admin Routes (require authentication)', () => {
    it('GET /api/admin/stats rejects unauthenticated requests', async () => {
      try {
        await $fetch('/api/admin/stats')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('GET /api/admin/users rejects unauthenticated requests', async () => {
      try {
        await $fetch('/api/admin/users')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('GET /api/admin/contacts rejects unauthenticated requests', async () => {
      try {
        await $fetch('/api/admin/contacts')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('PUT /api/admin/settings rejects unauthenticated requests', async () => {
      try {
        await $fetch('/api/admin/settings', {
          method: 'PUT',
          body: { siteName: 'Test' }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('GET /api/admin/health rejects unauthenticated requests', async () => {
      try {
        await $fetch('/api/admin/health')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })

    it('GET /api/admin/audit-logs rejects unauthenticated requests', async () => {
      try {
        await $fetch('/api/admin/audit-logs')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })
  })

  describe('User Routes (require authentication)', () => {
    it('PUT /api/user/change-password rejects unauthenticated requests', async () => {
      try {
        await $fetch('/api/user/change-password', {
          method: 'PUT',
          body: {
            currentPassword: 'test',
            newPassword: 'newpassword123'
          }
        })
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.statusCode).toBe(401)
      }
    })
  })

  describe('Public Routes (no authentication required)', () => {
    it('GET /api/health returns success', async () => {
      const response = await $fetch('/api/health')

      expect(response.status).toBe('healthy')
      expect(response.timestamp).toBeDefined()
    })

    it('GET /api/settings returns public settings', async () => {
      const response = await $fetch('/api/settings')

      expect(response).toBeDefined()
      // Settings should be returned (public endpoint)
    })

    it('GET /api/portfolio returns portfolio items', async () => {
      const response = await $fetch('/api/portfolio')

      expect(Array.isArray(response)).toBe(true)
    })
  })
})
