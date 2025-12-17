<script setup lang="ts">
/**
 * Admin Index - Redirects to Portfolio
 *
 * The admin panel doesn't need a dashboard page.
 * Users should land directly on actionable content.
 */
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Redirect to settings on mount
navigateTo('/admin/settings', { replace: true })
</script>

<template>
  <div></div>
</template>

