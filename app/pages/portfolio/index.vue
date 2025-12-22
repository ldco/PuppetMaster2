<script setup lang="ts">
/**
 * Public Portfolio Listing Page
 *
 * Displays all published portfolios as a grid.
 * Clicking a portfolio navigates to its detail page.
 */
import IconPhoto from '~icons/tabler/photo'
import IconPresentation from '~icons/tabler/presentation'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()

interface Portfolio {
  id: number
  slug: string
  name: string
  description: string | null
  type: 'gallery' | 'case_study'
  coverImageUrl: string | null
  coverThumbnailUrl: string | null
}

// Fetch published portfolios (collections, not items)
const { data: portfolios, pending } = await useFetch<Portfolio[]>('/api/portfolios', {
  key: 'portfolio-collections'
})

// SEO
useHead({
  title: t('nav.portfolio')
})
</script>

<template>
  <div class="page-portfolio">
    <div class="container">
      <header class="portfolio-header">
        <h1>{{ t('nav.portfolio') }}</h1>
      </header>

      <!-- Loading -->
      <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

      <!-- Empty state -->
      <div v-else-if="!portfolios?.length" class="empty-state">
        <p>{{ t('admin.noItems') }}</p>
      </div>

      <!-- Portfolio grid -->
      <div v-else class="portfolio-grid public-portfolio-grid">
        <NuxtLink
          v-for="portfolio in portfolios"
          :key="portfolio.id"
          :to="`/portfolio/${portfolio.slug}`"
          class="portfolio-card"
        >
          <div class="portfolio-card-image">
            <img
              v-if="portfolio.coverThumbnailUrl"
              :src="portfolio.coverThumbnailUrl"
              :alt="portfolio.name"
            />
            <div v-else class="portfolio-card-placeholder">
              <IconPhoto v-if="portfolio.type === 'gallery'" />
              <IconPresentation v-else />
            </div>
          </div>
          <div class="portfolio-card-content">
            <h2 class="portfolio-card-title">{{ portfolio.name }}</h2>
            <p v-if="portfolio.description" class="portfolio-card-description">
              {{ portfolio.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<!--
  Uses global CSS from:
  - ui/content/portfolio-card.css
  - ui/content/portfolio-grid.css
-->
