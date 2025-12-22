<script setup lang="ts">
/**
 * Admin Portfolio Page (Legacy Redirect)
 *
 * Redirects to the new /admin/portfolios page.
 * Kept for backward compatibility with existing links/bookmarks.
 */
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Redirect to new portfolios page
navigateTo('/admin/portfolios', { replace: true })
</script>

<template>
  <div class="loading-state">Redirecting...</div>
</template>
