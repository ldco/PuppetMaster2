<script setup lang="ts">
/**
 * Portfolio Section
 *
 * Grid of portfolio items/projects.
 * Fetches published items from API.
 * Includes fancy lightbox for viewing items.
 */

interface PortfolioItem {
  id: number
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  thumbnailUrl: string | null
  category: string | null
  tags: string[]
  published: boolean
}

defineProps<{
  /** Section title */
  title?: string
}>()

// Fetch published portfolio items from API
const { data: items } = await useFetch<PortfolioItem[]>('/api/portfolio')

// Lightbox state
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function navigateLightbox(index: number) {
  lightboxIndex.value = index
}
</script>

<template>
  <!--
    Uses global classes from:
    - layout/sections.css (.section, .section-grid-auto--lg, .image-placeholder)
    - typography/base.css (.section-title, .section-title--center)
    - ui/content/index.css (.portfolio-card, .portfolio-card-*)
  -->
  <section id="portfolio" class="section">
    <div class="container">
      <h2 class="section-title section-title--center">
        <slot name="title">{{ title ?? 'Our Work' }}</slot>
      </h2>

      <!-- Show message if no items -->
      <p v-if="!items?.length" class="text-center text-secondary">
        No portfolio items yet.
      </p>

      <div v-else class="section-grid-auto section-grid-auto--lg">
        <article
          v-for="(item, index) in items"
          :key="item.id"
          class="portfolio-card portfolio-card--clickable"
          @click="openLightbox(index)"
        >
          <div class="portfolio-card-image">
            <img
              v-if="item.thumbnailUrl || item.imageUrl"
              :src="item.thumbnailUrl || item.imageUrl!"
              :alt="item.title"
              loading="lazy"
            />
            <div v-else class="image-placeholder">🎨</div>
          </div>
          <div class="portfolio-card-info">
            <span v-if="item.category" class="portfolio-card-category">
              {{ item.category }}
            </span>
            <h3 class="portfolio-card-title">{{ item.title }}</h3>
            <p v-if="item.description" class="portfolio-card-description">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Lightbox -->
  <MoleculesPortfolioLightbox
    v-if="items?.length"
    :items="items"
    :current-index="lightboxIndex"
    :is-open="lightboxOpen"
    @close="closeLightbox"
    @navigate="navigateLightbox"
  />
</template>

<!-- No scoped styles needed - all styles come from global CSS -->

