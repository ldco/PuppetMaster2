<script setup lang="ts">
/**
 * Admin Health Page
 * 
 * Server health metrics dashboard for master users.
 * TODO: Implement server health monitoring (CPU, memory, disk, uptime, etc.)
 */
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()
</script>

<template>
  <div class="admin-page">
    <header class="admin-page-header">
      <h1>{{ t('admin.health') }}</h1>
    </header>

    <div class="admin-page-content">
      <p class="text-secondary">{{ t('admin.healthComingSoon') }}</p>
    </div>
  </div>
</template>

