<script setup lang="ts">
/**
 * Pricing Section
 *
 * Displays pricing tiers from module config.
 * Self-contained: fetches title from i18n if not provided.
 */

const { t, te } = useI18n()

defineProps<{
  /** Section title (or use #title slot) */
  title?: string
}>()

// Self-contained: fetch title from i18n if not provided
const sectionTitle = computed(() => {
  if (te('pricing.title')) return t('pricing.title')
  if (te('nav.pricing')) return t('nav.pricing')
  return ''
})
</script>

<template>
  <!--
    Uses global classes from:
    - layout/sections.css (.section)
    - typography/base.css (.section-title, .section-title--center)
    - ui/content/pricing.css (pricing styles)
  -->
  <section id="pricing" class="section">
    <div class="container">
      <h2 v-if="title || sectionTitle || $slots.title" v-reveal class="section-title section-title--center">
        <slot name="title">{{ title ?? sectionTitle }}</slot>
      </h2>
      <OrganismsPricingTiers />
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->
