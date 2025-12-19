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
import IconHeartbeat from '~icons/tabler/heartbeat'
import IconLogout from '~icons/tabler/logout'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { user, logout, isLoading, canManageUsers } = useAuth()
const { shortLogo } = useLogo()

// User menu panel state (desktop sidebar)
const userMenuOpen = ref(false)
// Mobile user menu state
const mobileUserMenuOpen = ref(false)

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function toggleMobileUserMenu() {
  mobileUserMenuOpen.value = !mobileUserMenuOpen.value
}

// Get current page title based on route name (works with any locale prefix)
const currentPageTitle = computed(() => {
  const name = route.name?.toString() ?? ''
  // Route names are like 'admin-settings___en', 'admin-portfolio___ru', etc.
  if (name.startsWith('admin-settings')) return t('admin.settings')
  if (name.startsWith('admin-portfolio')) return t('admin.portfolio')
  if (name.startsWith('admin-contacts')) return t('admin.contacts')
  if (name.startsWith('admin-translations')) return t('admin.translations')
  if (name.startsWith('admin-users')) return t('admin.users')
  if (name.startsWith('admin-health')) return t('admin.health')
  if (name.startsWith('admin')) return t('admin.dashboard')
  return t('admin.title')
})

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

// Base admin links - use localePath for locale-aware navigation
const adminLinks = computed(() => {
  const links = [
    { to: localePath('/admin/settings'), label: 'admin.settings', icon: IconSettings },
    { to: localePath('/admin/portfolio'), label: 'admin.portfolio', icon: IconPhoto },
    { to: localePath('/admin/contacts'), label: 'admin.contacts', icon: IconMail, badge: true },
    { to: localePath('/admin/translations'), label: 'admin.translations', icon: IconLanguage },
  ]
  if (canManageUsers.value) {
    links.push({ to: localePath('/admin/users'), label: 'admin.users', icon: IconUsers })
    // Health page - master user only
    links.push({ to: localePath('/admin/health'), label: 'admin.health', icon: IconHeartbeat })
  }
  return links
})

async function handleLogout() {
  await logout()
}

// Theme toggle and language switcher now use shared components
// with View Transitions API animations (ThemeToggle, LangSwitcher)

// Close panels on click outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.sidebar-user-wrapper')) {
    userMenuOpen.value = false
  }
  if (!target.closest('.mobile-user-wrapper')) {
    mobileUserMenuOpen.value = false
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
        <NuxtLink :to="localePath('/admin')">
          <ClientOnly>
            <img :src="shortLogo" alt="Logo" class="logo-img" width="40" height="40" />
            <template #fallback>
              <img :src="`${config.logo.basePath}/circle_${config.defaultTheme === 'dark' ? 'light' : 'dark'}_${config.defaultLocale}.svg`" alt="Logo" class="logo-img" width="40" height="40" />
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
        <!-- Theme toggle - uses shared component with View Transitions animation -->
        <AtomsThemeToggle class="sidebar-icon-btn" />

        <!-- Language switcher - reusable component -->
        <AtomsLangSwitcher direction="side" />

        <!-- User avatar with popover menu (at bottom per UX best practice) -->
        <div class="sidebar-user-wrapper">
          <button type="button" class="sidebar-user-avatar" @click="toggleUserMenu" :aria-label="t('admin.userMenu')">
            <span class="avatar-initials">{{ userInitials }}</span>
          </button>
          <div v-if="userMenuOpen" class="sidebar-user-menu">
            <div class="user-menu-info">
              <span v-if="user?.name" class="user-menu-name">{{ user.name }}</span>
              <span class="user-menu-email">{{ user?.email }}</span>
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
      <!-- Mobile header (phones only) - shows page title + user avatar -->
      <header v-if="config.features.appVerticalNav" class="admin-header mobile-only">
        <span class="admin-title">{{ currentPageTitle }}</span>

        <!-- Mobile user avatar with menu -->
        <div class="mobile-user-wrapper">
          <button type="button" class="mobile-user-avatar" @click="toggleMobileUserMenu" :aria-label="t('admin.userMenu')">
            <span class="avatar-initials">{{ userInitials }}</span>
          </button>

          <!-- Mobile user menu dropdown -->
          <div v-if="mobileUserMenuOpen" class="mobile-user-menu">
            <!-- User info -->
            <div class="mobile-user-info">
              <span v-if="user?.name" class="mobile-user-name">{{ user.name }}</span>
              <span class="mobile-user-email">{{ user?.email }}</span>
              <span class="mobile-user-role">{{ user?.role }}</span>
            </div>

            <div class="mobile-menu-divider"></div>

            <!-- Theme & Language - uses shared components for consistency -->
            <div class="mobile-menu-toggles">
              <AtomsThemeToggle />
              <AtomsLangSwitcher direction="inline" />
            </div>

            <div class="mobile-menu-divider"></div>

            <!-- Logout -->
            <button type="button" class="mobile-menu-item mobile-menu-logout" @click="handleLogout" :disabled="isLoading">
              <IconLogout />
              <span>{{ t('auth.logout') }}</span>
            </button>
          </div>
        </div>
      </header>

      <div class="admin-content">
        <slot />
      </div>
    </main>

    <!-- Bottom Navigation (phones only < 600px) -->
    <!-- ClientOnly to avoid hydration mismatch: canManageUsers is false on server, true on client -->
    <ClientOnly>
      <MoleculesAppBottomNav v-if="config.features.appVerticalNav" />
    </ClientOnly>
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

