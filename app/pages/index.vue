<!--
  Home Page

  In onepager mode: Renders ALL sections for scroll-based navigation.
  In SPA mode: Renders ONLY hero - other sections have their own routes.

  Sections are rendered dynamically from config.sections.
  Each section component fetches its own content from i18n.
-->

<script setup lang="ts">
import config from '~/puppet-master.config'

const { t } = useI18n()
const localePath = useLocalePath()

const isOnepager = config.features.onepager

// Get link based on mode (anchor for onepager, route for SPA)
const getSectionLink = (sectionId: string) => {
  if (isOnepager) {
    return `#${sectionId}`
  }
  return localePath(`/${sectionId}`)
}

// Get sections to render (excluding 'home' which is the hero)
const sectionsToRender = computed(() =>
  config.sections.filter(s => s.id !== 'home')
)

// Page meta with translations
useHead({
  title: t('seo.homeTitle'),
  meta: [{ name: 'description', content: t('seo.homeDescription') }]
})
</script>

<template>
  <div>
    <!-- Hero Section (always shown, has special props) -->
    <SectionsSectionHero
      :subtitle="t('hero.subtitle')"
      :primary-cta="t('hero.primaryCta')"
      :primary-link="getSectionLink('services')"
      :secondary-cta="t('hero.secondaryCta')"
      :secondary-link="getSectionLink('portfolio')"
    />

    <!-- Other sections rendered dynamically (only in onepager mode) -->
    <template v-if="isOnepager">
      <OrganismsSectionRenderer
        v-for="section in sectionsToRender"
        :key="section.id"
        :section-id="section.id"
      />
    </template>
  </div>
</template>
