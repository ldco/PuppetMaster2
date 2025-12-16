<!--
  Default Layout

  Uses atomic design components:
  - OrganismsTheHeader: Complete header with nav, logo, actions
  - OrganismsTheFooter: Complete footer with social links

  For simpler layouts, see blank.vue
  For admin, see admin.vue
-->

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
  </div>
</template>

<script setup lang="ts">
/**
 * Default Layout
 *
 * Uses Holy Grail grid from layout/page.css
 * Classes: .layout, .main
 */
</script>
