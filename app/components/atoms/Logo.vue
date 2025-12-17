<script setup lang="ts">
/**
 * Logo Atom
 *
 * Displays the site logo with automatic theme/language switching.
 * Uses the useLogo composable for dynamic logo selection.
 *
 * Uses ClientOnly to avoid SSR hydration mismatch since
 * logo src depends on colorMode which can differ between server and client.
 */
import config from '~/puppet-master.config'

const { headerLogo } = useLogo()

defineProps<{
  /** Link destination (default: home) */
  to?: string
  /** Alt text for accessibility */
  alt?: string
  /** Additional CSS classes */
  class?: string
}>()

// SSR fallback: use the default theme logo
const ssrFallbackLogo = computed(() => {
  const theme = config.defaultTheme === 'dark' ? 'light' : 'dark'
  return `${config.logo.basePath}/horizontal_${theme}_${config.defaultLocale}.svg`
})
</script>

<template>
  <!-- Uses global classes from skeleton/header.css (.logo-link, .logo-img) -->
  <NuxtLink :to="to ?? '/'" class="logo-link" :class="$props.class">
    <ClientOnly>
      <img
        :src="headerLogo"
        :alt="alt ?? 'Logo'"
        class="logo-img"
      />
      <template #fallback>
        <img
          :src="ssrFallbackLogo"
          :alt="alt ?? 'Logo'"
          class="logo-img"
        />
      </template>
    </ClientOnly>
  </NuxtLink>
</template>

<!-- No scoped styles needed - all styles come from skeleton/header.css -->

