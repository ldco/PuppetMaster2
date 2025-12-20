<script setup lang="ts">
/**
 * Table Skeleton Component
 *
 * Displays a table placeholder with header and rows.
 */
withDefaults(defineProps<{
  rows?: number
  columns?: number
  showHeader?: boolean
}>(), {
  rows: 5,
  columns: 4,
  showHeader: true
})
</script>

<template>
  <div class="skeleton-table">
    <!-- Header row -->
    <div v-if="showHeader" class="skeleton-table__header">
      <SkeletonBase
        v-for="col in columns"
        :key="`header-${col}`"
        height="1.25em"
        :width="`${80 + Math.random() * 20}%`"
      />
    </div>
    <!-- Data rows -->
    <div
      v-for="row in rows"
      :key="`row-${row}`"
      class="skeleton-table__row"
    >
      <SkeletonBase
        v-for="col in columns"
        :key="`cell-${row}-${col}`"
        height="1em"
        :width="`${60 + Math.random() * 40}%`"
      />
    </div>
  </div>
</template>
