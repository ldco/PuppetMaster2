<script setup lang="ts">
/**
 * HeaderContact Molecule
 *
 * Quick contact buttons for header - max 2 buttons (phone + messenger).
 * Best practice: Direct action links for instant contact.
 *
 * Uses contact settings from database:
 * - Phone: tel: link
 * - Messenger: telegram/whatsapp/viber URL
 *
 * Config-driven: Shows buttons based on headerContact.items config.
 */
import config from '~/puppet-master.config'

// Tabler icons for contact
import IconPhone from '~icons/tabler/phone'
import IconBrandTelegram from '~icons/tabler/brand-telegram'
import IconBrandWhatsapp from '~icons/tabler/brand-whatsapp'
import IconMail from '~icons/tabler/mail'

// Icon map
const iconMap: Record<string, Component> = {
  'phone': IconPhone,
  'brand-telegram': IconBrandTelegram,
  'brand-whatsapp': IconBrandWhatsapp,
  'mail': IconMail
}

// Get contact values from database
const { settings } = useSiteSettings()

// Helper to get nested value from settings using dot notation key
function getSettingValue(key: string): string | null {
  const [group, field] = key.split('.')
  const groupData = settings.value?.[group as keyof typeof settings.value]
  if (!groupData || typeof groupData !== 'object') return null
  return (groupData as Record<string, string | null>)[field] || null
}

// Build contact items from config (max 2)
const contactItems = computed(() => {
  const items: Array<{ key: string; url: string; icon: Component; label: string }> = []

  // Get configured header contact items (max 2)
  const configItems = config.headerContact?.items || ['contact.phone', 'social.telegram']

  for (const key of configItems.slice(0, 2)) {
    const value = getSettingValue(key)
    if (!value) continue

    // Find setting definition for icon
    const settingDef = config.settings.find(s => s.key === key)
    if (!settingDef?.icon) continue

    const iconComponent = iconMap[settingDef.icon]
    if (!iconComponent) continue

    // Build URL based on type
    let url = value
    if (key === 'contact.phone') {
      url = `tel:${value.replace(/\s/g, '')}`
    } else if (key === 'contact.email') {
      url = `mailto:${value}`
    }
    // Social URLs are already full URLs

    items.push({
      key,
      url,
      icon: iconComponent,
      label: settingDef.label
    })
  }

  return items
})
</script>

<template>
  <div v-if="contactItems.length > 0" class="header-contact">
    <a
      v-for="item in contactItems"
      :key="item.key"
      :href="item.url"
      class="header-contact-btn"
      :aria-label="item.label"
      target="_blank"
      rel="noopener noreferrer"
    >
      <component :is="item.icon" class="header-contact-icon" />
    </a>
  </div>
</template>

