/**
 * Database Schema
 *
 * SQLite schema using Drizzle ORM.
 * Tables: users, sessions, settings, portfolios, portfolio_items, contact_submissions, translations, audit_logs
 */
import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core'

// ═══════════════════════════════════════════════════════════════════════════
// USERS & AUTH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * User roles hierarchy:
 * - master: Developer/agency who builds the site (full access)
 * - admin: Client who owns the site (can manage content + users except master)
 * - editor: Client's employees (can only edit content)
 */
export const USER_ROLES = ['master', 'admin', 'editor'] as const
export type UserRole = (typeof USER_ROLES)[number]

/**
 * Admin users
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role', { enum: ['master', 'admin', 'editor'] })
    .default('editor')
    .notNull(),
  // Account lockout fields (CRIT-04)
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: integer('locked_until', { mode: 'timestamp' }),
  lastFailedLogin: integer('last_failed_login', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * User sessions for authentication
 */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // UUID
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ═══════════════════════════════════════════════════════════════════════════
// SITE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Key-value settings store (editable via admin)
 */
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  type: text('type', { enum: ['string', 'number', 'boolean', 'json'] })
    .default('string')
    .notNull(),
  group: text('group').default('general'), // For organizing in admin UI
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Portfolio types:
 * - gallery: Collection of images, videos, and external links
 * - case_study: Collection of detailed project case studies
 */
export const PORTFOLIO_TYPES = ['gallery', 'case_study'] as const
export type PortfolioType = (typeof PORTFOLIO_TYPES)[number]

/**
 * Portfolio item types:
 * - image: Uploaded image file
 * - video: Uploaded video file
 * - link: External URL (e.g., Behance, Dribbble)
 * - case_study: Rich content project with full details
 */
export const PORTFOLIO_ITEM_TYPES = ['image', 'video', 'link', 'case_study'] as const
export type PortfolioItemType = (typeof PORTFOLIO_ITEM_TYPES)[number]

/**
 * Portfolios - Collections of portfolio items
 */
export const portfolios = sqliteTable('portfolios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['gallery', 'case_study'] }).notNull(),
  coverImageUrl: text('cover_image_url'),
  coverThumbnailUrl: text('cover_thumbnail_url'),
  order: integer('order').default(0),
  published: integer('published', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * Portfolio items - Individual items within a portfolio
 * Uses discriminated union pattern: itemType determines which fields are used
 */
export const portfolioItems = sqliteTable('portfolio_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  portfolioId: integer('portfolio_id')
    .notNull()
    .references(() => portfolios.id, { onDelete: 'cascade' }),
  itemType: text('item_type', { enum: ['image', 'video', 'link', 'case_study'] }).notNull(),

  // Common fields
  order: integer('order').default(0),
  published: integer('published', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),

  // Media fields (for gallery items: image, video, link)
  mediaUrl: text('media_url'), // Image/video URL or external link
  thumbnailUrl: text('thumbnail_url'), // Thumbnail for image/video
  caption: text('caption'), // Brief caption for gallery items

  // Case study fields (for case_study items)
  slug: text('slug'), // Unique within portfolio
  title: text('title'), // Case study title
  description: text('description'), // Short description
  content: text('content'), // Rich text / markdown
  tags: text('tags'), // JSON array stored as text
  category: text('category'), // Category label
  publishedAt: integer('published_at', { mode: 'timestamp' })
})

/**
 * Contact form submissions
 */
export const contactSubmissions = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject'),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ═══════════════════════════════════════════════════════════════════════════
// TRANSLATIONS (Database-driven i18n)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Translation strings by locale
 */
export const translations = sqliteTable(
  'translations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    locale: text('locale').notNull(), // 'en', 'ru', 'he'
    key: text('key').notNull(), // 'nav.home', 'common.submit'
    value: text('value').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
  },
  table => [unique().on(table.locale, table.key)]
)

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGGING (HIGH-04)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Audit actions for security-relevant events
 */
export const AUDIT_ACTIONS = [
  'login',
  'login_failed',
  'logout',
  'password_change',
  'role_change',
  'user_create',
  'user_update',
  'user_delete',
  'account_locked',
  'account_unlocked',
  'session_expired'
] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]

/**
 * Audit log for security-relevant events
 */
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  action: text('action').notNull(), // AuditAction
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }), // Actor (null for system)
  targetUserId: integer('target_user_id').references(() => users.id, { onDelete: 'set null' }), // Affected user
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  details: text('details'), // JSON with additional context
  success: integer('success', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Setting = typeof settings.$inferSelect
export type NewSetting = typeof settings.$inferInsert
export type Portfolio = typeof portfolios.$inferSelect
export type NewPortfolio = typeof portfolios.$inferInsert
export type PortfolioItem = typeof portfolioItems.$inferSelect
export type NewPortfolioItem = typeof portfolioItems.$inferInsert
export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type NewContactSubmission = typeof contactSubmissions.$inferInsert
export type Translation = typeof translations.$inferSelect
export type NewTranslation = typeof translations.$inferInsert
