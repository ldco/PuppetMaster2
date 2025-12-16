<script setup lang="ts">
/**
 * Hero Section
 * 
 * Main landing section with headline, subtext, and CTAs.
 */

const { t } = useI18n()

defineProps<{
  /** Main headline */
  title?: string
  /** Supporting text */
  subtitle?: string
  /** Primary CTA text */
  primaryCta?: string
  /** Primary CTA link */
  primaryLink?: string
  /** Secondary CTA text */
  secondaryCta?: string
  /** Secondary CTA link */
  secondaryLink?: string
}>()
</script>

<template>
  <!--
    Uses global classes from:
    - layout/sections.css (.section, .section-hero, .section-hero--center, .hero-actions)
    - typography/base.css (.hero-title, .hero-subtitle, .text-gradient)
  -->
  <section id="home" class="section section-hero section-hero--center">
    <div class="container">
      <h1 class="hero-title">
        <slot name="title">{{ title ?? 'Welcome to Puppet Master' }}</slot>
      </h1>
      <p class="hero-subtitle">
        <slot name="subtitle">
          {{ subtitle ?? 'A studio toolkit for creating stable, secure landing pages and portfolio sites.' }}
        </slot>
      </p>
      <div class="hero-actions">
        <slot name="actions">
          <AtomsCtaButton
            v-if="primaryCta || primaryLink"
            :to="primaryLink ?? '#about'"
            variant="primary"
            size="lg"
          >
            {{ primaryCta ?? 'Get Started' }}
          </AtomsCtaButton>
          <AtomsCtaButton
            v-if="secondaryCta || secondaryLink"
            :to="secondaryLink ?? '#portfolio'"
            variant="outline"
            size="lg"
          >
            {{ secondaryCta ?? 'View Work' }}
          </AtomsCtaButton>
        </slot>
      </div>
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->

