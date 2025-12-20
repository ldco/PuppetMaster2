<script setup lang="ts">
/**
 * Card Skeleton Component
 *
 * Displays a card placeholder with image and text areas.
 */
withDefaults(defineProps<{
  imageHeight?: string
  showImage?: boolean
  textLines?: number
}>(), {
  imageHeight: '200px',
  showImage: true,
  textLines: 3
})
</script>

<template>
  <div class="skeleton-card">
    <SkeletonBase
      v-if="showImage"
      :height="imageHeight"
      borderRadius="8px 8px 0 0"
    />
    <div class="skeleton-card__content">
      <SkeletonBase
        height="1.5em"
        width="60%"
        style="margin-bottom: 1em"
      />
      <SkeletonText :lines="textLines" />
    </div>
  </div>
</template>
