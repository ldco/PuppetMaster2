<script setup lang="ts">
/**
 * Blank Layout
 *
 * Minimal layout with no header/footer.
 * Use for login pages, error pages, standalone pages.
 *
 * Uses .layout-blank from layout/page.css
 */
</script>

<template>
  <div class="layout-blank">
    <main class="main">
      <slot />
    </main>
  </div>
</template>
