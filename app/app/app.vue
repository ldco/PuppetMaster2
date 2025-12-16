<template>
  <!--
    RTL is handled via dir attribute.
    Color mode is handled by @nuxtjs/color-mode which adds class to <html>.
    No need to add colorMode class here - it causes hydration mismatch!
  -->
  <div :dir="isRtl ? 'rtl' : 'ltr'">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { isRtlLanguage } from '~/utils/rtl'

const { locale } = useI18n()

const isRtl = computed(() => isRtlLanguage(locale.value))
</script>
