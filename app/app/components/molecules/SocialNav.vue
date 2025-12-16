<script setup lang="ts">
/**
 * SocialNav Molecule
 *
 * Config-driven social links navigation.
 * - Reads icon names from config
 * - Gets values from useSiteSettings()
 * - Only renders platforms that have URLs in database
 */
import config from '~/puppet-master.config'

// Import all social brand icons (Tabler)
// Icons are mapped by config icon name (e.g., 'brand-telegram')
import IconBrandTelegram from '~icons/tabler/brand-telegram'
import IconBrandInstagram from '~icons/tabler/brand-instagram'
import IconBrandWhatsapp from '~icons/tabler/brand-whatsapp'
import IconBrandFacebook from '~icons/tabler/brand-facebook'
import IconBrandYoutube from '~icons/tabler/brand-youtube'
import IconBrandLinkedin from '~icons/tabler/brand-linkedin'
import IconBrandX from '~icons/tabler/brand-x'
import IconBrandGithub from '~icons/tabler/brand-github'

// Icon map: config icon name → component
const iconMap: Record<string, Component> = {
  'brand-telegram': IconBrandTelegram,
  'brand-instagram': IconBrandInstagram,
  'brand-whatsapp': IconBrandWhatsapp,
  'brand-facebook': IconBrandFacebook,
  'brand-youtube': IconBrandYoutube,
  'brand-linkedin': IconBrandLinkedin,
  'brand-x': IconBrandX,
  'brand-github': IconBrandGithub
}

// Build platform → icon mapping from config
const platformIcons = computed(() => {
  const map: Record<string, string> = {}
  for (const setting of config.settings) {
    if (setting.group === 'social' && setting.icon) {
      // Extract platform name from key: 'social.telegram' → 'telegram'
      const platform = setting.key.split('.')[1]
      map[platform] = setting.icon
    }
  }
  return map
})

defineProps<{
  /** Vertical layout instead of horizontal */
  vertical?: boolean
  /** Show labels next to icons */
  showLabels?: boolean
}>()

// Get social links from settings (only those with values)
const { socialLinks } = useSiteSettings()

// Filter to only platforms we have icons for
const activeSocials = computed(() => {
  return socialLinks.value.filter(link => {
    const iconName = platformIcons.value[link.platform]
    return iconName && iconMap[iconName]
  })
})

// Get icon component for a platform
function getIcon(platform: string): Component | undefined {
  const iconName = platformIcons.value[platform]
  return iconName ? iconMap[iconName] : undefined
}
</script>

<template>
  <nav
    v-if="activeSocials.length > 0"
    class="social-nav"
    :class="{ 'social-nav--vertical': vertical }"
    aria-label="Social media links"
  >
    <a
      v-for="social in activeSocials"
      :key="social.platform"
      :href="social.url"
      class="social-nav-link"
      :class="`social-nav-link--${social.platform}`"
      :aria-label="social.platform"
      target="_blank"
      rel="noopener noreferrer"
    >
      <component :is="getIcon(social.platform)" class="social-nav-icon" />
      <span v-if="showLabels" class="social-nav-label">{{ social.platform }}</span>
    </a>
  </nav>
</template>

<style scoped>
.social-nav {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.social-nav--vertical {
  flex-direction: column;
  align-items: flex-start;
}

.social-nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.social-nav-link:hover {
  color: var(--brand);
}

.social-nav-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.social-nav-label {
  text-transform: capitalize;
  font-size: var(--text-sm);
}

/* Platform-specific hover colors (optional enhancement) */
.social-nav-link--telegram:hover { color: #0088cc; }
.social-nav-link--instagram:hover { color: #e4405f; }
.social-nav-link--whatsapp:hover { color: #25d366; }
.social-nav-link--facebook:hover { color: #1877f2; }
.social-nav-link--youtube:hover { color: #ff0000; }
.social-nav-link--linkedin:hover { color: #0a66c2; }
.social-nav-link--twitter:hover { color: #000000; }
.social-nav-link--github:hover { color: #333333; }
</style>

