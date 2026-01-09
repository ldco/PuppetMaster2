/**
 * Shared TypeScript Types
 *
 * Central location for all shared types.
 * Import from '~/types' or '@/types'
 */

// Auth types
export type { UserRole, User, LoginCredentials } from './auth'

// UI types
export type { ToastType, Toast, ToastOptions } from './toast'
export type { ConfirmOptions, ConfirmState } from './confirm'

// Data types
export type { SiteSettings } from './settings'

// Content types
export {
  PORTFOLIO_TYPES,
  PORTFOLIO_ITEM_TYPES
} from './content'
export type {
  DateLike,
  PortfolioType,
  PortfolioItemType,
  Portfolio,
  PortfolioItem,
  PortfolioWithItems,
  ContactSubmission
} from './content'

// Admin types
export type {
  Translation,
  TranslationsData,
  HealthStatus,
  CheckStatus,
  HealthCheck,
  HealthData,
  LogEntry,
  AuditLogEntry
} from './admin'

// Config types (modular entity architecture)
export {
  ROLE_HIERARCHY,
  canAccess,
  defaultSystemModules,
  defaultWebsiteModules,
  defaultAdminConfig,
  getAdminSections,
  filterSectionsByRole
} from './config'
export type {
  EntitiesConfig,
  AdminModuleConfig,
  SystemModulesConfig,
  WebsiteModulesConfig,
  AppModulesConfig,
  AdminConfig,
  AdminSection
} from './config'
