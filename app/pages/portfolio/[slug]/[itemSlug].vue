<script setup lang="ts">
/**
 * Case Study Detail Page
 *
 * Displays full content of a case study item.
 */
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconArrowRight from '~icons/tabler/arrow-right'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const route = useRoute()

interface PortfolioItem {
  id: number
  itemType: string
  slug: string | null
  title: string | null
  description: string | null
  content: string | null
  category: string | null
  tags: string[]
  mediaUrl: string | null
  thumbnailUrl: string | null
}

interface Portfolio {
  id: number
  slug: string
  name: string
  type: string
  items: PortfolioItem[]
}

const portfolioSlug = route.params.slug as string
const itemSlug = route.params.itemSlug as string

// Fetch portfolio with all items
const { data: portfolio, pending, error } = await useFetch<Portfolio>(`/api/portfolios/${portfolioSlug}`, {
  transform: (data) => data
})

// Find current item
const currentItem = computed(() =>
  portfolio.value?.items.find(i => i.slug === itemSlug)
)

// Find adjacent items for navigation
const caseStudyItems = computed(() =>
  portfolio.value?.items.filter(i => i.itemType === 'case_study') || []
)

const currentIndex = computed(() =>
  caseStudyItems.value.findIndex(i => i.slug === itemSlug)
)

const prevItem = computed(() =>
  currentIndex.value > 0 ? caseStudyItems.value[currentIndex.value - 1] : null
)

const nextItem = computed(() =>
  currentIndex.value < caseStudyItems.value.length - 1
    ? caseStudyItems.value[currentIndex.value + 1]
    : null
)

// SEO
useHead({
  title: computed(() => currentItem.value?.title || t('admin.caseStudy'))
})
</script>

<template>
  <div class="page-case-study">
    <article class="container">
      <!-- Back link -->
      <NuxtLink :to="`/portfolio/${portfolioSlug}`" class="back-link">
        <IconArrowLeft />
        <span>{{ portfolio?.name || t('nav.portfolio') }}</span>
      </NuxtLink>

      <!-- Loading -->
      <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

      <!-- Not found -->
      <div v-else-if="error || !currentItem" class="empty-state">
        <p>{{ t('admin.portfolioNotFound') }}</p>
        <NuxtLink :to="`/portfolio/${portfolioSlug}`" class="btn btn-primary">
          {{ t('nav.portfolio') }}
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Hero image -->
        <div v-if="currentItem.mediaUrl" class="case-study-hero">
          <img :src="currentItem.mediaUrl" :alt="currentItem.title || ''" />
        </div>

        <!-- Header -->
        <header class="case-study-header">
          <span v-if="currentItem.category" class="case-study-category">
            {{ currentItem.category }}
          </span>
          <h1>{{ currentItem.title }}</h1>
          <p v-if="currentItem.description" class="case-study-lead">
            {{ currentItem.description }}
          </p>
          <div v-if="currentItem.tags?.length" class="case-study-tags">
            <span v-for="tag in currentItem.tags" :key="tag" class="badge">{{ tag }}</span>
          </div>
        </header>

        <!-- Content -->
        <div v-if="currentItem.content" class="case-study-content prose" v-html="currentItem.content" />

        <!-- Navigation between case studies -->
        <nav v-if="prevItem || nextItem" class="case-study-nav">
          <NuxtLink
            v-if="prevItem"
            :to="`/portfolio/${portfolioSlug}/${prevItem.slug}`"
            class="case-study-nav-link prev"
          >
            <IconArrowLeft />
            <div>
              <span class="case-study-nav-label">{{ t('common.previous') }}</span>
              <span class="case-study-nav-title">{{ prevItem.title }}</span>
            </div>
          </NuxtLink>
          <div v-else class="case-study-nav-spacer" />

          <NuxtLink
            v-if="nextItem"
            :to="`/portfolio/${portfolioSlug}/${nextItem.slug}`"
            class="case-study-nav-link next"
          >
            <div>
              <span class="case-study-nav-label">{{ t('common.next') }}</span>
              <span class="case-study-nav-title">{{ nextItem.title }}</span>
            </div>
            <IconArrowRight />
          </NuxtLink>
        </nav>
      </template>
    </article>
  </div>
</template>

<!--
  Uses global CSS from:
  - typography/prose.css for content styling
  - Custom case study styles below
-->
