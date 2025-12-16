<script setup lang="ts">
/**
 * CTA Button Atom
 *
 * Call-to-action button with multiple variants.
 */

const props = defineProps<{
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Link destination (makes it a NuxtLink) */
  to?: string
  /** External href (makes it an <a>) */
  href?: string
  /** Disabled state */
  disabled?: boolean
  /** Full width */
  fullWidth?: boolean
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const btnClasses = computed(() => [
  'btn',
  `btn-${props.variant ?? 'primary'}`,
  props.size ? `btn-${props.size}` : '',
  { 'btn-full': props.fullWidth }
])
</script>

<template>
  <!--
    Uses global classes from ui/forms/buttons.css:
    .btn, .btn-primary, .btn-secondary, .btn-outline, .btn-ghost
    .btn-sm, .btn-lg, .btn-full
  -->

  <!-- Internal link: use NuxtLink -->
  <NuxtLink
    v-if="to"
    :to="to"
    :class="btnClasses"
    @click="emit('click', $event)"
  >
    <slot />
  </NuxtLink>

  <!-- External link: use <a> -->
  <a
    v-else-if="href"
    :href="href"
    :class="btnClasses"
    target="_blank"
    rel="noopener noreferrer"
    @click="emit('click', $event)"
  >
    <slot />
  </a>

  <!-- Button -->
  <button
    v-else
    type="button"
    :disabled="disabled"
    :class="btnClasses"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<!-- No scoped styles needed - all styles come from ui/forms/buttons.css -->

