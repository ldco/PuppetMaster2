/**
 * Seed Translations Data
 *
 * This file contains the DEFAULT translations for a fresh install.
 * Run `npm run db:seed` to populate the database with these values.
 *
 * NO FALLBACKS - all text comes from database only!
 * If translation is missing, the key shows (making problem obvious).
 *
 * Structure:
 * - Each locale has its own complete set of translations
 * - These are inserted into the `translations` table on seed
 */

export const seedTranslations: Record<string, Record<string, any>> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      close: 'Close',
      submit: 'Submit',
      saving: 'Saving...',
      success: 'Success',
      theme: 'Theme',
      language: 'Language'
    },
    nav: {
      home: 'Home',
      about: 'About',
      portfolio: 'Portfolio',
      services: 'Services',
      contact: 'Contact',
      openMenu: 'Open menu',
      closeMenu: 'Close menu'
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember me',
      loginFailed: 'Login failed. Check your credentials.'
    },
    admin: {
      title: 'Admin',
      dashboard: 'Dashboard',
      settings: 'Settings',
      // Dashboard
      welcome: 'Welcome, {name}',
      dashboardSubtitle: 'Manage your website content',
      portfolioItems: 'Portfolio Items',
      contactMessages: 'Contact Messages',
      unreadMessages: 'Unread Messages',
      quickActions: 'Quick Actions',
      managePortfolio: 'Manage Portfolio',
      viewMessages: 'View Messages',
      siteSettings: 'Site Settings',
      // Portfolio
      portfolio: 'Portfolio',
      addItem: 'Add Item',
      editItem: 'Edit',
      deleteItem: 'Delete',
      noItems: 'No items yet. Add your first portfolio item!',
      confirmDelete: 'Are you sure you want to delete this item?',
      // Contacts
      contacts: 'Contact Messages',
      noMessages: 'No messages yet.',
      markRead: 'Mark as read',
      markUnread: 'Mark as unread',
      // Settings
      settingsSite: 'Site Information',
      siteName: 'Site Name',
      siteTagline: 'Tagline',
      settingsContact: 'Contact Information',
      contactEmail: 'Email',
      contactPhone: 'Phone',
      contactAddress: 'Address',
      settingsSocial: 'Social Links',
      settingsSeo: 'SEO Settings',
      seoTitle: 'Meta Title',
      seoDescription: 'Meta Description',
      settingsSaved: 'Settings saved successfully!',
      // Translations
      translations: 'Translations',
      translationsSubtitle: 'Manage all text content across languages',
      addTranslation: 'Add Translation',
      translationKey: 'Key',
      translationValue: 'Value',
      noTranslations: 'No translations yet.'
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    },
    footer: {
      rights: 'All rights reserved',
      navigation: 'Navigation',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      madeWith: 'Made with',
      puppetMaster: 'Puppet Master',
      ctaDefault: 'Get in Touch',
      backToTop: 'Back to top'
    },
    // Website sections - all editable via Admin Panel
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
    }
  },

  // Russian - complete translations
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Что-то пошло не так',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      close: 'Закрыть',
      submit: 'Отправить',
      saving: 'Сохранение...',
      success: 'Успешно',
      theme: 'Тема',
      language: 'Язык'
    },
    nav: {
      home: 'Главная',
      about: 'О нас',
      portfolio: 'Портфолио',
      services: 'Услуги',
      contact: 'Контакты',
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню'
    },
    auth: {
      login: 'Войти',
      logout: 'Выйти',
      email: 'Email',
      password: 'Пароль',
      rememberMe: 'Запомнить меня',
      loginFailed: 'Ошибка входа. Проверьте данные.'
    },
    admin: {
      title: 'Админ',
      dashboard: 'Панель управления',
      settings: 'Настройки',
      welcome: 'Добро пожаловать, {name}',
      dashboardSubtitle: 'Управляйте контентом сайта',
      portfolioItems: 'Элементы портфолио',
      contactMessages: 'Сообщения',
      unreadMessages: 'Непрочитанные',
      quickActions: 'Быстрые действия',
      managePortfolio: 'Управление портфолио',
      viewMessages: 'Просмотр сообщений',
      siteSettings: 'Настройки сайта',
      portfolio: 'Портфолио',
      addItem: 'Добавить',
      editItem: 'Редактировать',
      deleteItem: 'Удалить',
      noItems: 'Пока нет элементов. Добавьте первый!',
      confirmDelete: 'Вы уверены, что хотите удалить?',
      contacts: 'Сообщения',
      noMessages: 'Пока нет сообщений.',
      markRead: 'Отметить как прочитанное',
      markUnread: 'Отметить как непрочитанное',
      settingsSite: 'Информация о сайте',
      siteName: 'Название сайта',
      siteTagline: 'Слоган',
      settingsContact: 'Контактная информация',
      contactEmail: 'Email',
      contactPhone: 'Телефон',
      contactAddress: 'Адрес',
      settingsSocial: 'Социальные сети',
      settingsSeo: 'SEO настройки',
      seoTitle: 'Мета-заголовок',
      seoDescription: 'Мета-описание',
      settingsSaved: 'Настройки сохранены!',
      translations: 'Переводы',
      translationsSubtitle: 'Управление текстами на всех языках',
      addTranslation: 'Добавить перевод',
      translationKey: 'Ключ',
      translationValue: 'Значение',
      noTranslations: 'Пока нет переводов.'
    },
    theme: {
      light: 'Светлая',
      dark: 'Тёмная',
      system: 'Системная'
    },
    footer: {
      rights: 'Все права защищены',
      navigation: 'Навигация',
      contact: 'Контакты',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      madeWith: 'Сделано с',
      puppetMaster: 'Puppet Master',
      ctaDefault: 'Связаться',
      backToTop: 'Наверх'
    },
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
    }
  },

  // Hebrew - complete translations
  he: {
    common: {
      loading: 'טוען...',
      error: 'שגיאה',
      save: 'שמור',
      cancel: 'ביטול',
      delete: 'מחק',
      edit: 'ערוך',
      create: 'צור',
      close: 'סגור',
      submit: 'שלח',
      saving: 'שומר...',
      success: 'הצלחה',
      theme: 'ערכת נושא',
      language: 'שפה'
    },
    nav: {
      home: 'דף הבית',
      about: 'אודות',
      portfolio: 'תיק עבודות',
      services: 'שירותים',
      contact: 'יצירת קשר',
      openMenu: 'פתח תפריט',
      closeMenu: 'סגור תפריט'
    },
    auth: {
      login: 'התחברות',
      logout: 'התנתקות',
      email: 'דוא"ל',
      password: 'סיסמה',
      rememberMe: 'זכור אותי',
      loginFailed: 'ההתחברות נכשלה'
    },
    admin: {
      title: 'ניהול',
      dashboard: 'לוח בקרה',
      settings: 'הגדרות',
      welcome: 'ברוך הבא',
      dashboardSubtitle: 'סקירה כללית של האתר שלך',
      portfolioItems: 'פריטי תיק העבודות',
      contactMessages: 'הודעות יצירת קשר',
      unreadMessages: 'הודעות שלא נקראו',
      quickActions: 'פעולות מהירות',
      managePortfolio: 'נהל תיק עבודות',
      viewMessages: 'הצג הודעות',
      siteSettings: 'הגדרות אתר',
      portfolio: 'תיק עבודות',
      addItem: 'הוסף פריט',
      editItem: 'ערוך פריט',
      deleteItem: 'מחק פריט',
      noItems: 'אין פריטים',
      confirmDelete: 'האם למחוק פריט זה?',
      contacts: 'יצירת קשר',
      noMessages: 'אין הודעות',
      markRead: 'סמן כנקרא',
      markUnread: 'סמן כלא נקרא',
      settingsSite: 'הגדרות כלליות',
      siteName: 'שם האתר',
      siteTagline: 'סלוגן האתר',
      settingsContact: 'פרטי יצירת קשר',
      contactEmail: 'דוא"ל ליצירת קשר',
      contactPhone: 'טלפון ליצירת קשר',
      contactAddress: 'כתובת',
      settingsSocial: 'רשתות חברתיות',
      settingsSeo: 'SEO',
      seoTitle: 'כותרת SEO',
      seoDescription: 'תיאור SEO',
      settingsSaved: 'ההגדרות נשמרו בהצלחה',
      translations: 'תרגומים',
      translationsSubtitle: 'נהל מפתחות ומחרוזות תרגום',
      addTranslation: 'הוסף תרגום',
      translationKey: 'מפתח תרגום',
      translationValue: 'ערך תרגום',
      noTranslations: 'אין תרגומים'
    },
    theme: {
      light: 'בהיר',
      dark: 'אפל',
      system: 'כברירת המחדל של המערכת'
    },
    footer: {
      rights: 'כל הזכויות שמורות',
      navigation: 'ניווט',
      contact: 'יצירת קשר',
      privacy: 'מדיניות פרטיות',
      terms: 'תנאי שימוש',
      madeWith: 'נבנה עם',
      puppetMaster: 'Puppet Master',
      ctaDefault: 'צרו קשר',
      backToTop: 'חזרה למעלה'
    },
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
    }
  }
}

/**
 * Flatten nested object to dot-notation keys
 * e.g., { nav: { home: 'Home' } } → { 'nav.home': 'Home' }
 */
export function flattenTranslations(
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
 * Get all seed translations as flat array ready for DB insert
 */
export function getSeedData(): Array<{ locale: string; key: string; value: string }> {
  const result: Array<{ locale: string; key: string; value: string }> = []

  for (const [locale, messages] of Object.entries(seedTranslations)) {
    const flat = flattenTranslations(messages)
    for (const { key, value } of flat) {
      result.push({ locale, key, value })
    }
  }

  return result
}
