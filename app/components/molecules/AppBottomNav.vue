<script setup lang="ts">
/**
 * AppBottomNav - Mobile App-Style Bottom Navigation
 *
 * Used in app mode (admin panel) for phones (< 600px).
 * Material Design 3 inspired with PWA-ready safe area handling.
 *
 * MAX_VISIBLE_ITEMS: 5 (Material Design recommendation)
 * When items exceed 5, shows 4 items + "More" button with overflow menu.
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
import IconHeartbeat from '~icons/tabler/heartbeat'
import IconDotsVertical from '~icons/tabler/dots-vertical'

const { t } = useI18n()
const localePath = useLocalePath()
const { canManageUsers } = useAuth()
const { unreadCount } = useUnreadCount()

// Maximum items to show directly (Material Design: 3-5, we use 5)
const MAX_VISIBLE_ITEMS = 5

// State for overflow menu
const showMoreMenu = ref(false)

// Navigation items matching admin.vue sidebar - use localePath for locale-aware navigation
// Uses short single-word labels (admin.navXxx) for compact bottom nav display
const allNavItems = computed(() => {
  const items = [
    { to: localePath('/admin/settings'), label: 'admin.navSettings', icon: IconSettings },
    { to: localePath('/admin/portfolio'), label: 'admin.navPortfolio', icon: IconPhoto },
    { to: localePath('/admin/contacts'), label: 'admin.navContacts', icon: IconMail, badge: true },
    { to: localePath('/admin/translations'), label: 'admin.navTranslations', icon: IconLanguage },
  ]
  if (canManageUsers.value) {
    items.push({ to: localePath('/admin/users'), label: 'admin.navUsers', icon: IconUsers })
    // Health page - master user only (for now, same as canManageUsers)
    items.push({ to: localePath('/admin/health'), label: 'admin.navHealth', icon: IconHeartbeat })
  }
  return items
})

// Split items into visible and overflow
const hasOverflow = computed(() => allNavItems.value.length > MAX_VISIBLE_ITEMS)
const visibleItems = computed(() =>
  hasOverflow.value ? allNavItems.value.slice(0, MAX_VISIBLE_ITEMS - 1) : allNavItems.value
)
const overflowItems = computed(() =>
  hasOverflow.value ? allNavItems.value.slice(MAX_VISIBLE_ITEMS - 1) : []
)

// Check if any overflow item has a badge with count
const overflowHasBadge = computed(() =>
  overflowItems.value.some(item => item.badge) && unreadCount.value > 0
)

function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value
}

function closeMoreMenu() {
  showMoreMenu.value = false
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Main navigation">
    <!-- Visible navigation items -->
    <NuxtLink
      v-for="item in visibleItems"
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

    <!-- More button (only if overflow exists) -->
    <div v-if="hasOverflow" class="bottom-nav-more-wrapper">
      <button
        type="button"
        class="bottom-nav-item"
        :class="{ 'is-active': showMoreMenu }"
        :aria-label="t('common.more')"
        :aria-expanded="showMoreMenu"
        @click="toggleMoreMenu"
      >
        <span class="relative">
          <IconDotsVertical class="bottom-nav-icon" />
          <span v-if="overflowHasBadge" class="badge-dot badge-dot-small"></span>
        </span>
        <span class="bottom-nav-label">{{ t('common.more') }}</span>
      </button>

      <!-- Overflow menu (bottom sheet style) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showMoreMenu" class="bottom-nav-more-backdrop" @click="closeMoreMenu" />
        </Transition>
        <Transition name="slide-up">
          <div v-if="showMoreMenu" class="bottom-nav-more-menu">
            <NuxtLink
              v-for="item in overflowItems"
              :key="item.to"
              :to="item.to"
              class="bottom-nav-more-item"
              @click="closeMoreMenu"
            >
              <component :is="item.icon" class="bottom-nav-more-icon" />
              <span class="bottom-nav-more-label">{{ t(item.label) }}</span>
              <span v-if="item.badge && unreadCount > 0" class="badge-dot">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </NuxtLink>
          </div>
        </Transition>
      </Teleport>
    </div>
  </nav>
</template>

<!--
  Uses global CSS classes from skeleton/bottom-nav.css
  No scoped styles needed - following PuppetMaster CSS architecture
-->

