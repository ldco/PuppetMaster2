<script setup lang="ts">
/**
 * Base Skeleton Component (HIGH-06)
 *
 * Provides the animated loading placeholder base.
 * All skeleton variants extend from this.
 */
withDefaults(defineProps<{
  width?: string
  height?: string
  borderRadius?: string
  animation?: 'pulse' | 'wave' | 'none'
}>(), {
  width: '100%',
  height: '1em',
  borderRadius: '4px',
  animation: 'pulse'
})
</script>

<template>
  <div
    class="skeleton-base"
    :class="[`skeleton-${animation}`]"
    :style="{
      width,
      height,
      borderRadius
    }"
    aria-hidden="true"
    role="presentation"
  />
</template>
