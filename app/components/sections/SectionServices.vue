<script setup lang="ts">
/**
 * Services Section
 *
 * Feature cards showcasing services or benefits.
 * Self-contained: fetches services from i18n if not provided.
 */

export interface Service {
  id: string
  icon: string
  title: string
  description: string
}

const { t, te, tm } = useI18n()

const props = defineProps<{
  /** Section title (or use #title slot) */
  title?: string
  /** Services list (or use default slot for custom content) */
  services?: Service[]
}>()

// Self-contained: fetch title from i18n if not provided
const sectionTitle = computed(() => {
  if (te('services.title')) return t('services.title')
  if (te('nav.services')) return t('nav.services')
  return ''
})

// Self-contained: fetch services from i18n if not provided
const i18nServices = computed(() => {
  if (!te('services.items')) return []
  const items = tm('services.items') as Array<{ icon: string; title: string; description: string }>
  return items.map((item, index) => ({
    id: `service-${index}`,
    icon: item.icon || '✨',
    title: item.title || '',
    description: item.description || ''
  }))
})

const servicesData = computed(() => props.services || i18nServices.value)
const hasServices = computed(() => servicesData.value.length > 0)
</script>

<template>
  <!--
    Uses global classes from:
    - layout/sections.css (.section, .section-grid-auto)
    - typography/base.css (.section-title, .section-title--center)
    - ui/content/index.css (.service-card, .service-card-*)
  -->
  <section id="services" class="section">
    <div class="container">
      <h2 v-if="title || sectionTitle || $slots.title" v-reveal class="section-title section-title--center">
        <slot name="title">{{ title ?? sectionTitle }}</slot>
      </h2>
      <!-- Use services prop if provided, otherwise use i18n services -->
      <div v-if="hasServices" class="section-grid-auto" data-reveal-stagger>
        <article v-for="service in servicesData" :key="service.id" v-reveal="'scale'" class="service-card">
          <div class="service-card-icon">{{ service.icon }}</div>
          <h3 class="service-card-title">{{ service.title }}</h3>
          <p class="service-card-description">{{ service.description }}</p>
        </article>
      </div>
      <div v-else class="section-grid-auto" data-reveal-stagger>
        <slot />
      </div>
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->
