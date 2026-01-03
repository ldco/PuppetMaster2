<script setup lang="ts">
/**
 * Hero Section
 *
 * Main landing section with big logo, subtext, and CTAs.
 *
 * Logo Strategy: Render BOTH theme variants, CSS shows correct one.
 * This avoids SSR hydration mismatch AND flash of wrong logo.
 */
import config from '~/puppet-master.config'

const { locale } = useI18n()

// Get effective language for logo (fallback for languages without logos)
const langSuffix = computed(() => {
  const lang = locale.value
  // Check if logo exists for this language
  const hasLogo = config.logo.available.some(name => name.endsWith(`_${lang}`))
  if (hasLogo) return lang
  // Use fallback chain
  const fallback = config.logo.langFallback as Record<string, string>
  return fallback[lang] || config.defaultLocale
})

// Get logo paths for both themes
const lightThemeLogo = computed(() => `${config.logo.basePath}/circle_dark_${langSuffix.value}.svg`)
const darkThemeLogo = computed(() => `${config.logo.basePath}/circle_light_${langSuffix.value}.svg`)

defineProps<{
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
    - typography/base.css (.hero-subtitle)
  -->
  <section id="home" class="section section-hero section-hero--center">
    <!-- Floating decorations for candy effect -->
    <div class="hero-decorations" aria-hidden="true">
      <!-- Animated blobs -->
      <div class="hero-blob hero-blob--1" />
      <div class="hero-blob hero-blob--2" />
      <div class="hero-blob hero-blob--3" />
      <!-- Geometric shapes -->
      <div class="hero-shape hero-shape--circle" />
      <div class="hero-shape hero-shape--square" />
      <div class="hero-shape hero-shape--triangle" />
      <!-- Floating dots -->
      <div class="hero-dots hero-dots--1" />
      <div class="hero-dots hero-dots--2" />
      <div class="hero-dots hero-dots--3" />
      <div class="hero-dots hero-dots--4" />
    </div>

    <div class="container">
      <div v-reveal="'scale'" class="hero-logo">
        <slot name="logo">
          <!-- Render BOTH logos, CSS shows correct one based on theme class -->
          <img
            :src="lightThemeLogo"
            alt="Logo"
            class="hero-logo-img hero-logo-img--light"
            width="200"
            height="200"
          />
          <img
            :src="darkThemeLogo"
            alt="Logo"
            class="hero-logo-img hero-logo-img--dark"
            width="200"
            height="200"
          />
        </slot>
      </div>
      <p v-if="subtitle" v-reveal="{ animation: 'fade-up', delay: 100 }" class="hero-subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
      <div v-if="primaryCta || secondaryCta" v-reveal="{ animation: 'fade-up', delay: 200 }" class="hero-actions">
        <slot name="actions">
          <AtomsCtaButton
            v-if="primaryCta && primaryLink"
            :to="primaryLink"
            variant="primary"
            size="lg"
          >
            {{ primaryCta }}
          </AtomsCtaButton>
          <AtomsCtaButton
            v-if="secondaryCta && secondaryLink"
            :to="secondaryLink"
            variant="outline"
            size="lg"
          >
            {{ secondaryCta }}
          </AtomsCtaButton>
        </slot>
      </div>
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->
