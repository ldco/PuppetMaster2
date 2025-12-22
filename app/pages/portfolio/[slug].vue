<script setup lang="ts">
/**
 * Public Portfolio Detail Page
 *
 * Displays a single portfolio with its items.
 * Gallery type: Shows media grid with lightbox
 * Case study type: Shows project cards linking to full case study pages
 */
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconPhoto from '~icons/tabler/photo'
import IconVideo from '~icons/tabler/video'
import IconLink from '~icons/tabler/external-link'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const route = useRoute()

interface PortfolioItem {
  id: number
  itemType: 'image' | 'video' | 'link' | 'case_study'
  mediaUrl: string | null
  thumbnailUrl: string | null
  caption: string | null
  slug: string | null
  title: string | null
  description: string | null
  category: string | null
}

interface Portfolio {
  id: number
  slug: string
  name: string
  description: string | null
  type: 'gallery' | 'case_study'
  coverImageUrl: string | null
  items: PortfolioItem[]
}

// Use computed for reactive route params
const slug = computed(() => route.params.slug as string)

// Fetch portfolio with items - use computed URL for reactivity on route change
const { data: portfolio, pending, error } = await useFetch<Portfolio>(() => `/api/portfolios/${slug.value}`, {
  watch: [slug]
})

// Lightbox state (for gallery)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const galleryItems = computed(() =>
  portfolio.value?.items.filter(i => i.itemType === 'image' || i.itemType === 'video') || []
)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function nextItem() {
  if (lightboxIndex.value < galleryItems.value.length - 1) {
    lightboxIndex.value++
  }
}

function prevItem() {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  }
}

// Handle keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextItem()
  if (e.key === 'ArrowLeft') prevItem()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// SEO
useHead({
  title: computed(() => portfolio.value?.name || t('nav.portfolio'))
})

function getItemIcon(type: string) {
  switch (type) {
    case 'video': return IconVideo
    case 'link': return IconLink
    default: return IconPhoto
  }
}
</script>

<template>
  <div class="page-portfolio-detail">
    <div class="container">
      <!-- Back link -->
      <NuxtLink to="/portfolio" class="back-link">
        <IconArrowLeft />
        <span>{{ t('nav.portfolio') }}</span>
      </NuxtLink>

      <!-- Loading -->
      <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

      <!-- Not found -->
      <div v-else-if="error || !portfolio" class="empty-state">
        <p>{{ t('admin.portfolioNotFound') }}</p>
        <NuxtLink to="/portfolio" class="btn btn-primary">
          {{ t('nav.portfolio') }}
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Header -->
        <header class="portfolio-detail-header">
          <h1>{{ portfolio.name }}</h1>
          <p v-if="portfolio.description">{{ portfolio.description }}</p>
        </header>

        <!-- Empty state -->
        <div v-if="!portfolio.items?.length" class="empty-state">
          <p>{{ t('admin.noItems') }}</p>
        </div>

        <!-- Gallery type: Media grid -->
        <div v-else-if="portfolio.type === 'gallery'" class="gallery-grid">
          <template v-for="(item, index) in portfolio.items" :key="item.id">
            <!-- Image/Video - opens lightbox -->
            <button
              v-if="item.itemType === 'image' || item.itemType === 'video'"
              class="gallery-item"
              @click="openLightbox(galleryItems.indexOf(item))"
            >
              <img
                v-if="item.thumbnailUrl || item.mediaUrl"
                :src="item.thumbnailUrl || item.mediaUrl || ''"
                :alt="item.caption || ''"
              />
              <div v-else class="gallery-item-placeholder">
                <component :is="getItemIcon(item.itemType)" />
              </div>
              <div v-if="item.itemType === 'video'" class="gallery-item-badge">
                <IconVideo />
              </div>
            </button>

            <!-- External link - opens in new tab -->
            <a
              v-else-if="item.itemType === 'link'"
              :href="item.mediaUrl || '#'"
              target="_blank"
              rel="noopener noreferrer"
              class="gallery-item gallery-item-link"
            >
              <div class="gallery-item-link-content">
                <IconLink />
                <span v-if="item.caption">{{ item.caption }}</span>
              </div>
            </a>
          </template>
        </div>

        <!-- Case study type: Project cards -->
        <div v-else class="case-study-grid">
          <NuxtLink
            v-for="item in portfolio.items"
            :key="item.id"
            :to="`/portfolio/${portfolio.slug}/${item.slug}`"
            class="case-study-card"
          >
            <div class="case-study-card-image">
              <img
                v-if="item.thumbnailUrl"
                :src="item.thumbnailUrl"
                :alt="item.title || ''"
              />
              <div v-else class="case-study-card-placeholder"></div>
            </div>
            <div class="case-study-card-content">
              <span v-if="item.category" class="case-study-card-category">{{ item.category }}</span>
              <h2 class="case-study-card-title">{{ item.title }}</h2>
              <p v-if="item.description" class="case-study-card-description">
                {{ item.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </template>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">&times;</button>

        <button
          v-if="lightboxIndex > 0"
          class="lightbox-prev"
          @click="prevItem"
        >
          &#8249;
        </button>

        <div class="lightbox-content">
          <template v-if="galleryItems[lightboxIndex]">
            <img
              v-if="galleryItems[lightboxIndex].itemType === 'image'"
              :src="galleryItems[lightboxIndex].mediaUrl || ''"
              :alt="galleryItems[lightboxIndex].caption || ''"
            />
            <video
              v-else-if="galleryItems[lightboxIndex].itemType === 'video'"
              :src="galleryItems[lightboxIndex].mediaUrl || ''"
              controls
              autoplay
            />
          </template>
        </div>

        <button
          v-if="lightboxIndex < galleryItems.length - 1"
          class="lightbox-next"
          @click="nextItem"
        >
          &#8250;
        </button>

        <div v-if="galleryItems[lightboxIndex]?.caption" class="lightbox-caption">
          {{ galleryItems[lightboxIndex].caption }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<!--
  Uses global CSS from:
  - ui/content/portfolio-card.css
  - ui/overlays/lightbox.css
-->
