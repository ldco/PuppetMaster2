<script setup lang="ts">
/**
 * AppBottomNav - Mobile App-Style Bottom Navigation
 * 
 * Used in app mode (admin panel) for phones (< 600px).
 * Material Design 3 inspired with PWA-ready safe area handling.
 * 
 * Uses global CSS:
 * - skeleton/bottom-nav.css: .bottom-nav, .bottom-nav-item, .bottom-nav-label
 * - ui/content/badges.css: .badge-dot
 */
import IconSettings from '~icons/tabler/settings'
import IconPhoto from '~icons/tabler/photo'
import IconMail from '~icons/tabler/mail'
import IconLanguage from '~icons/tabler/language'
import IconUsers from '~icons/tabler/users'

const { t } = useI18n()
const localePath = useLocalePath()
const { canManageUsers } = useAuth()
const { unreadCount } = useUnreadCount()

// Navigation items matching admin.vue sidebar - use localePath for locale-aware navigation
const navItems = computed(() => {
  const items = [
    { to: localePath('/admin/settings'), label: 'admin.settings', icon: IconSettings },
    { to: localePath('/admin/portfolio'), label: 'admin.portfolio', icon: IconPhoto },
    { to: localePath('/admin/contacts'), label: 'admin.contacts', icon: IconMail, badge: true },
    { to: localePath('/admin/translations'), label: 'admin.translations', icon: IconLanguage },
  ]
  if (canManageUsers.value) {
    items.push({ to: localePath('/admin/users'), label: 'admin.users', icon: IconUsers })
  }
  return items
})
</script>

<template>
  <nav class="bottom-nav" aria-label="Main navigation">
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav-item"
    >
      <span class="relative">
        <component :is="item.icon" class="bottom-nav-icon" />
        <span v-if="item.badge && unreadCount > 0" class="badge-dot">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </span>
      <span class="bottom-nav-label">{{ t(item.label) }}</span>
    </NuxtLink>
  </nav>
</template>

<!--
  Uses global CSS classes from skeleton/bottom-nav.css
  No scoped styles needed - following PuppetMaster CSS architecture
-->

