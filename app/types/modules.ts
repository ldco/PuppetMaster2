/**
 * PuppetMaster Module System
 *
 * Pre-built, config-driven features that can be enabled per-project.
 * Each module provides: database tables, API endpoints, admin UI, and frontend pages.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Available module IDs
 */
export type ModuleId = 'portfolio' | 'pricing' | 'contact' | 'blog' | 'team' | 'testimonials'

/**
 * Module definition - describes what a module provides
 * Using 'unknown' for defaultConfig to allow specific types in registry
 */
export interface ModuleDefinition {
  id: ModuleId
  name: string
  description: string
  version: string

  /** Database tables this module requires */
  tables: string[]

  /** Admin sections this module adds */
  adminSections: Array<{
    id: string
    icon: string
    label: string
    roles: string[]
  }>

  /** Frontend routes this module adds */
  routes: string[]

  /** Default configuration */
  defaultConfig: unknown

  /** Whether this module is currently implemented */
  implemented: boolean
}

/**
 * Module configuration in puppet-master.config.ts
 */
export interface ModuleConfig<TConfig> {
  enabled: boolean
  config: Partial<TConfig>
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO MODULE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export interface PortfolioModuleConfig {
  /** Display layout */
  layout: 'grid' | 'masonry' | 'list' | 'carousel'
  /** Card visual style */
  cardStyle: 'minimal' | 'detailed' | 'overlay' | 'split'
  /** Show filter buttons by category/technology */
  showFilters: boolean
  /** Enable case study pages */
  showCaseStudies: boolean
  /** Enable image galleries */
  showGallery: boolean
  /** Items per page */
  itemsPerPage: number
  /** Default sort order */
  sortDefault: 'date' | 'title' | 'featured' | 'order'
  /** Show categories */
  showCategories: boolean
  /** Show technologies/tags */
  showTechnologies: boolean
}

export const portfolioModuleDefaults: PortfolioModuleConfig = {
  layout: 'grid',
  cardStyle: 'overlay',
  showFilters: true,
  showCaseStudies: true,
  showGallery: true,
  itemsPerPage: 12,
  sortDefault: 'order',
  showCategories: true,
  showTechnologies: true
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING MODULE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export interface PricingTier {
  id: string
  name: string
  description?: string
  price: number | null // null = "Contact us"
  period?: 'month' | 'year' | 'one-time'
  currency?: string
  featured?: boolean
  features: Array<{
    text: string
    included: boolean
    tooltip?: string
  }>
  cta?: {
    text: string
    url: string
  }
}

export interface PricingModuleConfig {
  /** Pricing tiers */
  tiers: PricingTier[]
  /** Show feature comparison table */
  showComparison: boolean
  /** Show monthly/yearly toggle */
  showToggle: boolean
  /** Yearly discount percentage */
  yearlyDiscount: number
  /** Default currency */
  currency: string
  /** Display style */
  style: 'cards' | 'table' | 'mixed'
  /** CTA button style */
  ctaStyle: 'button' | 'link'
  /** Highlight featured tier */
  highlightFeatured: boolean
  /** Show FAQ section */
  showFAQ: boolean
}

export const pricingModuleDefaults: PricingModuleConfig = {
  tiers: [],
  showComparison: true,
  showToggle: true,
  yearlyDiscount: 20,
  currency: 'USD',
  style: 'cards',
  ctaStyle: 'button',
  highlightFeatured: true,
  showFAQ: false
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT MODULE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContactModuleConfig {
  /** Show map */
  showMap: boolean
  /** Map provider */
  mapProvider: 'yandex' | 'google' | 'osm'
  /** Show contact form */
  showForm: boolean
  /** Show contact info (address, phone, email) */
  showInfo: boolean
  /** Custom form fields */
  formFields: Array<{
    name: string
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
    label: string
    required: boolean
    options?: string[] // for select type
  }>
  /** Notification methods */
  notifications: 'email' | 'telegram' | 'both' | 'none'
  /** Show social links */
  showSocial: boolean
}

export const contactModuleDefaults: ContactModuleConfig = {
  showMap: false,
  mapProvider: 'yandex',
  showForm: true,
  showInfo: true,
  formFields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'message', type: 'textarea', label: 'Message', required: true }
  ],
  notifications: 'email',
  showSocial: true
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG MODULE CONFIG (Future)
// ═══════════════════════════════════════════════════════════════════════════════

export interface BlogModuleConfig {
  /** Posts per page */
  postsPerPage: number
  /** Show categories */
  showCategories: boolean
  /** Show tags */
  showTags: boolean
  /** Show author info */
  showAuthor: boolean
  /** Enable comments */
  showComments: boolean
  /** Comment system */
  commentSystem: 'native' | 'disqus' | 'none'
  /** Show reading time */
  showReadingTime: boolean
  /** Show table of contents */
  showToc: boolean
}

export const blogModuleDefaults: BlogModuleConfig = {
  postsPerPage: 10,
  showCategories: true,
  showTags: true,
  showAuthor: true,
  showComments: false,
  commentSystem: 'none',
  showReadingTime: true,
  showToc: true
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM MODULE CONFIG (Future)
// ═══════════════════════════════════════════════════════════════════════════════

export interface TeamModuleConfig {
  /** Display layout */
  layout: 'grid' | 'list' | 'cards'
  /** Show social links */
  showSocial: boolean
  /** Show bio */
  showBio: boolean
  /** Group by department */
  groupByDepartment: boolean
  /** Show role/position */
  showRole: boolean
  /** Card style */
  cardStyle: 'minimal' | 'detailed' | 'avatar-only'
}

export const teamModuleDefaults: TeamModuleConfig = {
  layout: 'grid',
  showSocial: true,
  showBio: true,
  groupByDepartment: false,
  showRole: true,
  cardStyle: 'detailed'
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS MODULE CONFIG (Future)
// ═══════════════════════════════════════════════════════════════════════════════

export interface TestimonialsModuleConfig {
  /** Display layout */
  layout: 'carousel' | 'grid' | 'masonry' | 'list'
  /** Show star rating */
  showRating: boolean
  /** Show avatar */
  showAvatar: boolean
  /** Show company/org */
  showCompany: boolean
  /** Auto-play carousel */
  autoPlay: boolean
  /** Items per view (for carousel) */
  itemsPerView: number
}

export const testimonialsModuleDefaults: TestimonialsModuleConfig = {
  layout: 'carousel',
  showRating: true,
  showAvatar: true,
  showCompany: true,
  autoPlay: true,
  itemsPerView: 3
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registry of all available modules with their definitions
 */
export const MODULE_REGISTRY: Record<ModuleId, ModuleDefinition> = {
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Project showcase with galleries and case studies',
    version: '1.0.0',
    tables: ['portfolios', 'portfolioImages', 'caseStudies'],
    adminSections: [
      { id: 'portfolios', icon: 'photo', label: 'portfolio', roles: [] }
    ],
    routes: ['/portfolio', '/portfolio/[slug]'],
    defaultConfig: portfolioModuleDefaults,
    implemented: true
  },

  pricing: {
    id: 'pricing',
    name: 'Pricing',
    description: 'Pricing tiers with comparison table',
    version: '1.0.0',
    tables: [], // Config-driven, no database tables
    adminSections: [], // Managed via config
    routes: ['/pricing'],
    defaultConfig: pricingModuleDefaults,
    implemented: true
  },

  contact: {
    id: 'contact',
    name: 'Contact',
    description: 'Contact form, map, and info display',
    version: '1.0.0',
    tables: ['contacts'],
    adminSections: [
      { id: 'contacts', icon: 'mail', label: 'contacts', roles: [] }
    ],
    routes: ['/contact'],
    defaultConfig: contactModuleDefaults,
    implemented: true
  },

  blog: {
    id: 'blog',
    name: 'Blog',
    description: 'Blog posts with categories and tags',
    version: '0.1.0',
    tables: ['posts', 'postCategories', 'postTags'],
    adminSections: [
      { id: 'blog', icon: 'article', label: 'blog', roles: [] }
    ],
    routes: ['/blog', '/blog/[slug]', '/blog/category/[category]'],
    defaultConfig: blogModuleDefaults,
    implemented: false
  },

  team: {
    id: 'team',
    name: 'Team',
    description: 'Team member profiles',
    version: '0.1.0',
    tables: ['teamMembers', 'departments'],
    adminSections: [
      { id: 'team', icon: 'users-group', label: 'team', roles: [] }
    ],
    routes: ['/team', '/team/[slug]'],
    defaultConfig: teamModuleDefaults,
    implemented: false
  },

  testimonials: {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer testimonials and reviews',
    version: '0.1.0',
    tables: ['testimonials'],
    adminSections: [
      { id: 'testimonials', icon: 'quote', label: 'testimonials', roles: [] }
    ],
    routes: [],
    defaultConfig: testimonialsModuleDefaults,
    implemented: false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map of module IDs to their config types
 */
export interface ModuleConfigMap {
  portfolio: PortfolioModuleConfig
  pricing: PricingModuleConfig
  contact: ContactModuleConfig
  blog: BlogModuleConfig
  team: TeamModuleConfig
  testimonials: TestimonialsModuleConfig
}

/**
 * Full modules configuration object for puppet-master.config.ts
 */
export type ModulesConfig = {
  [K in ModuleId]?: ModuleConfig<ModuleConfigMap[K]>
}

/**
 * Get default config for a module (type-safe)
 */
export function getModuleDefaults<T extends ModuleId>(
  moduleId: T
): ModuleConfigMap[T] {
  // Cast is safe because MODULE_REGISTRY is defined with correct types
  return MODULE_REGISTRY[moduleId].defaultConfig as ModuleConfigMap[T]
}

/**
 * Get module definition
 */
export function getModuleDefinition(moduleId: ModuleId): ModuleDefinition {
  return MODULE_REGISTRY[moduleId]
}

/**
 * Check if a module is implemented
 */
export function isModuleImplemented(moduleId: ModuleId): boolean {
  return MODULE_REGISTRY[moduleId].implemented
}

/**
 * Get all implemented modules
 */
export function getImplementedModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.implemented)
}
