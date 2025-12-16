/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTENT TRANSLATIONS - Client Editable (shown in Admin Panel)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * These translations are:
 *   ✓ Stored in database
 *   ✓ Editable via Admin Panel by client
 *   ✓ Site-specific content
 *
 * Categories (based on sections defined in puppet-master.config.ts):
 *   - hero.*      → Hero section content
 *   - about.*     → About section content
 *   - portfolio.* → Portfolio section content
 *   - services.*  → Services section content
 *   - contact.*   → Contact form labels and messages
 *   - seo.*       → SEO meta content
 *   - cta.*       → Call-to-action buttons text
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DEVELOPER WORKFLOW:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Create section component using t('section.key') for text
 * 2. Add default values here for all languages
 * 3. Run `npm run db:seed` to populate database
 * 4. Client edits via Admin > Translations
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const contentTranslations: Record<string, Record<string, any>> = {
  en: {
    seo: {
      homeTitle: 'Puppet Master - Pure CSS Studio Toolkit',
      homeDescription: 'A studio toolkit for creating stable, secure landing pages and portfolio sites.'
    },
    hero: {
      title: 'Puppet Master',
      subtitle: 'A studio toolkit for creating stable, secure landing pages and portfolio sites. Built with pure CSS - no Tailwind!',
      primaryCta: 'Get Started',
      secondaryCta: 'View Work'
    },
    about: {
      title: 'About the Project',
      paragraph1: 'Puppet Master is an opinionated studio toolkit designed for agencies and freelancers who need to quickly deploy professional landing pages and portfolio sites.',
      paragraph2: 'Built on Nuxt 4 with a pure CSS system (no Tailwind!), it features automatic dark mode, multi-language support with RTL, and a simple SQLite database for content management.'
    },
    portfolio: {
      title: 'Recent Work'
    },
    services: {
      title: 'Features'
    },
    contact: {
      title: 'Get in Touch',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: "email{'@'}example.com",
      messageLabel: 'Message',
      messagePlaceholder: 'How can we help?',
      sendButton: 'Send Message',
      sending: 'Sending...',
      successMessage: 'Message sent successfully!',
      errorMessage: 'Something went wrong. Please try again.'
    },
    cta: {
      footerButton: 'Get in Touch'
    }
  },

  ru: {
    seo: {
      homeTitle: 'Puppet Master - CSS инструментарий для студий',
      homeDescription: 'Инструментарий для создания стабильных и безопасных лендингов и портфолио сайтов.'
    },
    hero: {
      title: 'Puppet Master',
      subtitle: 'Инструментарий для создания стабильных и безопасных лендингов и портфолио сайтов. Чистый CSS - без Tailwind!',
      primaryCta: 'Начать',
      secondaryCta: 'Смотреть работы'
    },
    about: {
      title: 'О проекте',
      paragraph1: 'Puppet Master — это инструментарий для агентств и фрилансеров, которым нужно быстро разворачивать профессиональные лендинги и портфолио сайты.',
      paragraph2: 'Построен на Nuxt 4 с чистым CSS (без Tailwind!), включает автоматическую тёмную тему, мультиязычность с RTL и простую SQLite базу данных.'
    },
    portfolio: {
      title: 'Наши работы'
    },
    services: {
      title: 'Возможности'
    },
    contact: {
      title: 'Связаться с нами',
      nameLabel: 'Имя',
      namePlaceholder: 'Ваше имя',
      emailLabel: 'Email',
      emailPlaceholder: "email{'@'}example.com",
      messageLabel: 'Сообщение',
      messagePlaceholder: 'Чем мы можем помочь?',
      sendButton: 'Отправить',
      sending: 'Отправка...',
      successMessage: 'Сообщение отправлено!',
      errorMessage: 'Что-то пошло не так. Попробуйте ещё раз.'
    },
    cta: {
      footerButton: 'Связаться'
    }
  },

  he: {
    seo: {
      homeTitle: 'דף הבית',
      homeDescription: 'ברוך הבא לאתרנו – פתרונות דיגיטליים מותאמים אישית'
    },
    hero: {
      title: 'ברוכים הבאים',
      subtitle: 'יוצרים חוויות דיגיטליות יוצאות דופן',
      primaryCta: 'התחילו עכשיו',
      secondaryCta: 'למדו עוד'
    },
    about: {
      title: 'אודות',
      paragraph1: 'אנחנו צוות יצירתי ומקצועי המתמחה בפיתוח אתרים, יישומים ופתרונות דיגיטליים מותאמים אישית לצרכים הייחודיים של כל לקוח.',
      paragraph2: 'מאמינים בשילוב של טכנולוגיה, עיצוב וחדשנות כדי לספק מוצרים איכותיים, תפקודיים ויעילים.'
    },
    portfolio: {
      title: 'תיק העבודות שלנו'
    },
    services: {
      title: 'השירותים שלנו'
    },
    contact: {
      title: 'צרו קשר',
      nameLabel: 'שם',
      namePlaceholder: 'הכנס שם',
      emailLabel: 'דוא"ל',
      emailPlaceholder: "example{'@'}email.com",
      messageLabel: 'הודעה',
      messagePlaceholder: 'השאר את ההודעה שלך כאן...',
      sendButton: 'שלח הודעה',
      sending: 'שולח...',
      successMessage: 'הודעתך נשלחה בהצלחה!',
      errorMessage: 'אירעה שגיאה בשליחה. נסה שוב מאוחרת.'
    },
    cta: {
      footerButton: 'צרו קשר'
    }
  }
}

/**
 * Flatten nested object to dot-notation keys
 */
function flattenTranslations(
  obj: Record<string, any>,
  prefix = ''
): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenTranslations(value, fullKey))
    } else {
      result.push({ key: fullKey, value: String(value) })
    }
  }

  return result
}

/**
 * Get all content translations as flat array ready for DB insert
 * Used by seed script
 */
export function getContentSeedData(): Array<{ locale: string; key: string; value: string }> {
  const result: Array<{ locale: string; key: string; value: string }> = []

  for (const [locale, messages] of Object.entries(contentTranslations)) {
    const flat = flattenTranslations(messages)
    for (const { key, value } of flat) {
      result.push({ locale, key, value })
    }
  }

  return result
}

