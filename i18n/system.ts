/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYSTEM TRANSLATIONS - Developer Controlled (NOT editable in Admin Panel)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * These translations are:
 *   ✓ Version controlled in git
 *   ✓ Shared across all Puppet Master sites
 *   ✓ Cannot be broken by client
 *   ✗ NOT visible in Admin Panel
 *
 * Categories:
 *   - common.*    → Shared UI (loading, save, cancel)
 *   - nav.*       → Navigation labels
 *   - auth.*      → Login/logout
 *   - admin.*     → Admin panel UI
 *   - theme.*     → Theme switcher
 *   - footer.ui.* → Footer system text (rights, navigation, madeWith)
 *   - validation.* → Form validation messages
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const systemTranslations: Record<string, Record<string, any>> = {
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
      language: 'Language',
      confirm: 'Confirm',
      more: 'More'
    },
    nav: {
      home: 'Home',
      about: 'About',
      portfolio: 'Portfolio',
      services: 'Services',
      contact: 'Contact',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      skipToContent: 'Skip to content'
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
      welcome: 'Welcome, {name}',
      dashboardSubtitle: 'Manage your website content',
      portfolioItems: 'Portfolio Items',
      contactMessages: 'Contact Messages',
      unreadMessages: 'Unread Messages',
      quickActions: 'Quick Actions',
      managePortfolio: 'Manage Portfolio',
      viewMessages: 'View Messages',
      siteSettings: 'Site Settings',
      portfolio: 'Portfolio',
      // Short nav labels for bottom navigation (single words only)
      navSettings: 'Settings',
      navPortfolio: 'Works',
      navContacts: 'Inbox',
      navTranslations: 'Texts',
      navUsers: 'Users',
      navHealth: 'Health',
      health: 'Server Health',
      healthComingSoon: 'Health metrics coming soon...',
      // Settings page group labels
      settingsContact: 'Contact Info',
      settingsSocial: 'Social Links',
      settingsLegal: 'Legal Info',
      settingsFooter: 'Footer',
      settingsSeo: 'SEO & Meta',
      settingsAnalytics: 'Analytics',
      settingsVerification: 'Verification',
      addItem: 'Add Item',
      editItem: 'Edit',
      deleteItem: 'Delete',
      noItems: 'No items yet. Add your first portfolio item!',
      confirmDelete: 'Are you sure you want to delete this item?',
      contacts: 'Contact Messages',
      noMessages: 'No messages yet.',
      noSubject: '(No subject)',
      selectMessage: 'Select a message to view',
      from: 'From',
      phone: 'Phone',
      date: 'Date',
      markRead: 'Mark as read',
      markUnread: 'Mark as unread',
      settingsSite: 'Site Information',
      siteName: 'Site Name',
      siteTagline: 'Tagline',
      contactEmail: 'Email',
      contactPhone: 'Phone',
      contactAddress: 'Address',
      seoTitle: 'Meta Title',
      seoDescription: 'Meta Description',
      settingsSaved: 'Settings saved successfully!',
      translations: 'Translations',
      translationsSubtitle: 'Manage site content text',
      addTranslation: 'Add Translation',
      translationKey: 'Key',
      translationValue: 'Value',
      noTranslations: 'No translations yet.',
      // Users management
      users: 'Users',
      addUser: 'Add User',
      editUser: 'Edit User',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      created: 'Created',
      actions: 'Actions',
      leaveBlankToKeep: 'Leave blank to keep current',
      // Portfolio form fields
      itemTitle: 'Title',
      slug: 'Slug',
      category: 'Category',
      order: 'Order',
      description: 'Description',
      tags: 'Tags',
      tagsHint: 'Comma-separated',
      image: 'Image',
      published: 'Published',
      // User menu
      userMenu: 'User menu'
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System'
    },
    footer: {
      // UI labels (system)
      rights: 'All rights reserved',
      navigation: 'Navigation',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      madeWith: 'Made with',
      puppetMaster: 'Puppet Master',
      backToTop: 'Back to top'
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be at most {max} characters'
    }
  },

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
      language: 'Язык',
      confirm: 'Подтвердить',
      more: 'Ещё'
    },
    nav: {
      home: 'Главная',
      about: 'О нас',
      portfolio: 'Портфолио',
      services: 'Услуги',
      contact: 'Контакты',
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      skipToContent: 'Перейти к содержимому'
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
      // Short nav labels for bottom navigation (single words only)
      navSettings: 'Настройки',
      navPortfolio: 'Работы',
      navContacts: 'Почта',
      navTranslations: 'Тексты',
      navUsers: 'Юзеры',
      navHealth: 'Статус',
      health: 'Состояние сервера',
      healthComingSoon: 'Метрики скоро появятся...',
      // Settings page group labels
      settingsContact: 'Контактная информация',
      settingsSocial: 'Социальные сети',
      settingsLegal: 'Юридическая информация',
      settingsFooter: 'Подвал сайта',
      settingsSeo: 'SEO и мета-данные',
      settingsAnalytics: 'Аналитика',
      settingsVerification: 'Верификация',
      addItem: 'Добавить',
      editItem: 'Редактировать',
      deleteItem: 'Удалить',
      noItems: 'Пока нет элементов. Добавьте первый!',
      confirmDelete: 'Вы уверены, что хотите удалить?',
      contacts: 'Сообщения',
      noMessages: 'Пока нет сообщений.',
      noSubject: '(Без темы)',
      selectMessage: 'Выберите сообщение',
      from: 'От',
      phone: 'Телефон',
      date: 'Дата',
      markRead: 'Отметить как прочитанное',
      markUnread: 'Отметить как непрочитанное',
      settingsSite: 'Информация о сайте',
      siteName: 'Название сайта',
      siteTagline: 'Слоган',
      contactEmail: 'Email',
      contactPhone: 'Телефон',
      contactAddress: 'Адрес',
      seoTitle: 'Мета-заголовок',
      seoDescription: 'Мета-описание',
      settingsSaved: 'Настройки сохранены!',
      translations: 'Переводы',
      translationsSubtitle: 'Управление текстами сайта',
      addTranslation: 'Добавить перевод',
      translationKey: 'Ключ',
      translationValue: 'Значение',
      noTranslations: 'Пока нет переводов.',
      // Users management
      users: 'Пользователи',
      addUser: 'Добавить пользователя',
      editUser: 'Редактировать пользователя',
      name: 'Имя',
      email: 'Email',
      password: 'Пароль',
      role: 'Роль',
      created: 'Создан',
      actions: 'Действия',
      leaveBlankToKeep: 'Оставьте пустым для сохранения текущего',
      // Portfolio form fields
      itemTitle: 'Название',
      slug: 'Слаг',
      category: 'Категория',
      order: 'Порядок',
      description: 'Описание',
      tags: 'Теги',
      tagsHint: 'Через запятую',
      image: 'Изображение',
      published: 'Опубликовано',
      // User menu
      userMenu: 'Меню пользователя'
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
      backToTop: 'Наверх'
    },
    validation: {
      required: 'Обязательное поле',
      email: 'Введите корректный email',
      minLength: 'Минимум {min} символов',
      maxLength: 'Максимум {max} символов'
    }
  },

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
      language: 'שפה',
      confirm: 'אישור',
      more: 'עוד'
    },
    nav: {
      home: 'דף הבית',
      about: 'אודות',
      portfolio: 'תיק עבודות',
      services: 'שירותים',
      contact: 'יצירת קשר',
      openMenu: 'פתח תפריט',
      closeMenu: 'סגור תפריט',
      skipToContent: 'דלג לתוכן'
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
      // Short nav labels for bottom navigation (single words only)
      navSettings: 'הגדרות',
      navPortfolio: 'עבודות',
      navContacts: 'הודעות',
      navTranslations: 'טקסטים',
      navUsers: 'משתמשים',
      navHealth: 'בריאות',
      health: 'מצב השרת',
      healthComingSoon: 'מדדי בריאות בקרוב...',
      // Settings page group labels
      settingsContact: 'פרטי התקשרות',
      settingsSocial: 'רשתות חברתיות',
      settingsLegal: 'מידע משפטי',
      settingsFooter: 'כותרת תחתונה',
      settingsSeo: 'SEO ומטא-נתונים',
      settingsAnalytics: 'אנליטיקה',
      settingsVerification: 'אימות',
      addItem: 'הוסף פריט',
      editItem: 'ערוך פריט',
      deleteItem: 'מחק פריט',
      noItems: 'אין פריטים',
      confirmDelete: 'האם למחוק פריט זה?',
      contacts: 'יצירת קשר',
      noMessages: 'אין הודעות',
      noSubject: '(ללא נושא)',
      selectMessage: 'בחר הודעה לצפייה',
      from: 'מאת',
      phone: 'טלפון',
      date: 'תאריך',
      markRead: 'סמן כנקרא',
      markUnread: 'סמן כלא נקרא',
      settingsSite: 'הגדרות כלליות',
      siteName: 'שם האתר',
      siteTagline: 'סלוגן האתר',
      contactEmail: 'דוא"ל ליצירת קשר',
      contactPhone: 'טלפון ליצירת קשר',
      contactAddress: 'כתובת',
      seoTitle: 'כותרת SEO',
      seoDescription: 'תיאור SEO',
      settingsSaved: 'ההגדרות נשמרו בהצלחה',
      translations: 'תרגומים',
      translationsSubtitle: 'נהל תוכן האתר',
      addTranslation: 'הוסף תרגום',
      translationKey: 'מפתח תרגום',
      translationValue: 'ערך תרגום',
      noTranslations: 'אין תרגומים',
      // Users management
      users: 'משתמשים',
      addUser: 'הוסף משתמש',
      editUser: 'ערוך משתמש',
      name: 'שם',
      email: 'דוא"ל',
      password: 'סיסמה',
      role: 'תפקיד',
      created: 'נוצר',
      actions: 'פעולות',
      leaveBlankToKeep: 'השאר ריק לשמירת הנוכחי',
      // Portfolio form fields
      itemTitle: 'כותרת',
      slug: 'מזהה',
      category: 'קטגוריה',
      order: 'סדר',
      description: 'תיאור',
      tags: 'תגיות',
      tagsHint: 'מופרדות בפסיק',
      image: 'תמונה',
      published: 'פורסם',
      // User menu
      userMenu: 'תפריט משתמש'
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
      backToTop: 'חזרה למעלה'
    },
    validation: {
      required: 'שדה חובה',
      email: 'הזן כתובת דוא"ל תקינה',
      minLength: 'לפחות {min} תווים',
      maxLength: 'לא יותר מ-{max} תווים'
    }
  }
}

// System prefixes - keys starting with these are NOT editable in Admin Panel
export const SYSTEM_PREFIXES = [
  'common.',
  'nav.',
  'auth.',
  'admin.',
  'theme.',
  'footer.',
  'validation.'
] as const

/**
 * Check if a translation key is a system key (not client-editable)
 */
export function isSystemKey(key: string): boolean {
  return SYSTEM_PREFIXES.some(prefix => key.startsWith(prefix))
}

/**
 * Flatten nested object to dot-notation keys
 */
export function flattenTranslations(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value, fullKey))
    } else {
      result[fullKey] = String(value)
    }
  }

  return result
}

/**
 * Get flattened system translations for a specific locale
 */
export function getSystemTranslationsFlat(locale: string): Record<string, string> {
  const messages = systemTranslations[locale] ?? systemTranslations['en']!
  return flattenTranslations(messages)
}

/**
 * Get nested system translations for a specific locale
 * Used by i18n loader - Vue I18n expects nested objects
 */
export function getSystemTranslations(locale: string): Record<string, any> {
  return systemTranslations[locale] ?? systemTranslations['en'] ?? {}
}
