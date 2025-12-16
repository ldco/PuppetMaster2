<script setup lang="ts">
/**
 * Portfolio Section
 * 
 * Grid of portfolio items/projects.
 */

interface PortfolioItem {
  id: string
  title: string
  category?: string
  image?: string
  link?: string
}

defineProps<{
  /** Section title */
  title?: string
  /** Portfolio items (will come from DB later) */
  items?: PortfolioItem[]
}>()

// Placeholder items for demo
const demoItems: PortfolioItem[] = [
  { id: '1', title: 'Project Alpha', category: 'Web Design' },
  { id: '2', title: 'Project Beta', category: 'Branding' },
  { id: '3', title: 'Project Gamma', category: 'Development' },
  { id: '4', title: 'Project Delta', category: 'UI/UX' },
  { id: '5', title: 'Project Epsilon', category: 'Web Design' },
  { id: '6', title: 'Project Zeta', category: 'Branding' }
]
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
      <div class="section-grid-auto section-grid-auto--lg">
        <article
          v-for="item in (items ?? demoItems)"
          :key="item.id"
          class="portfolio-card"
        >
          <div class="portfolio-card-image">
            <slot :name="`image-${item.id}`">
              <div class="image-placeholder">🎨</div>
            </slot>
          </div>
          <div class="portfolio-card-info">
            <span v-if="item.category" class="portfolio-card-category">
              {{ item.category }}
            </span>
            <h3 class="portfolio-card-title">{{ item.title }}</h3>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->

