<script setup lang="ts">
/**
 * NavLink Atom
 *
 * Navigation link with active state styling.
 * Supports both internal routes and anchor links.
 *
 * For anchor links (#section), uses plain <a> to avoid Vue Router warnings.
 * For routes (/page), uses NuxtLink for client-side navigation.
 */

defineProps<{
  /** Link destination */
  to: string
  /** Link text (slot is preferred) */
  label?: string
  /** Whether this is an anchor link (for one-pager) */
  isAnchor?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <!-- Uses global .nav-link class from skeleton/nav.css -->

  <!-- Anchor links: use plain <a> to avoid Vue Router warnings -->
  <a
    v-if="isAnchor"
    :href="to"
    class="nav-link nav-link--anchor"
    @click="emit('click')"
  >
    <slot>{{ label }}</slot>
  </a>

  <!-- Route links: use NuxtLink for client-side navigation -->
  <NuxtLink
    v-else
    :to="to"
    class="nav-link"
    @click="emit('click')"
  >
    <slot>{{ label }}</slot>
  </NuxtLink>
</template>

<!-- No scoped styles needed - uses skeleton/nav.css -->

