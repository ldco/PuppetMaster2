<template>
  <!--
    RTL is handled via dir attribute on <html> element.
    Color mode is handled by @nuxtjs/color-mode which adds class to <html>.
    No need to add colorMode class here - it causes hydration mismatch!
  -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { isRtlLanguage } from '~/utils/rtl'

const { locale } = useI18n()

const isRtl = computed(() => isRtlLanguage(locale.value))

// Set dir attribute on <html> element for:
// 1. Scrollbar position (left side in RTL)
// 2. All CSS logical properties to work correctly
// 3. Native browser RTL support (text-align, etc.)
useHead({
  htmlAttrs: {
    dir: () => isRtl.value ? 'rtl' : 'ltr'
  }
})
</script>
