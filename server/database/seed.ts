/**
 * Database Seed Script
 *
 * Creates initial admin user, default settings, and translations.
 * Run with: npm run db:seed
 *
 * IMPORTANT: Settings are defined in puppet-master.config.ts
 * IMPORTANT: Translations are stored in database:
 *            - System translations: seeded from i18n/system-seed.json, editable by master
 *            - Content translations: seeded from i18n/content.ts, editable by admin+
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { scryptSync, randomBytes } from 'crypto'
import * as schema from './schema'
import { mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { getContentSeedData } from '../../i18n/content'
import config from '../../app/puppet-master.config'

// Load system translations from JSON seed file
function getSystemSeedData(): Array<{ locale: string; key: string; value: string }> {
  const seedPath = join(process.cwd(), 'i18n/system-seed.json')
  try {
    if (existsSync(seedPath)) {
      const data = readFileSync(seedPath, 'utf-8')
      return JSON.parse(data)
    }
    console.warn('   ⚠️  system-seed.json not found at:', seedPath)
    return []
  } catch (e) {
    console.warn('   ⚠️  Failed to load system-seed.json:', e)
    return []
  }
}

const DB_PATH = process.env.DATABASE_URL || './data/sqlite.db'

// Ensure data directory exists
const dir = dirname(DB_PATH)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

// Create database connection
const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
const db = drizzle(sqlite, { schema })

// Password hashing (same as server/utils/password.ts)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function seed() {
  console.log('🌱 Seeding database...\n')

  // Check if users already exist
  const existingUsers = db.select().from(schema.users).all()

  if (existingUsers.length === 0) {
    console.log('👤 Creating example users...\n')

    // Master user (developer)
    db.insert(schema.users)
      .values({
        email: 'master@example.com',
        passwordHash: hashPassword('master123'),
        name: 'Developer',
        role: 'master'
      })
      .run()
    console.log('   ✓ master@example.com / master123 (Master - full access)')

    // Admin user (client)
    db.insert(schema.users)
      .values({
        email: 'admin@example.com',
        passwordHash: hashPassword('admin123'),
        name: 'Client Owner',
        role: 'admin'
      })
      .run()
    console.log('   ✓ admin@example.com / admin123 (Admin - client access)')

    // Editor users (client employees)
    db.insert(schema.users)
      .values({
        email: 'editor@example.com',
        passwordHash: hashPassword('editor123'),
        name: 'Content Editor',
        role: 'editor'
      })
      .run()
    console.log('   ✓ editor@example.com / editor123 (Editor - content only)')

    db.insert(schema.users)
      .values({
        email: 'john@example.com',
        passwordHash: hashPassword('john123'),
        name: 'John Doe',
        role: 'editor'
      })
      .run()
    console.log('   ✓ john@example.com / john123 (Editor - content only)')

    console.log('')
  } else {
    console.log(`👤 ${existingUsers.length} users exist, skipping user creation.\n`)
  }

  // Seed built-in roles - ONLY if none exist
  console.log('🎭 Checking roles...')
  const existingRoles = db.select().from(schema.roles).all()

  // Built-in role definitions with page-based permissions
  // Each key is an admin page ID, true = role can access this page
  const builtInRoles = [
    {
      name: 'Master',
      slug: 'master',
      description: 'Full system access - developers and agency',
      permissions: JSON.stringify({
        // System pages
        users: true,
        roles: true,
        translations: true,
        settings: true,
        health: true,
        // Content pages
        sections: true,
        blog: true,
        portfolios: true,
        team: true,
        testimonials: true,
        faq: true,
        clients: true,
        pricing: true,
        features: true,
        contacts: true
      }),
      level: 100,
      isBuiltIn: true,
      color: 'warning'
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Client owner - manage content and users',
      permissions: JSON.stringify({
        // System pages (limited)
        users: true,
        roles: false,
        translations: true,
        settings: true,
        health: false,
        // Content pages (all)
        sections: true,
        blog: true,
        portfolios: true,
        team: true,
        testimonials: true,
        faq: true,
        clients: true,
        pricing: true,
        features: true,
        contacts: true
      }),
      level: 50,
      isBuiltIn: true,
      color: 'primary'
    },
    {
      name: 'Editor',
      slug: 'editor',
      description: 'Content editor - manage content only',
      permissions: JSON.stringify({
        // System pages (none)
        users: false,
        roles: false,
        translations: true,
        settings: false,
        health: false,
        // Content pages (editorial)
        sections: true,
        blog: true,
        portfolios: false,
        team: false,
        testimonials: true,
        faq: true,
        clients: false,
        pricing: false,
        features: true,
        contacts: false
      }),
      level: 25,
      isBuiltIn: true,
      color: 'secondary'
    }
  ]

  if (existingRoles.length === 0) {
    console.log('   Creating built-in roles...')
    for (const role of builtInRoles) {
      db.insert(schema.roles).values(role).run()
      console.log(`   ✓ ${role.name} (level ${role.level})`)
    }
    console.log('')
  } else {
    console.log(`   ${existingRoles.length} roles exist, skipping role creation.\n`)
  }

  // Migrate users to use roleId if not set
  console.log('🔄 Checking user role migration...')
  const usersWithoutRoleId = sqlite.prepare(
    `SELECT id, role FROM users WHERE role_id IS NULL`
  ).all() as Array<{ id: number; role: string }>

  if (usersWithoutRoleId.length > 0) {
    console.log(`   Migrating ${usersWithoutRoleId.length} users to roleId...`)
    const roleMap = new Map<string, number>()

    // Get role IDs by slug
    const allRoles = db.select().from(schema.roles).all()
    for (const role of allRoles) {
      roleMap.set(role.slug, role.id)
    }

    for (const user of usersWithoutRoleId) {
      const roleId = roleMap.get(user.role)
      if (roleId) {
        sqlite.prepare(`UPDATE users SET role_id = ? WHERE id = ?`).run(roleId, user.id)
        console.log(`   ✓ User ${user.id} -> ${user.role} (roleId: ${roleId})`)
      }
    }
    console.log('')
  } else {
    console.log('   All users have roleId set, skipping migration.\n')
  }

  // Create settings from config schema - ONLY if they don't exist
  // Uses raw SQL with INSERT OR IGNORE to preserve existing values
  console.log('⚙️  Syncing settings from config schema...')

  // Example default values for ALL settings
  const defaultValues: Record<string, string> = {
    // Contact Info
    'contact.email': 'hello@example.com',
    'contact.phone': '+1 (555) 123-4567',
    'contact.location': '123 Main Street, New York, NY 10001',

    // Social - Messaging
    'social.telegram': 'https://t.me/example',
    'social.whatsapp': 'https://wa.me/15551234567',
    'social.viber': 'viber://chat?number=15551234567',
    'social.discord': 'https://discord.gg/example',
    'social.max': '',

    // Social - Networks
    'social.instagram': 'https://instagram.com/example',
    'social.facebook': 'https://facebook.com/example',
    'social.twitter': 'https://x.com/example',
    'social.threads': 'https://threads.net/@example',
    'social.tiktok': 'https://tiktok.com/@example',
    'social.pinterest': 'https://pinterest.com/example',
    'social.vk': 'https://vk.com/example',

    // Social - Video
    'social.youtube': 'https://youtube.com/@example',
    'social.twitch': 'https://twitch.tv/example',

    // Social - Professional
    'social.linkedin': 'https://linkedin.com/company/example',
    'social.medium': 'https://medium.com/@example',

    // Social - Dev/Design
    'social.github': 'https://github.com/example',
    'social.gitlab': 'https://gitlab.com/example',
    'social.dribbble': 'https://dribbble.com/example',
    'social.behance': 'https://behance.net/example',

    // Legal
    'legal.companyName': 'Example Company LLC',
    'legal.inn': '1234567890',
    'legal.ogrn': '1234567890123',
    'legal.address': '123 Main Street, Suite 100, New York, NY 10001',
    'legal.email': 'legal@example.com',

    // Footer (ctaText is in translations as cta.footerButton)
    'footer.ctaUrl': '#contact',
    'footer.privacyUrl': '',
    'footer.termsUrl': '',

    // SEO
    'seo.title': 'Puppet Master - Modern Web Framework',
    'seo.description':
      'A production-ready Nuxt 3 framework for building client websites with admin panel.',
    'seo.keywords': 'nuxt, vue, web development, framework, cms',

    // Analytics (leave empty - user needs to add their own IDs)
    'analytics.googleId': '',
    'analytics.yandexId': '',
    'analytics.facebookPixel': '',

    // Verification (leave empty - user needs to add their own codes)
    'verification.google': '',
    'verification.yandex': ''
  }

  let settingsAdded = 0
  for (const setting of config.settings) {
    const defaultValue = defaultValues[setting.key] ?? ''
    const result = sqlite
      .prepare(
        `
      INSERT OR IGNORE INTO settings (key, value, type, "group")
      VALUES (?, ?, ?, ?)
    `
      )
      .run(setting.key, defaultValue, setting.type, setting.group)

    if (result.changes > 0) {
      console.log(
        `   + ${setting.key}${defaultValue ? ` = "${defaultValue.substring(0, 40)}${defaultValue.length > 40 ? '...' : ''}"` : ' (empty)'}`
      )
      settingsAdded++
    }
  }
  console.log(`   ${settingsAdded} new settings added, existing values preserved.\n`)

  // Seed all translations
  // Uses raw SQL with INSERT OR IGNORE to preserve existing values
  console.log('🌍 Syncing translations...')

  const systemTranslations = getSystemSeedData()
  const contentTranslations = getContentSeedData()
  let systemAdded = 0
  let contentAdded = 0
  const now = Date.now()

  // Seed system translations (from JSON)
  console.log('   📌 System translations (master-only)...')
  for (const t of systemTranslations) {
    const result = sqlite
      .prepare(
        `
      INSERT OR IGNORE INTO translations (locale, key, value, updated_at)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(t.locale, t.key, t.value, now)

    if (result.changes > 0) {
      systemAdded++
    }
  }
  console.log(`      ${systemAdded} new, ${systemTranslations.length - systemAdded} preserved`)

  // Seed content translations
  console.log('   📝 Content translations (admin-editable)...')
  for (const t of contentTranslations) {
    const result = sqlite
      .prepare(
        `
      INSERT OR IGNORE INTO translations (locale, key, value, updated_at)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(t.locale, t.key, t.value, now)

    if (result.changes > 0) {
      contentAdded++
    }
  }
  console.log(`      ${contentAdded} new, ${contentTranslations.length - contentAdded} preserved`)

  // Seed default portfolio and items - ONLY if none exist
  console.log('\n📁 Checking portfolios and items...')
  const existingPortfolios = db.select().from(schema.portfolios).all()
  const existingPortfolioItems = db.select().from(schema.portfolioItems).all()

  // Create default portfolio if none exists
  let defaultPortfolioId = existingPortfolios[0]?.id
  if (!defaultPortfolioId) {
    console.log('   Creating default portfolio...')
    const result = db
      .insert(schema.portfolios)
      .values({
        name: 'Main Portfolio',
        slug: 'main',
        type: 'case_study',
        description: 'Default portfolio for case studies and projects',
        published: true
      })
      .returning()
      .get()
    defaultPortfolioId = result.id
    console.log('   ✓ Default portfolio created')
  } else {
    console.log(`   Portfolio exists (id: ${defaultPortfolioId}), skipping creation.`)
  }

  if (existingPortfolioItems.length === 0) {
    console.log('   Creating default portfolio items...')

    const portfolioItems = [
      {
        portfolioId: defaultPortfolioId,
        itemType: 'case_study' as const,
        slug: 'brand-identity-redesign',
        title: 'Brand Identity Redesign',
        description:
          'Complete visual identity overhaul for a tech startup, including logo, color palette, and brand guidelines.',
        category: 'Branding',
        tags: JSON.stringify(['branding', 'logo', 'identity']),
        order: 3,
        published: true,
        publishedAt: new Date()
      },
      {
        portfolioId: defaultPortfolioId,
        itemType: 'case_study' as const,
        slug: 'e-commerce-platform',
        title: 'E-Commerce Platform',
        description:
          'Full-stack online store with custom checkout, inventory management, and analytics dashboard.',
        category: 'Web Development',
        tags: JSON.stringify(['web', 'ecommerce', 'fullstack']),
        order: 2,
        published: true,
        publishedAt: new Date()
      },
      {
        portfolioId: defaultPortfolioId,
        itemType: 'case_study' as const,
        slug: 'mobile-fitness-app',
        title: 'Mobile Fitness App',
        description:
          'Cross-platform fitness tracking application with workout plans, progress tracking, and social features.',
        category: 'Mobile',
        tags: JSON.stringify(['mobile', 'app', 'fitness']),
        order: 1,
        published: true,
        publishedAt: new Date()
      },
      {
        portfolioId: defaultPortfolioId,
        itemType: 'case_study' as const,
        slug: 'corporate-website',
        title: 'Corporate Website',
        description:
          'Modern responsive website for a financial services company with CMS integration.',
        category: 'Web Development',
        tags: JSON.stringify(['web', 'corporate', 'cms']),
        order: 0,
        published: true,
        publishedAt: new Date()
      }
    ]

    for (const item of portfolioItems) {
      db.insert(schema.portfolioItems).values(item).run()
      console.log(`   ✓ ${item.title}`)
    }
  } else {
    console.log(`   ${existingPortfolioItems.length} portfolio items exist, skipping.`)
  }

  // Seed default pricing tiers - ONLY if none exist
  console.log('\n💰 Checking pricing tiers...')
  const existingTiers = db.select().from(schema.pricingTiers).all()

  if (existingTiers.length === 0) {
    console.log('   Creating default pricing tiers...')

    // Starter tier
    const starterTier = db
      .insert(schema.pricingTiers)
      .values({
        slug: 'starter',
        name: 'Starter',
        description: 'Perfect for small projects',
        price: 0, // Free (in cents)
        currency: 'USD',
        period: 'month',
        featured: false,
        ctaText: 'Get Started',
        ctaUrl: '/contact',
        order: 0,
        published: true
      })
      .returning()
      .get()

    // Pricing translations for all locales
    const pricingTierTranslations: Record<string, { en: { name: string; description: string; cta: string }; ru: { name: string; description: string; cta: string }; he: { name: string; description: string; cta: string } }> = {
      'starter': {
        en: { name: 'Starter', description: 'Perfect for small projects', cta: 'Get Started' },
        ru: { name: 'Стартовый', description: 'Идеально для небольших проектов', cta: 'Начать' },
        he: { name: 'התחלתי', description: 'מושלם לפרויקטים קטנים', cta: 'התחל עכשיו' }
      },
      'pro': {
        en: { name: 'Pro', description: 'For growing businesses', cta: 'Start Free Trial' },
        ru: { name: 'Профессиональный', description: 'Для растущего бизнеса', cta: 'Попробовать бесплатно' },
        he: { name: 'מקצועי', description: 'לעסקים בצמיחה', cta: 'התחל ניסיון חינם' }
      },
      'enterprise': {
        en: { name: 'Enterprise', description: 'Custom solutions', cta: 'Contact Sales' },
        ru: { name: 'Корпоративный', description: 'Индивидуальные решения', cta: 'Связаться с нами' },
        he: { name: 'ארגוני', description: 'פתרונות מותאמים', cta: 'צור קשר' }
      }
    }

    const pricingFeatureTranslations: Record<string, { en: string; ru: string; he: string }> = {
      'Up to 3 pages': { en: 'Up to 3 pages', ru: 'До 3 страниц', he: 'עד 3 עמודים' },
      'Basic blocks': { en: 'Basic blocks', ru: 'Базовые блоки', he: 'בלוקים בסיסיים' },
      'Community support': { en: 'Community support', ru: 'Поддержка сообщества', he: 'תמיכת קהילה' },
      'Visual editor': { en: 'Visual editor', ru: 'Визуальный редактор', he: 'עורך ויזואלי' },
      'Custom modules': { en: 'Custom modules', ru: 'Кастомные модули', he: 'מודולים מותאמים' },
      'Unlimited pages': { en: 'Unlimited pages', ru: 'Неограниченное количество страниц', he: 'עמודים ללא הגבלה' },
      'All blocks': { en: 'All blocks', ru: 'Все блоки', he: 'כל הבלוקים' },
      'Priority support': { en: 'Priority support', ru: 'Приоритетная поддержка', he: 'תמיכה בעדיפות' },
      'Dedicated support': { en: 'Dedicated support', ru: 'Персональная поддержка', he: 'תמיכה ייעודית' }
    }

    // Add tier translations
    for (const locale of ['en', 'ru', 'he'] as const) {
      const starterTrans = pricingTierTranslations['starter'][locale]
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${starterTier.id}.name`, starterTrans.name, Date.now())
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${starterTier.id}.description`, starterTrans.description, Date.now())
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${starterTier.id}.ctaText`, starterTrans.cta, Date.now())
    }

    const starterFeatures = [
      { tierId: starterTier.id, text: 'Up to 3 pages', included: true, order: 0 },
      { tierId: starterTier.id, text: 'Basic blocks', included: true, order: 1 },
      { tierId: starterTier.id, text: 'Community support', included: true, order: 2 },
      { tierId: starterTier.id, text: 'Visual editor', included: false, order: 3 },
      { tierId: starterTier.id, text: 'Custom modules', included: false, order: 4 }
    ]
    for (const f of starterFeatures) {
      const result = db.insert(schema.pricingFeatures).values(f).returning().get()
      for (const locale of ['en', 'ru', 'he'] as const) {
        const trans = pricingFeatureTranslations[f.text]
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.feature.${result.id}.text`, trans[locale], Date.now())
      }
    }
    console.log('   ✓ Starter tier created')

    // Pro tier
    const proTier = db
      .insert(schema.pricingTiers)
      .values({
        slug: 'pro',
        name: 'Pro',
        description: 'For growing businesses',
        price: 2900, // $29 in cents
        currency: 'USD',
        period: 'month',
        featured: true,
        ctaText: 'Start Free Trial',
        ctaUrl: '/contact',
        order: 1,
        published: true
      })
      .returning()
      .get()

    // Add tier translations
    for (const locale of ['en', 'ru', 'he'] as const) {
      const proTrans = pricingTierTranslations['pro'][locale]
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${proTier.id}.name`, proTrans.name, Date.now())
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${proTier.id}.description`, proTrans.description, Date.now())
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${proTier.id}.ctaText`, proTrans.cta, Date.now())
    }

    const proFeatures = [
      { tierId: proTier.id, text: 'Unlimited pages', included: true, order: 0 },
      { tierId: proTier.id, text: 'All blocks', included: true, order: 1 },
      { tierId: proTier.id, text: 'Priority support', included: true, order: 2 },
      { tierId: proTier.id, text: 'Visual editor', included: true, order: 3 },
      { tierId: proTier.id, text: 'Custom modules', included: false, order: 4 }
    ]
    for (const f of proFeatures) {
      const result = db.insert(schema.pricingFeatures).values(f).returning().get()
      for (const locale of ['en', 'ru', 'he'] as const) {
        const trans = pricingFeatureTranslations[f.text]
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.feature.${result.id}.text`, trans[locale], Date.now())
      }
    }
    console.log('   ✓ Pro tier created (featured)')

    // Enterprise tier
    const enterpriseTier = db
      .insert(schema.pricingTiers)
      .values({
        slug: 'enterprise',
        name: 'Enterprise',
        description: 'Custom solutions',
        price: null, // Custom pricing
        currency: 'USD',
        period: 'month',
        featured: false,
        ctaText: 'Contact Sales',
        ctaUrl: '/contact',
        order: 2,
        published: true
      })
      .returning()
      .get()

    // Add tier translations
    for (const locale of ['en', 'ru', 'he'] as const) {
      const entTrans = pricingTierTranslations['enterprise'][locale]
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${enterpriseTier.id}.name`, entTrans.name, Date.now())
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${enterpriseTier.id}.description`, entTrans.description, Date.now())
      sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.tier.${enterpriseTier.id}.ctaText`, entTrans.cta, Date.now())
    }

    const enterpriseFeatures = [
      { tierId: enterpriseTier.id, text: 'Unlimited pages', included: true, order: 0 },
      { tierId: enterpriseTier.id, text: 'All blocks', included: true, order: 1 },
      { tierId: enterpriseTier.id, text: 'Dedicated support', included: true, order: 2 },
      { tierId: enterpriseTier.id, text: 'Visual editor', included: true, order: 3 },
      { tierId: enterpriseTier.id, text: 'Custom modules', included: true, order: 4 }
    ]
    for (const f of enterpriseFeatures) {
      const result = db.insert(schema.pricingFeatures).values(f).returning().get()
      for (const locale of ['en', 'ru', 'he'] as const) {
        const trans = pricingFeatureTranslations[f.text]
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(locale, `pricing.feature.${result.id}.text`, trans[locale], Date.now())
      }
    }
    console.log('   ✓ Enterprise tier created')
  } else {
    console.log(`   ${existingTiers.length} pricing tiers exist, skipping.`)
  }

  // Seed team members - ONLY if none exist
  console.log('\n👥 Checking team members...')
  const existingTeam = db.select().from(schema.teamMembers).all()

  if (existingTeam.length === 0) {
    console.log('   Creating team members...')

    const teamData = [
      {
        slug: 'alex-johnson',
        name: 'Alex Johnson',
        position: 'CEO & Founder',
        bio: 'With over 15 years of experience in software development, Alex leads our company vision and strategy.',
        department: 'Leadership',
        email: 'alex@example.com',
        socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/alexjohnson', twitter: 'https://twitter.com/alexj' }),
        order: 0,
        published: true
      },
      {
        slug: 'sarah-chen',
        name: 'Sarah Chen',
        position: 'CTO',
        bio: 'Sarah brings deep technical expertise and innovation to our engineering practices.',
        department: 'Engineering',
        email: 'sarah@example.com',
        socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/sarahchen', github: 'https://github.com/sarahchen' }),
        order: 1,
        published: true
      },
      {
        slug: 'mike-wilson',
        name: 'Mike Wilson',
        position: 'Lead Designer',
        bio: 'Mike crafts beautiful user experiences with a keen eye for detail and usability.',
        department: 'Design',
        email: 'mike@example.com',
        socialLinks: JSON.stringify({ dribbble: 'https://dribbble.com/mikew', behance: 'https://behance.net/mikew' }),
        order: 2,
        published: true
      },
      {
        slug: 'emma-davis',
        name: 'Emma Davis',
        position: 'Marketing Director',
        bio: 'Emma drives our brand strategy and customer engagement initiatives.',
        department: 'Marketing',
        email: 'emma@example.com',
        socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/in/emmadavis' }),
        order: 3,
        published: true
      }
    ]

    // Team member translations for all locales
    const teamTranslations: Record<string, { en: { position: string; bio: string }; ru: { position: string; bio: string }; he: { position: string; bio: string } }> = {
      'alex-johnson': {
        en: { position: 'CEO & Founder', bio: 'With over 15 years of experience in software development, Alex leads our company vision and strategy.' },
        ru: { position: 'Генеральный директор', bio: 'С более чем 15-летним опытом в разработке ПО, Алекс руководит видением и стратегией компании.' },
        he: { position: 'מנכ"ל ומייסד', bio: 'עם יותר מ-15 שנות ניסיון בפיתוח תוכנה, אלכס מוביל את החזון והאסטרטגיה של החברה.' }
      },
      'sarah-chen': {
        en: { position: 'CTO', bio: 'Sarah brings deep technical expertise and innovation to our engineering practices.' },
        ru: { position: 'Технический директор', bio: 'Сара привносит глубокую техническую экспертизу и инновации в нашу инженерную практику.' },
        he: { position: 'סמנכ"ל טכנולוגיות', bio: 'שרה מביאה מומחיות טכנית עמוקה וחדשנות לתהליכי ההנדסה שלנו.' }
      },
      'mike-wilson': {
        en: { position: 'Lead Designer', bio: 'Mike crafts beautiful user experiences with a keen eye for detail and usability.' },
        ru: { position: 'Ведущий дизайнер', bio: 'Майк создаёт красивый пользовательский опыт с вниманием к деталям и удобству.' },
        he: { position: 'מעצב ראשי', bio: 'מייק יוצר חוויות משתמש יפות עם עין חדה לפרטים ושימושיות.' }
      },
      'emma-davis': {
        en: { position: 'Marketing Director', bio: 'Emma drives our brand strategy and customer engagement initiatives.' },
        ru: { position: 'Директор по маркетингу', bio: 'Эмма руководит стратегией бренда и инициативами по работе с клиентами.' },
        he: { position: 'מנהלת שיווק', bio: 'אמה מובילה את אסטרטגיית המותג ויוזמות מעורבות הלקוחות שלנו.' }
      }
    }

    for (const member of teamData) {
      const result = db.insert(schema.teamMembers).values(member).returning().get()
      const trans = teamTranslations[member.slug]

      // Add translations for all locales
      for (const locale of ['en', 'ru', 'he'] as const) {
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `team.${result.id}.position`, trans[locale].position, Date.now()
        )
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `team.${result.id}.bio`, trans[locale].bio, Date.now()
        )
      }

      console.log(`   ✓ ${member.name}`)
    }
  } else {
    console.log(`   ${existingTeam.length} team members exist, skipping.`)
  }

  // Seed features - ONLY if none exist
  console.log('\n✨ Checking features...')
  const existingFeatures = db.select().from(schema.features).all()

  if (existingFeatures.length === 0) {
    console.log('   Creating features...')

    const featuresData = [
      { slug: 'responsive-design', icon: 'device-mobile', category: 'Design', order: 0, published: true },
      { slug: 'fast-performance', icon: 'rocket', category: 'Performance', order: 1, published: true },
      { slug: 'seo-optimized', icon: 'search', category: 'Marketing', order: 2, published: true },
      { slug: 'secure-hosting', icon: 'shield-check', category: 'Security', order: 3, published: true },
      { slug: 'analytics-dashboard', icon: 'chart-bar', category: 'Analytics', order: 4, published: true },
      { slug: '24-7-support', icon: 'headset', category: 'Support', order: 5, published: true }
    ]

    // Feature translations for all locales
    const featureTranslations: Record<string, { en: { title: string; description: string }; ru: { title: string; description: string }; he: { title: string; description: string } }> = {
      'responsive-design': {
        en: { title: 'Responsive Design', description: 'Beautiful layouts that adapt perfectly to any screen size and device.' },
        ru: { title: 'Адаптивный дизайн', description: 'Красивые макеты, которые идеально адаптируются к любому размеру экрана.' },
        he: { title: 'עיצוב רספונסיבי', description: 'עיצובים יפים שמתאימים בצורה מושלמת לכל גודל מסך.' }
      },
      'fast-performance': {
        en: { title: 'Fast Performance', description: 'Lightning-fast loading speeds for the best user experience.' },
        ru: { title: 'Высокая производительность', description: 'Молниеносная скорость загрузки для лучшего пользовательского опыта.' },
        he: { title: 'ביצועים מהירים', description: 'מהירות טעינה מהירה כברק לחוויית משתמש מיטבית.' }
      },
      'seo-optimized': {
        en: { title: 'SEO Optimized', description: 'Built-in SEO best practices to help your site rank higher.' },
        ru: { title: 'SEO оптимизация', description: 'Встроенные лучшие практики SEO для повышения рейтинга сайта.' },
        he: { title: 'אופטימיזציה ל-SEO', description: 'שיטות עבודה מומלצות מובנות לקידום אתרים.' }
      },
      'secure-hosting': {
        en: { title: 'Secure Hosting', description: 'Enterprise-grade security to protect your data and users.' },
        ru: { title: 'Безопасный хостинг', description: 'Безопасность корпоративного уровня для защиты данных.' },
        he: { title: 'אירוח מאובטח', description: 'אבטחה ברמה ארגונית להגנה על הנתונים שלך.' }
      },
      'analytics-dashboard': {
        en: { title: 'Analytics Dashboard', description: 'Comprehensive analytics to track your business metrics.' },
        ru: { title: 'Панель аналитики', description: 'Комплексная аналитика для отслеживания бизнес-метрик.' },
        he: { title: 'לוח בקרה אנליטי', description: 'אנליטיקה מקיפה למעקב אחר המדדים העסקיים שלך.' }
      },
      '24-7-support': {
        en: { title: '24/7 Support', description: 'Round-the-clock expert support whenever you need it.' },
        ru: { title: 'Поддержка 24/7', description: 'Круглосуточная экспертная поддержка когда вам нужно.' },
        he: { title: 'תמיכה 24/7', description: 'תמיכה מקצועית מסביב לשעון בכל עת שתצטרך.' }
      }
    }

    for (const feature of featuresData) {
      const result = db.insert(schema.features).values(feature).returning().get()
      const trans = featureTranslations[feature.slug]

      // Add translations for all locales
      for (const locale of ['en', 'ru', 'he'] as const) {
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `feature.${result.id}.title`, trans[locale].title, Date.now()
        )
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `feature.${result.id}.description`, trans[locale].description, Date.now()
        )
      }

      console.log(`   ✓ ${feature.slug}`)
    }
  } else {
    console.log(`   ${existingFeatures.length} features exist, skipping.`)
  }

  // Seed testimonials - ONLY if none exist
  console.log('\n💬 Checking testimonials...')
  const existingTestimonials = db.select().from(schema.testimonials).all()

  if (existingTestimonials.length === 0) {
    console.log('   Creating testimonials...')

    const testimonialData = [
      {
        authorName: 'John Smith',
        authorTitle: 'CEO',
        authorCompany: 'TechCorp',
        rating: 5,
        featured: true,
        order: 0,
        published: true,
        quote: 'Working with this team has been an absolute pleasure. They delivered our project on time and exceeded our expectations.'
      },
      {
        authorName: 'Lisa Anderson',
        authorTitle: 'Marketing Manager',
        authorCompany: 'StartupXYZ',
        rating: 5,
        featured: true,
        order: 1,
        published: true,
        quote: 'The attention to detail and creative solutions they provided helped us increase our conversion rate by 40%.'
      },
      {
        authorName: 'David Park',
        authorTitle: 'Founder',
        authorCompany: 'InnovateLab',
        rating: 4,
        featured: false,
        order: 2,
        published: true,
        quote: 'Professional, responsive, and truly talented. I highly recommend their services to anyone looking for quality web development.'
      }
    ]

    // Testimonial translations for all locales
    const testimonialQuotes: Record<string, { en: string; ru: string; he: string }> = {
      'John Smith': {
        en: 'Working with this team has been an absolute pleasure. They delivered our project on time and exceeded our expectations.',
        ru: 'Работа с этой командой была настоящим удовольствием. Они сдали проект вовремя и превзошли наши ожидания.',
        he: 'העבודה עם הצוות הזה הייתה תענוג מוחלט. הם סיפקו את הפרויקט בזמן ועלו על הציפיות שלנו.'
      },
      'Lisa Anderson': {
        en: 'The attention to detail and creative solutions they provided helped us increase our conversion rate by 40%.',
        ru: 'Внимание к деталям и креативные решения помогли нам увеличить конверсию на 40%.',
        he: 'תשומת הלב לפרטים והפתרונות היצירתיים עזרו לנו להגדיל את שיעור ההמרה ב-40%.'
      },
      'David Park': {
        en: 'Professional, responsive, and truly talented. I highly recommend their services to anyone looking for quality web development.',
        ru: 'Профессиональные, отзывчивые и действительно талантливые. Рекомендую их услуги всем.',
        he: 'מקצועיים, רספונסיביים ומוכשרים באמת. אני ממליץ בחום על השירותים שלהם.'
      }
    }

    for (const testimonial of testimonialData) {
      const { quote, ...data } = testimonial
      const result = db.insert(schema.testimonials).values(data).returning().get()
      const quotes = testimonialQuotes[testimonial.authorName]

      // Add translations for all locales
      for (const locale of ['en', 'ru', 'he'] as const) {
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `testimonial.${result.id}.quote`, quotes[locale], Date.now()
        )
      }

      console.log(`   ✓ ${testimonial.authorName}`)
    }
  } else {
    console.log(`   ${existingTestimonials.length} testimonials exist, skipping.`)
  }

  // Seed clients - ONLY if none exist
  console.log('\n🏢 Checking clients...')
  const existingClients = db.select().from(schema.clients).all()

  if (existingClients.length === 0) {
    console.log('   Creating clients...')

    const clientData = [
      { name: 'Acme Corp', logoUrl: '/images/clients/acme.svg', websiteUrl: 'https://acme.example.com', category: 'client' as const, featured: true, order: 0, published: true },
      { name: 'TechGiant', logoUrl: '/images/clients/techgiant.svg', websiteUrl: 'https://techgiant.example.com', category: 'client' as const, featured: true, order: 1, published: true },
      { name: 'StartupHub', logoUrl: '/images/clients/startuphub.svg', websiteUrl: 'https://startuphub.example.com', category: 'partner' as const, featured: true, order: 2, published: true },
      { name: 'GlobalTrade', logoUrl: '/images/clients/globaltrade.svg', websiteUrl: 'https://globaltrade.example.com', category: 'client' as const, featured: false, order: 3, published: true },
      { name: 'CloudFirst', logoUrl: '/images/clients/cloudfirst.svg', websiteUrl: 'https://cloudfirst.example.com', category: 'sponsor' as const, featured: false, order: 4, published: true }
    ]

    for (const client of clientData) {
      db.insert(schema.clients).values(client).run()
      console.log(`   ✓ ${client.name}`)
    }
  } else {
    console.log(`   ${existingClients.length} clients exist, skipping.`)
  }

  // Seed FAQ items - ONLY if none exist
  console.log('\n❓ Checking FAQ items...')
  const existingFaq = db.select().from(schema.faqItems).all()

  if (existingFaq.length === 0) {
    console.log('   Creating FAQ items...')

    const faqData = [
      {
        slug: 'how-to-get-started',
        category: 'General',
        order: 0,
        published: true,
        question: 'How do I get started?',
        answer: 'Getting started is easy! Simply contact us through our form or email, and we\'ll schedule a free consultation to discuss your project needs.'
      },
      {
        slug: 'pricing-structure',
        category: 'Pricing',
        order: 1,
        published: true,
        question: 'What is your pricing structure?',
        answer: 'We offer flexible pricing options including fixed-price projects and hourly rates. Each project is quoted individually based on scope and requirements.'
      },
      {
        slug: 'project-timeline',
        category: 'Process',
        order: 2,
        published: true,
        question: 'How long does a typical project take?',
        answer: 'Project timelines vary based on complexity. A simple website might take 2-4 weeks, while more complex applications can take 2-3 months or more.'
      },
      {
        slug: 'support-maintenance',
        category: 'Support',
        order: 3,
        published: true,
        question: 'Do you offer ongoing support and maintenance?',
        answer: 'Yes! We offer various support packages to keep your site running smoothly, including security updates, content updates, and performance monitoring.'
      },
      {
        slug: 'technologies-used',
        category: 'Technical',
        order: 4,
        published: true,
        question: 'What technologies do you use?',
        answer: 'We specialize in modern web technologies including Vue.js, Nuxt, React, Node.js, and various database solutions. We choose the best stack for each project.'
      }
    ]

    // FAQ translations for all locales
    const faqTranslations: Record<string, { en: { q: string; a: string }; ru: { q: string; a: string }; he: { q: string; a: string } }> = {
      'how-to-get-started': {
        en: { q: 'How do I get started?', a: 'Getting started is easy! Simply contact us through our form or email, and we\'ll schedule a free consultation to discuss your project needs.' },
        ru: { q: 'Как начать работу?', a: 'Начать легко! Просто свяжитесь с нами через форму или email, и мы назначим бесплатную консультацию для обсуждения вашего проекта.' },
        he: { q: 'איך מתחילים?', a: 'להתחיל זה קל! פשוט צרו איתנו קשר דרך הטופס או האימייל, ונקבע התייעצות חינם לדיון בצרכי הפרויקט שלכם.' }
      },
      'pricing-structure': {
        en: { q: 'What is your pricing structure?', a: 'We offer flexible pricing options including fixed-price projects and hourly rates. Each project is quoted individually based on scope and requirements.' },
        ru: { q: 'Какова ваша ценовая политика?', a: 'Мы предлагаем гибкие варианты ценообразования, включая фиксированную цену и почасовую оплату. Каждый проект оценивается индивидуально.' },
        he: { q: 'מהו מבנה התמחור שלכם?', a: 'אנו מציעים אפשרויות תמחור גמישות כולל מחיר קבוע ותעריף שעתי. כל פרויקט מתומחר בנפרד.' }
      },
      'project-timeline': {
        en: { q: 'How long does a typical project take?', a: 'Project timelines vary based on complexity. A simple website might take 2-4 weeks, while more complex applications can take 2-3 months or more.' },
        ru: { q: 'Сколько времени занимает типичный проект?', a: 'Сроки зависят от сложности. Простой сайт может занять 2-4 недели, более сложные приложения — 2-3 месяца и больше.' },
        he: { q: 'כמה זמן לוקח פרויקט טיפוסי?', a: 'לוחות זמנים משתנים לפי מורכבות. אתר פשוט עשוי לקחת 2-4 שבועות, יישומים מורכבים יותר 2-3 חודשים.' }
      },
      'support-maintenance': {
        en: { q: 'Do you offer ongoing support and maintenance?', a: 'Yes! We offer various support packages to keep your site running smoothly, including security updates, content updates, and performance monitoring.' },
        ru: { q: 'Предлагаете ли вы постоянную поддержку?', a: 'Да! Мы предлагаем различные пакеты поддержки, включая обновления безопасности, контента и мониторинг производительности.' },
        he: { q: 'האם אתם מציעים תמיכה ותחזוקה שוטפת?', a: 'כן! אנו מציעים חבילות תמיכה שונות כולל עדכוני אבטחה, עדכוני תוכן וניטור ביצועים.' }
      },
      'technologies-used': {
        en: { q: 'What technologies do you use?', a: 'We specialize in modern web technologies including Vue.js, Nuxt, React, Node.js, and various database solutions. We choose the best stack for each project.' },
        ru: { q: 'Какие технологии вы используете?', a: 'Мы специализируемся на современных технологиях: Vue.js, Nuxt, React, Node.js и различных базах данных. Выбираем лучший стек для каждого проекта.' },
        he: { q: 'באילו טכנולוגיות אתם משתמשים?', a: 'אנו מתמחים בטכנולוגיות מודרניות כולל Vue.js, Nuxt, React, Node.js ופתרונות מסדי נתונים. אנו בוחרים את הסטאק הטוב ביותר לכל פרויקט.' }
      }
    }

    for (const faq of faqData) {
      const { question, answer, ...data } = faq
      const result = db.insert(schema.faqItems).values(data).returning().get()
      const trans = faqTranslations[faq.slug]

      // Add translations for all locales
      for (const locale of ['en', 'ru', 'he'] as const) {
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `faq.${result.id}.question`, trans[locale].q, Date.now()
        )
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `faq.${result.id}.answer`, trans[locale].a, Date.now()
        )
      }

      console.log(`   ✓ ${faq.slug}`)
    }
  } else {
    console.log(`   ${existingFaq.length} FAQ items exist, skipping.`)
  }

  // Seed blog categories, tags, and posts - ONLY if none exist
  console.log('\n📝 Checking blog content...')
  const existingCategories = db.select().from(schema.blogCategories).all()
  const existingTags = db.select().from(schema.blogTags).all()
  const existingPosts = db.select().from(schema.blogPosts).all()

  if (existingCategories.length === 0) {
    console.log('   Creating blog categories...')

    const categoryData = [
      { slug: 'technology', order: 0, name: 'Technology' },
      { slug: 'design', order: 1, name: 'Design' },
      { slug: 'business', order: 2, name: 'Business' },
      { slug: 'tutorials', order: 3, name: 'Tutorials' }
    ]

    // Blog category translations
    const categoryTranslations: Record<string, { en: string; ru: string; he: string }> = {
      'technology': { en: 'Technology', ru: 'Технологии', he: 'טכנולוגיה' },
      'design': { en: 'Design', ru: 'Дизайн', he: 'עיצוב' },
      'business': { en: 'Business', ru: 'Бизнес', he: 'עסקים' },
      'tutorials': { en: 'Tutorials', ru: 'Уроки', he: 'מדריכים' }
    }

    for (const cat of categoryData) {
      const { name, ...data } = cat
      const result = db.insert(schema.blogCategories).values(data).returning().get()
      const trans = categoryTranslations[cat.slug]

      // Add translations for all locales
      for (const locale of ['en', 'ru', 'he'] as const) {
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `blog.category.${result.id}.name`, trans[locale], Date.now()
        )
      }

      console.log(`   ✓ Category: ${name}`)
    }
  } else {
    console.log(`   ${existingCategories.length} blog categories exist, skipping.`)
  }

  if (existingTags.length === 0) {
    console.log('   Creating blog tags...')

    const tagData = [
      { slug: 'javascript', name: 'JavaScript' },
      { slug: 'vue', name: 'Vue.js' },
      { slug: 'nuxt', name: 'Nuxt' },
      { slug: 'css', name: 'CSS' },
      { slug: 'web-development', name: 'Web Development' },
      { slug: 'ui-ux', name: 'UI/UX' }
    ]

    for (const tag of tagData) {
      db.insert(schema.blogTags).values(tag).run()
      console.log(`   ✓ Tag: ${tag.name}`)
    }
  } else {
    console.log(`   ${existingTags.length} blog tags exist, skipping.`)
  }

  if (existingPosts.length === 0) {
    console.log('   Creating blog posts...')

    // Get first category and first user for author
    const firstCategory = db.select().from(schema.blogCategories).limit(1).all()[0]
    const firstUser = db.select().from(schema.users).limit(1).all()[0]
    const allTags = db.select().from(schema.blogTags).all()

    const postData = [
      {
        slug: 'getting-started-with-nuxt3',
        categoryId: firstCategory?.id,
        authorId: firstUser?.id,
        published: true,
        publishedAt: new Date(),
        readingTimeMinutes: 5,
        title: 'Getting Started with Nuxt 3',
        excerpt: 'Learn the basics of Nuxt 3 and how to build modern web applications.',
        content: '## Introduction\n\nNuxt 3 is a powerful framework for building Vue.js applications...\n\n## Getting Started\n\nFirst, create a new project using the following command...'
      },
      {
        slug: 'modern-css-techniques',
        categoryId: firstCategory?.id,
        authorId: firstUser?.id,
        published: true,
        publishedAt: new Date(Date.now() - 86400000), // Yesterday
        readingTimeMinutes: 8,
        title: 'Modern CSS Techniques for 2024',
        excerpt: 'Explore the latest CSS features and best practices for modern web design.',
        content: '## CSS Has Evolved\n\nModern CSS offers powerful features like CSS Grid, Container Queries, and more...'
      },
      {
        slug: 'building-scalable-apis',
        categoryId: firstCategory?.id,
        authorId: firstUser?.id,
        published: false, // Draft
        readingTimeMinutes: 10,
        title: 'Building Scalable APIs with Node.js',
        excerpt: 'A comprehensive guide to creating performant and maintainable APIs.',
        content: '## API Design Principles\n\nWhen building APIs, consider these key principles...'
      }
    ]

    // Blog post translations
    const postTranslations: Record<string, { en: { title: string; excerpt: string; content: string }; ru: { title: string; excerpt: string; content: string }; he: { title: string; excerpt: string; content: string } }> = {
      'getting-started-with-nuxt3': {
        en: { title: 'Getting Started with Nuxt 3', excerpt: 'Learn the basics of Nuxt 3 and how to build modern web applications.', content: '## Introduction\n\nNuxt 3 is a powerful framework for building Vue.js applications...\n\n## Getting Started\n\nFirst, create a new project using the following command...' },
        ru: { title: 'Начало работы с Nuxt 3', excerpt: 'Изучите основы Nuxt 3 и создавайте современные веб-приложения.', content: '## Введение\n\nNuxt 3 — мощный фреймворк для создания приложений на Vue.js...\n\n## Начало работы\n\nСначала создайте новый проект с помощью команды...' },
        he: { title: 'מתחילים עם Nuxt 3', excerpt: 'למדו את הבסיס של Nuxt 3 וכיצד לבנות אפליקציות ווב מודרניות.', content: '## הקדמה\n\nNuxt 3 הוא פריימוורק חזק לבניית אפליקציות Vue.js...\n\n## מתחילים\n\nראשית, צרו פרויקט חדש באמצעות הפקודה הבאה...' }
      },
      'modern-css-techniques': {
        en: { title: 'Modern CSS Techniques for 2024', excerpt: 'Explore the latest CSS features and best practices for modern web design.', content: '## CSS Has Evolved\n\nModern CSS offers powerful features like CSS Grid, Container Queries, and more...' },
        ru: { title: 'Современные техники CSS в 2024', excerpt: 'Изучите последние возможности CSS и лучшие практики современного веб-дизайна.', content: '## CSS развивается\n\nСовременный CSS предлагает мощные возможности: CSS Grid, Container Queries и многое другое...' },
        he: { title: 'טכניקות CSS מודרניות ל-2024', excerpt: 'גלו את התכונות האחרונות של CSS ושיטות עבודה מומלצות לעיצוב אתרים מודרני.', content: '## CSS התפתח\n\nCSS מודרני מציע תכונות חזקות כמו CSS Grid, Container Queries ועוד...' }
      },
      'building-scalable-apis': {
        en: { title: 'Building Scalable APIs with Node.js', excerpt: 'A comprehensive guide to creating performant and maintainable APIs.', content: '## API Design Principles\n\nWhen building APIs, consider these key principles...' },
        ru: { title: 'Создание масштабируемых API на Node.js', excerpt: 'Полное руководство по созданию производительных и поддерживаемых API.', content: '## Принципы проектирования API\n\nПри создании API учитывайте следующие ключевые принципы...' },
        he: { title: 'בניית APIs מתרחבים עם Node.js', excerpt: 'מדריך מקיף ליצירת APIs יעילים וניתנים לתחזוקה.', content: '## עקרונות עיצוב API\n\nבעת בניית APIs, שקלו את העקרונות המרכזיים הבאים...' }
      }
    }

    for (const post of postData) {
      const { title, excerpt, content, ...data } = post
      const result = db.insert(schema.blogPosts).values(data).returning().get()
      const trans = postTranslations[post.slug]

      // Add translations for all locales
      for (const locale of ['en', 'ru', 'he'] as const) {
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `blog.post.${result.id}.title`, trans[locale].title, Date.now()
        )
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `blog.post.${result.id}.excerpt`, trans[locale].excerpt, Date.now()
        )
        sqlite.prepare(`INSERT OR IGNORE INTO translations (locale, key, value, updated_at) VALUES (?, ?, ?, ?)`).run(
          locale, `blog.post.${result.id}.content`, trans[locale].content, Date.now()
        )
      }

      // Add some tags to the first two posts
      if (allTags.length > 0 && postData.indexOf(post) < 2) {
        const tagsToAdd = allTags.slice(0, 3)
        for (const tag of tagsToAdd) {
          db.insert(schema.blogPostTags).values({
            postId: result.id,
            tagId: tag.id
          }).run()
        }
      }

      console.log(`   ✓ Post: ${title}`)
    }
  } else {
    console.log(`   ${existingPosts.length} blog posts exist, skipping.`)
  }

  console.log('\n✅ Database sync complete! Existing values preserved.\n')
  sqlite.close()
}

seed().catch(error => {
  console.error('❌ Seed failed:', error)
  sqlite.close()
  process.exit(1)
})
