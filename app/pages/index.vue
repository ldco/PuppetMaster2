<!--
  Home Page (One-Pager Mode)

  Renders all sections in sequence for scroll-based navigation.
  Each section has an id matching the nav links from config.sections.
  All text comes from i18n translations - editable via Admin Panel.
-->

<script setup lang="ts">
const { t } = useI18n()

// Page meta with translations
useHead({
  title: t('seo.homeTitle'),
  meta: [
    { name: 'description', content: t('seo.homeDescription') }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <SectionsSectionHero
      :subtitle="t('hero.subtitle')"
      :primary-cta="t('hero.primaryCta')"
      primary-link="#services"
      :secondary-cta="t('hero.secondaryCta')"
      secondary-link="#portfolio"
    />

    <!-- About Section -->
    <SectionsSectionAbout>
      <template #title>{{ t('about.title') }}</template>
      <p>{{ t('about.paragraph1') }}</p>
      <p style="margin-top: var(--space-4);">{{ t('about.paragraph2') }}</p>
    </SectionsSectionAbout>

    <!-- Portfolio Section -->
    <SectionsSectionPortfolio :title="t('portfolio.title')" />

    <!-- Services Section -->
    <SectionsSectionServices :title="t('services.title')" />

    <!-- Contact Section -->
    <SectionsSectionContact
      :title="t('contact.title')"
      show-info
    />
  </div>
</template>

