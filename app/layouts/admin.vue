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
const { user, logout, isLoading, canManageUsers } = useAuth()
const { shortLogo } = useLogo()

// User menu panel state
const userMenuOpen = ref(false)

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

// Get user initials for avatar
const userInitials = computed(() => {
  if (!user.value) return '?'
  if (user.value.name) {
    return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return user.value.email?.[0]?.toUpperCase() ?? '?'
})

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

// Language switcher panel state
const langPanelOpen = ref(false)

function toggleLangPanel() {
  langPanelOpen.value = !langPanelOpen.value
}

function selectLocale(code: 'en' | 'ru' | 'he') {
  setLocale(code)
  langPanelOpen.value = false
}

// Close panels on click outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.sidebar-lang-wrapper')) {
    langPanelOpen.value = false
  }
  if (!target.closest('.sidebar-user-wrapper')) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
        <!-- Theme toggle - no tooltip needed (sun/moon is self-explanatory) -->
        <ClientOnly>
          <button type="button" class="sidebar-icon-btn" @click="toggleTheme" :aria-label="colorMode.preference === 'dark' ? 'Light mode' : 'Dark mode'">
            <IconSun v-if="colorMode.preference === 'dark'" />
            <IconMoon v-else />
          </button>
          <template #fallback>
            <button type="button" class="sidebar-icon-btn" aria-label="Theme">
              <IconSun />
            </button>
          </template>
        </ClientOnly>

        <!-- Language switcher - click to open panel -->
        <div class="sidebar-lang-wrapper">
          <button type="button" class="sidebar-lang-btn" @click="toggleLangPanel" :aria-label="t('common.language')">
            <span class="sidebar-lang-code">{{ locale.toUpperCase() }}</span>
          </button>
          <div v-if="langPanelOpen" class="sidebar-lang-panel">
            <button
              v-for="loc in locales"
              :key="loc.code"
              type="button"
              class="sidebar-lang-option"
              :class="{ active: locale === loc.code }"
              @click="selectLocale(loc.code)"
            >
              {{ loc.code.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- User avatar with popover menu (at bottom per UX best practice) -->
        <div class="sidebar-user-wrapper">
          <button type="button" class="sidebar-user-avatar" @click="toggleUserMenu" :aria-label="t('admin.userMenu')">
            <span class="avatar-initials">{{ userInitials }}</span>
          </button>
          <div v-if="userMenuOpen" class="sidebar-user-menu">
            <div class="user-menu-info">
              <span class="user-menu-name">{{ user?.name || user?.email }}</span>
              <span class="user-menu-role">{{ user?.role }}</span>
            </div>
            <button type="button" class="user-menu-logout" @click="handleLogout" :disabled="isLoading">
              <IconLogout />
              <span>{{ t('auth.logout') }}</span>
            </button>
          </div>
        </div>
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

