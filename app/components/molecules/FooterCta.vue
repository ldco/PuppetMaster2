<script setup lang="ts">
/**
 * FooterCta Molecule
 *
 * Config-driven CTA button for footer.
 * Uses settings from database (footer.ctaText, footer.ctaUrl).
 * ONLY shows if BOTH text AND url are set in database - no fallbacks!
 */

const { settings } = useSiteSettings()

// CTA from settings - NO FALLBACKS
const ctaText = computed(() => settings.value?.footer?.ctaText)
const ctaUrl = computed(() => settings.value?.footer?.ctaUrl)

// Only show if BOTH text AND url exist in database
const hasValidCta = computed(() => !!(ctaText.value && ctaUrl.value))
</script>

<template>
  <div v-if="hasValidCta" class="footer-cta">
    <NuxtLink :href="ctaUrl!" class="footer-cta-button">
      {{ ctaText }}
    </NuxtLink>
  </div>
</template>

