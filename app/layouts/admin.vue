<script setup lang="ts">
/**
 * Admin Layout
 *
 * Narrow icon-only sidebar with hover tooltips.
 * Uses existing CSS system:
 * - layout/page.css: .layout-admin grid
 * - skeleton/nav.css: .sidebar-nav, .sidebar-nav-link, .sidebar-icon-btn
 *
 * Auth is handled by middleware (app/middleware/auth.ts)
 */
import config from '~/puppet-master.config'
import IconDashboard from '~icons/tabler/dashboard'
import IconSettings from '~icons/tabler/settings'
import IconPhoto from '~icons/tabler/photo'
import IconMail from '~icons/tabler/mail'
import IconLanguage from '~icons/tabler/language'
import IconUsers from '~icons/tabler/users'
import IconLogout from '~icons/tabler/logout'
import IconMenu from '~icons/tabler/menu-2'
import IconSun from '~icons/tabler/sun'
import IconMoon from '~icons/tabler/moon'

const { t, locale, locales, setLocale } = useI18n()
const colorMode = useColorMode()
const { user, logout, isLoading, canManageUsers } = useAuth()
const { shortLogo } = useLogo()

const isMobileSidebarOpen = ref(false)

// Base admin links
const baseLinks = [
  { to: '/admin', label: 'admin.dashboard', icon: IconDashboard, exact: true },
  { to: '/admin/settings', label: 'admin.settings', icon: IconSettings },
  { to: '/admin/portfolio', label: 'admin.portfolio', icon: IconPhoto },
  { to: '/admin/contacts', label: 'admin.contacts', icon: IconMail },
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

// Close mobile sidebar on route change
const route = useRoute()
watch(() => route.path, () => {
  isMobileSidebarOpen.value = false
})
</script>

<template>
  <div class="layout-admin" :class="{ 'sidebar-open': isMobileSidebarOpen }">
    <!-- Narrow icon sidebar (when adminVerticalNav is true) -->
    <aside v-if="config.features.adminVerticalNav" class="admin-sidebar" :class="{ 'is-open': isMobileSidebarOpen }">
      <!-- Logo (short/circle version) -->
      <div class="sidebar-header">
        <NuxtLink to="/admin">
          <img :src="shortLogo" alt="Logo" class="logo-img" />
        </NuxtLink>
      </div>

      <!-- Nav links with tooltips -->
      <nav class="sidebar-nav">
        <NuxtLink
          v-for="link in adminLinks"
          :key="link.to"
          :to="link.to"
          class="sidebar-nav-link"
          :exact="link.exact"
        >
          <component :is="link.icon" />
          <span class="sidebar-tooltip">{{ t(link.label) }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer actions -->
      <div class="sidebar-footer">
        <!-- Theme toggle -->
        <button type="button" class="sidebar-icon-btn" @click="toggleTheme">
          <IconSun v-if="colorMode.preference === 'dark'" />
          <IconMoon v-else />
          <span class="sidebar-tooltip">{{ colorMode.preference === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
        </button>

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

    <!-- Mobile sidebar backdrop -->
    <div
      v-if="isMobileSidebarOpen"
      class="mobile-nav-backdrop"
      @click="isMobileSidebarOpen = false"
    />

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Mobile header with hamburger -->
      <header v-if="config.features.adminVerticalNav" class="admin-header mobile-only">
        <button
          type="button"
          class="btn btn-icon btn-ghost"
          @click="isMobileSidebarOpen = !isMobileSidebarOpen"
          aria-label="Toggle menu"
        >
          <IconMenu />
        </button>
        <span class="admin-title">{{ t('admin.title') }}</span>
      </header>

      <div class="admin-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<!--
  Uses global CSS classes:
  - layout/page.css: .layout-admin, .admin-sidebar, .admin-main
  - skeleton/nav.css: .sidebar-nav, .sidebar-nav-link, .sidebar-icon-btn, .sidebar-tooltip
  - skeleton/mobile-nav.css: .mobile-nav-backdrop
  - ui/buttons.css: .btn, .btn-icon, .btn-ghost
  - layout/responsive.css: .mobile-only
-->

<!--
  Uses global CSS classes:
  - layout/page.css: .layout-admin, .admin-sidebar, .admin-main
  - admin/index.css: .admin-header, .admin-title, .admin-content
  - skeleton/nav.css: .sidebar-nav, .sidebar-nav-link, .sidebar-icon-btn, .sidebar-tooltip
  - skeleton/mobile-nav.css: .mobile-nav-backdrop
  - ui/buttons.css: .btn, .btn-icon, .btn-ghost
  - layout/responsive.css: .mobile-only
-->

