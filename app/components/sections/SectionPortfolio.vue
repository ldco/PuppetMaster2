<script setup lang="ts">
/**
 * Portfolio Section
 *
 * Shows ALL portfolios with their items.
 * Each portfolio is displayed with its name and items grid.
 */

interface PortfolioItem {
  id: number
  portfolioId: number
  itemType: 'image' | 'video' | 'link' | 'case_study'
  slug: string | null
  title: string | null
  description: string | null
  mediaUrl: string | null
  thumbnailUrl: string | null
  caption: string | null
  category: string | null
  tags: string[]
  published: boolean
}

interface Portfolio {
  id: number
  slug: string
  name: string
  description: string | null
  type: 'gallery' | 'case_study'
  items: PortfolioItem[]
}

const props = defineProps<{
  /** Section title */
  title?: string
}>()

// Fetch ALL portfolios with their items
const { data: portfoliosData } = await useFetch<Portfolio[]>('/api/portfolios', {
  key: 'portfolio-section-all',
  query: { includeItems: 'true' }
})

const portfolios = computed(() => portfoliosData.value || [])

// Flatten all items for lightbox navigation
const allItems = computed(() => portfolios.value.flatMap(p => p.items || []))

// Lightbox state
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const currentItem = computed(() => allItems.value[lightboxIndex.value])

function openLightbox(item: PortfolioItem) {
  const index = allItems.value.findIndex(i => i.id === item.id)
  if (index >= 0) {
    lightboxIndex.value = index
    lightboxOpen.value = true
  }
}

function closeLightbox() {
  lightboxOpen.value = false
}

function navigateLightbox(index: number) {
  lightboxIndex.value = index
}
</script>

<template>
  <section id="portfolio" class="section">
    <div class="container">
      <h2 class="section-title section-title--center">
        <slot name="title">{{ title ?? 'Our Work' }}</slot>
      </h2>

      <!-- Show message if no portfolios -->
      <p v-if="!portfolios.length" class="text-center text-secondary">No portfolio items yet.</p>

      <!-- Loop through each portfolio -->
      <template v-for="portfolio in portfolios" :key="portfolio.id">
        <!-- Portfolio header (only show if multiple portfolios) -->
        <h3 v-if="portfolios.length > 1" class="portfolio-section-title">
          {{ portfolio.name }}
        </h3>

        <!-- Portfolio items grid -->
        <div v-if="portfolio.items?.length" class="section-grid-auto section-grid-auto--lg portfolio-items-grid">
          <article
            v-for="item in portfolio.items"
            :key="item.id"
            class="portfolio-card portfolio-card--clickable"
            @click="openLightbox(item)"
          >
            <div class="portfolio-card-image">
              <img
                v-if="item.thumbnailUrl || item.mediaUrl"
                :src="item.thumbnailUrl || item.mediaUrl!"
                :alt="item.title || item.caption || ''"
                loading="lazy"
              />
              <div v-else class="image-placeholder">🎨</div>
            </div>
            <div class="portfolio-card-info">
              <span v-if="item.category" class="portfolio-card-category">
                {{ item.category }}
              </span>
              <h3 v-if="item.title" class="portfolio-card-title">{{ item.title }}</h3>
              <h3 v-else-if="item.caption" class="portfolio-card-title">{{ item.caption }}</h3>
              <p v-if="item.description" class="portfolio-card-description">
                {{ item.description }}
              </p>
            </div>
          </article>
        </div>
      </template>
    </div>
  </section>

  <!-- Lightbox -->
  <Teleport to="body">
    <div v-if="lightboxOpen && currentItem" class="lightbox" @click.self="closeLightbox">
      <button class="lightbox-close" @click="closeLightbox">&times;</button>

      <button
        v-if="lightboxIndex > 0"
        class="lightbox-prev"
        @click="navigateLightbox(lightboxIndex - 1)"
      >
        &#8249;
      </button>

      <div class="lightbox-content">
        <img
          v-if="currentItem.itemType !== 'video'"
          :src="currentItem.mediaUrl || currentItem.thumbnailUrl || ''"
          :alt="currentItem.title || currentItem.caption || ''"
        />
        <video
          v-else
          :src="currentItem.mediaUrl || ''"
          controls
          autoplay
        />
      </div>

      <button
        v-if="lightboxIndex < allItems.length - 1"
        class="lightbox-next"
        @click="navigateLightbox(lightboxIndex + 1)"
      >
        &#8250;
      </button>

      <div v-if="currentItem.title || currentItem.caption" class="lightbox-caption">
        {{ currentItem.title || currentItem.caption }}
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Portfolio section title for multiple portfolios */
.portfolio-section-title {
  font-size: var(--text-xl);
  margin-block-start: var(--space-8);
  margin-block-end: var(--space-4);
}

.portfolio-section-title:first-of-type {
  margin-block-start: 0;
}

.portfolio-items-grid {
  margin-block-end: var(--space-6);
}
</style>
