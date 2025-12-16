<script setup lang="ts">
/**
 * Admin Dashboard Page
 *
 * Uses existing CSS classes:
 * - ui/content/index.css: .card, .card-body
 * - common/utilities.css: .flex, .gap-*, grid utilities
 * - typography: headings, text colors
 */
import IconPhoto from '~icons/tabler/photo'
import IconMail from '~icons/tabler/mail'
import IconSettings from '~icons/tabler/settings'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()
const { user } = useAuth()

// Dashboard stats (will be fetched from API later)
const stats = ref({
  portfolioItems: 0,
  contactSubmissions: 0,
  unreadMessages: 0
})

// Fetch stats on mount
onMounted(async () => {
  try {
    const data = await $fetch<{
      portfolioItems: number
      contactSubmissions: number
      unreadMessages: number
    }>('/api/admin/stats')
    stats.value = data
  } catch {
    // Stats API not implemented yet, use defaults
  }
})

const quickActions = [
  { to: '/admin/portfolio', label: 'admin.managePortfolio', icon: IconPhoto },
  { to: '/admin/contacts', label: 'admin.viewMessages', icon: IconMail },
  { to: '/admin/settings', label: 'admin.siteSettings', icon: IconSettings },
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Welcome -->
    <div>
      <h2>{{ t('admin.welcome', { name: user?.name || 'Admin' }) }}</h2>
      <p class="text-secondary">{{ t('admin.dashboardSubtitle') }}</p>
    </div>

    <!-- Stats Grid - uses .card from ui/content -->
    <div class="grid grid-cols-3 gap-4">
      <div class="card card-body flex items-center gap-4">
        <div class="avatar avatar-lg">
          <IconPhoto />
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-bold">{{ stats.portfolioItems }}</span>
          <span class="text-sm text-secondary">{{ t('admin.portfolioItems') }}</span>
        </div>
      </div>

      <div class="card card-body flex items-center gap-4">
        <div class="avatar avatar-lg">
          <IconMail />
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-bold">{{ stats.contactSubmissions }}</span>
          <span class="text-sm text-secondary">{{ t('admin.contactMessages') }}</span>
        </div>
      </div>

      <div class="card card-body flex items-center gap-4" style="background: var(--i-brand-subtle);">
        <div class="avatar avatar-lg">
          <IconMail />
        </div>
        <div class="flex flex-col">
          <span class="text-2xl font-bold">{{ stats.unreadMessages }}</span>
          <span class="text-sm text-secondary">{{ t('admin.unreadMessages') }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div>
      <h3>{{ t('admin.quickActions') }}</h3>
      <div class="grid grid-cols-3 gap-4">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.to"
          :to="action.to"
          class="card card-body flex flex-col items-center gap-3 text-center hover-lift"
        >
          <component :is="action.icon" class="icon-lg text-brand" />
          <span>{{ t(action.label) }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<!--
  Uses global CSS:
  - ui/content/index.css: .card, .card-body, .avatar
  - common/utilities.css: .flex, .flex-col, .items-center, .gap-*, .grid, .grid-cols-*
  - typography: .text-2xl, .text-sm, .text-secondary, .font-bold
  No scoped styles needed!
-->

