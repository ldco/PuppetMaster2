<script setup lang="ts">
/**
 * Admin Layout - App Visual Mode
 *
 * Responsive navigation following Material Design 3:
 * - Phone (< 600px): Bottom navigation bar
 * - Tablet portrait (600-839px): Navigation rail (narrow sidebar)
 * - Tablet landscape / Desktop (≥ 840px): Full sidebar
 *
 * Uses existing CSS system:
 * - layout/page.css: .layout-admin responsive styles
 * - skeleton/nav.css: .sidebar-nav, .sidebar-nav-link, .sidebar-icon-btn
 * - skeleton/bottom-nav.css: .bottom-nav, .bottom-nav-item
 *
 * Auth is handled by middleware (app/middleware/auth.ts)
 */
import config from '~/puppet-master.config'
import IconSettings from '~icons/tabler/settings'
import IconPhoto from '~icons/tabler/photo'
import IconMail from '~icons/tabler/mail'
import IconLanguage from '~icons/tabler/language'
import IconUsers from '~icons/tabler/users'
import IconLogout from '~icons/tabler/logout'
import IconSun from '~icons/tabler/sun'
import IconMoon from '~icons/tabler/moon'

const { t, locale, locales, setLocale } = useI18n()
const colorMode = useColorMode()
const { logout, isLoading, canManageUsers } = useAuth()
const { shortLogo } = useLogo()

// Unread messages count - shared state
const { unreadCount, fetchUnreadCount } = useUnreadCount()

// Fetch immediately and refresh periodically
fetchUnreadCount()
let interval: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  interval = setInterval(fetchUnreadCount, 30000) // 30 seconds
})
onUnmounted(() => {
  if (interval) clearInterval(interval)
})

// Base admin links
const baseLinks = [
  { to: '/admin/settings', label: 'admin.settings', icon: IconSettings },
  { to: '/admin/portfolio', label: 'admin.portfolio', icon: IconPhoto },
  { to: '/admin/contacts', label: 'admin.contacts', icon: IconMail, badge: true },
  { to: '/admin/translations', label: 'admin.translations', icon: IconLanguage },
]

// Conditionally add Users link for admin+ roles
const adminLinks = computed(() => {
  const links = [...baseLinks]
  if (canManageUsers.value) {
    links.push({ to: '/admin/users', label: 'admin.users', icon: IconUsers })
  }
  return links
})

async function handleLogout() {
  await logout()
}

function toggleTheme() {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

function cycleLocale() {
  const availableLocales = locales.value.map((l: any) => l.code)
  const currentIndex = availableLocales.indexOf(locale.value)
  const nextIndex = (currentIndex + 1) % availableLocales.length
  setLocale(availableLocales[nextIndex])
}

</script>

<template>
  <div class="layout-admin">
    <!-- Sidebar (visible on tablet+ via CSS, hidden on phones) -->
    <aside v-if="config.features.appVerticalNav" class="admin-sidebar">
      <!-- Logo (short/circle version) - ClientOnly to avoid SSR hydration mismatch -->
      <div class="sidebar-header">
        <NuxtLink to="/admin">
          <ClientOnly>
            <img :src="shortLogo" alt="Logo" class="logo-img" />
            <template #fallback>
              <img :src="`${config.logo.basePath}/circle_${config.defaultTheme === 'dark' ? 'light' : 'dark'}_${config.defaultLocale}.svg`" alt="Logo" class="logo-img" />
            </template>
          </ClientOnly>
        </NuxtLink>
      </div>

      <!-- Nav links with tooltips -->
      <nav class="sidebar-nav">
        <NuxtLink
          v-for="link in adminLinks"
          :key="link.to"
          :to="link.to"
          class="sidebar-nav-link"
        >
          <span class="relative">
            <component :is="link.icon" />
            <span v-if="link.badge && unreadCount > 0" class="badge-dot">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </span>
          <span class="sidebar-tooltip">{{ t(link.label) }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer actions -->
      <div class="sidebar-footer">
        <!-- Theme toggle - ClientOnly to avoid SSR hydration mismatch -->
        <ClientOnly>
          <button type="button" class="sidebar-icon-btn" @click="toggleTheme">
            <IconSun v-if="colorMode.preference === 'dark'" />
            <IconMoon v-else />
            <span class="sidebar-tooltip">{{ colorMode.preference === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
          </button>
          <template #fallback>
            <button type="button" class="sidebar-icon-btn">
              <IconSun />
              <span class="sidebar-tooltip">Theme</span>
            </button>
          </template>
        </ClientOnly>

        <!-- Language -->
        <button type="button" class="sidebar-icon-btn" @click="cycleLocale">
          <IconLanguage />
          <span class="sidebar-tooltip">{{ locale.toUpperCase() }}</span>
        </button>

        <!-- Logout -->
        <button
          type="button"
          class="sidebar-icon-btn"
          @click="handleLogout"
          :disabled="isLoading"
        >
          <IconLogout />
          <span class="sidebar-tooltip">{{ t('auth.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Global UI Components -->
    <OrganismsConfirmDialog />
    <OrganismsToastContainer />

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Mobile header (phones only - now just shows title, no hamburger) -->
      <header v-if="config.features.appVerticalNav" class="admin-header mobile-only">
        <span class="admin-title">{{ t('admin.title') }}</span>
      </header>

      <div class="admin-content">
        <slot />
      </div>
    </main>

    <!-- Bottom Navigation (phones only < 600px) -->
    <MoleculesAppBottomNav v-if="config.features.appVerticalNav" />
  </div>
</template>

<!--
  Uses global CSS classes:
  - layout/page.css: .layout-admin responsive styles (phone/tablet/desktop)
  - skeleton/nav.css: .sidebar-nav, .sidebar-nav-link, .sidebar-icon-btn, .sidebar-tooltip
  - skeleton/bottom-nav.css: .bottom-nav, .bottom-nav-item (phone only)
  - skeleton/mobile-nav.css: .mobile-nav-backdrop
  - ui/buttons.css: .btn, .btn-icon, .btn-ghost
  - ui/content/badges.css: .badge-dot
  - layout/responsive.css: .mobile-only
-->

