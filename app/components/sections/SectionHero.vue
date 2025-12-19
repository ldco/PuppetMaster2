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
const lightThemeLogo = computed(() =>
  `${config.logo.basePath}/circle_dark_${langSuffix.value}.svg`
)
const darkThemeLogo = computed(() =>
  `${config.logo.basePath}/circle_light_${langSuffix.value}.svg`
)

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
    <div class="container">
      <div class="hero-logo">
        <slot name="logo">
          <!-- Render BOTH logos, CSS shows correct one based on theme class -->
          <img :src="lightThemeLogo" alt="Logo" class="hero-logo-img hero-logo-img--light" />
          <img :src="darkThemeLogo" alt="Logo" class="hero-logo-img hero-logo-img--dark" />
        </slot>
      </div>
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
