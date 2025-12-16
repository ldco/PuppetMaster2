<script setup lang="ts">
/**
 * Logo Atom
 * 
 * Displays the site logo with automatic theme/language switching.
 * Uses the useLogo composable for dynamic logo selection.
 */

const { headerLogo } = useLogo()

defineProps<{
  /** Link destination (default: home) */
  to?: string
  /** Alt text for accessibility */
  alt?: string
  /** Additional CSS classes */
  class?: string
}>()
</script>

<template>
  <!-- Uses global classes from skeleton/header.css (.logo-link, .logo-img) -->
  <NuxtLink :to="to ?? '/'" class="logo-link" :class="$props.class">
    <img
      :src="headerLogo"
      :alt="alt ?? 'Logo'"
      class="logo-img"
    />
  </NuxtLink>
</template>

<!-- No scoped styles needed - all styles come from skeleton/header.css -->

