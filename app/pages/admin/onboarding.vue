<script setup lang="ts">
/**
 * Admin Onboarding Page (LOW-05)
 *
 * First-time setup wizard for new site owners.
 * Guides through essential configuration steps.
 */

definePageMeta({
  layout: 'blank',
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: () => t('admin.onboarding.pageTitle')
})
</script>

<template>
  <div class="onboarding-page">
    <div class="onboarding-container">
      <OnboardingWizard />
    </div>
  </div>
</template>
