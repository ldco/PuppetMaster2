<script setup lang="ts">
/**
 * Hero Section
 *
 * Main landing section with big logo, subtext, and CTAs.
 *
 * Uses ClientOnly for logo to avoid SSR hydration mismatch
 * (logo src depends on colorMode which differs between server and client).
 */
import config from '~/puppet-master.config'

const { shortLogo } = useLogo()

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

// SSR fallback: use the default theme logo
const ssrFallbackLogo = computed(() => {
  const theme = config.defaultTheme === 'dark' ? 'light' : 'dark'
  return `${config.logo.basePath}/circle_${theme}_${config.defaultLocale}.svg`
})
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
          <ClientOnly>
            <img :src="shortLogo" alt="Logo" class="hero-logo-img" />
            <template #fallback>
              <img :src="ssrFallbackLogo" alt="Logo" class="hero-logo-img" />
            </template>
          </ClientOnly>
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

