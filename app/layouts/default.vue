<!--
  Default Layout

  Uses atomic design components:
  - OrganismsTheHeader: Complete header with nav, logo, actions
  - OrganismsTheFooter: Complete footer with social links
  - AtomsBackToTop: Fixed scroll-to-top button

  For simpler layouts, see blank.vue
  For admin, see admin.vue
-->

<script setup lang="ts">
/**
 * Default Layout
 *
 * Uses Holy Grail grid from layout/page.css
 * Classes: .layout, .main
 *
 * Adds feature classes to layout for CSS targeting:
 * - .interactive-header: when header shrinks on scroll
 * - .onepager: when in one-page mode with anchor navigation
 */
import config from '~/puppet-master.config'

const { t } = useI18n()
const showBackToTop = config.features.backToTop

// Activate scroll reveal animations (enabled in onepager mode)
useReveal({ enabled: config.features.onepager })

// Feature classes for CSS targeting
const layoutClasses = computed(() => ({
  layout: true,
  'interactive-header': config.features.interactiveHeader,
  onepager: config.features.onepager
}))
</script>

<template>
  <div :class="layoutClasses">
    <!-- Skip to content link (WCAG 2.4.1) - first focusable element -->
    <a href="#main-content" class="skip-link">{{ t('nav.skipToContent') }}</a>

    <!-- Header with responsive navigation -->
    <OrganismsTheHeader />

    <!-- Main content slot -->
    <main id="main-content" class="main">
      <slot />
    </main>

    <!-- Footer with social links and copyright -->
    <OrganismsTheFooter rich />

    <!-- Back to top button (fixed, appears on scroll) -->
    <AtomsBackToTop v-if="showBackToTop" />
  </div>
</template>
