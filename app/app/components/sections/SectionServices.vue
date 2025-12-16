<script setup lang="ts">
/**
 * Services Section
 * 
 * Feature cards showcasing services or benefits.
 */

interface Service {
  id: string
  icon: string
  title: string
  description: string
}

defineProps<{
  /** Section title */
  title?: string
  /** Services list */
  services?: Service[]
}>()

// Placeholder services for demo
const demoServices: Service[] = [
  {
    id: '1',
    icon: '🎨',
    title: 'Pure CSS System',
    description: 'No Tailwind. Clean, semantic CSS with @layer, color-mix(), and light-dark().'
  },
  {
    id: '2',
    icon: '🌍',
    title: 'i18n + RTL',
    description: 'Multi-language support with automatic RTL layout for Hebrew, Arabic, etc.'
  },
  {
    id: '3',
    icon: '🌓',
    title: 'Dark Mode',
    description: 'Automatic dark/light mode with system preference detection.'
  },
  {
    id: '4',
    icon: '⚙️',
    title: 'Feature Toggles',
    description: 'Enable/disable features at build time for each project.'
  },
  {
    id: '5',
    icon: '💾',
    title: 'SQLite + Drizzle',
    description: 'Simple, file-based database with type-safe ORM.'
  },
  {
    id: '6',
    icon: '🚀',
    title: 'Docker + Kamal',
    description: 'Zero-downtime deployment to any VPS.'
  }
]
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
      <h2 class="section-title section-title--center">
        <slot name="title">{{ title ?? 'What We Offer' }}</slot>
      </h2>
      <div class="section-grid-auto">
        <article
          v-for="service in (services ?? demoServices)"
          :key="service.id"
          class="service-card"
        >
          <div class="service-card-icon">{{ service.icon }}</div>
          <h3 class="service-card-title">{{ service.title }}</h3>
          <p class="service-card-description">{{ service.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->

