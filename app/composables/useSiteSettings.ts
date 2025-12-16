/**
 * useSiteSettings Composable
 *
 * Fetches runtime site settings from the API.
 * Settings are cached and can be refreshed on demand.
 *
 * Groups: site, contact, social, seo
 */

export interface SiteSettings {
  site: {
    name: string | null
    tagline: string | null
  }
  contact: {
    email: string | null
    phone: string | null
    location: string | null  // empty=hidden, address text, or "lat,lng" for map
  }
  social: {
    telegram: string | null
    instagram: string | null
    whatsapp: string | null
    facebook: string | null
    twitter: string | null
    linkedin: string | null
    youtube: string | null
    github: string | null
  }
  legal: {
    companyName: string | null  // For copyright: © 2024 {companyName}
    inn: string | null          // ИНН (Tax ID)
    ogrn: string | null         // ОГРН (Registration Number)
    address: string | null      // Legal address
    email: string | null        // Legal email
  }
  seo: {
    title: string | null
    description: string | null
  }
}

const defaultSettings: SiteSettings = {
  site: {
    name: 'Puppet Master',
    tagline: 'Studio Toolkit'
  },
  contact: {
    email: null,
    phone: null,
    location: null
  },
  social: {
    telegram: null,
    instagram: null,
    whatsapp: null,
    facebook: null,
    twitter: null,
    linkedin: null,
    youtube: null,
    github: null
  },
  legal: {
    companyName: null,
    inn: null,
    ogrn: null,
    address: null,
    email: null
  },
  seo: {
    title: null,
    description: null
  }
}

export function useSiteSettings() {
  // Use Nuxt's data fetching with caching
  const { data, pending, error, refresh } = useFetch<SiteSettings>('/api/settings', {
    key: 'site-settings',
    default: () => defaultSettings,
    transform: (raw: Record<string, Record<string, string | null>>) => {
      // Merge API response with defaults
      return {
        site: {
          ...defaultSettings.site,
          ...raw.site
        },
        contact: {
          ...defaultSettings.contact,
          ...raw.contact
        },
        social: {
          ...defaultSettings.social,
          ...raw.social
        },
        legal: {
          ...defaultSettings.legal,
          ...raw.legal
        },
        seo: {
          ...defaultSettings.seo,
          ...raw.seo
        }
      }
    }
  })

  // Computed helpers for common use cases
  const siteName = computed(() => data.value?.site.name || defaultSettings.site.name)
  const siteTagline = computed(() => data.value?.site.tagline || defaultSettings.site.tagline)
  const contactEmail = computed(() => data.value?.contact.email)
  const contactPhone = computed(() => data.value?.contact.phone)

  // Social links as array for iteration
  const socialLinks = computed(() => {
    const social = data.value?.social || {}
    return Object.entries(social)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([platform, url]) => ({ platform, url: url as string }))
  })

  // SEO meta
  const seoTitle = computed(() => data.value?.seo.title || siteName.value)
  const seoDescription = computed(() => data.value?.seo.description)

  return {
    // Raw data
    settings: data,
    isLoading: pending,
    error,
    refresh,

    // Helpers
    siteName,
    siteTagline,
    contactEmail,
    contactPhone,
    socialLinks,
    seoTitle,
    seoDescription
  }
}

