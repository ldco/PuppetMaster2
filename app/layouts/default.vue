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
 */
import config from '~/puppet-master.config'

const showBackToTop = config.features.backToTop
</script>

<template>
  <div class="layout">
    <!-- Header with responsive navigation -->
    <OrganismsTheHeader />

    <!-- Main content slot -->
    <main class="main">
      <slot />
    </main>

    <!-- Footer with social links and copyright -->
    <OrganismsTheFooter rich />

    <!-- Back to top button (fixed, appears on scroll) -->
    <AtomsBackToTop v-if="showBackToTop" />
  </div>
</template>
