<script setup lang="ts">
/**
 * About Section
 *
 * About/intro content with image and text.
 * Self-contained: fetches content from i18n (about.title, about.paragraph1, etc.)
 * Uses Tabler icons via unplugin-icons.
 */
import IconCamera from '~icons/tabler/camera'

defineProps<{
  /** Section title (overrides i18n) */
  title?: string
  /** Image URL */
  image?: string
  /** Image alt text */
  imageAlt?: string
  /** Reverse layout (image on right) */
  reversed?: boolean
}>()

const { t, te } = useI18n()

// Get content from i18n
const aboutTitle = computed(() => te('about.title') ? t('about.title') : '')
const paragraph1 = computed(() => te('about.paragraph1') ? t('about.paragraph1') : '')
const paragraph2 = computed(() => te('about.paragraph2') ? t('about.paragraph2') : '')
const hasI18nContent = computed(() => paragraph1.value || paragraph2.value)
</script>

<template>
  <!--
    Uses global classes from:
    - layout/sections.css (.section, .section-grid-2col, .section-image, .image-placeholder)
    - typography/base.css (.section-title, .text-lg, .text-secondary)
  -->
  <section id="about" class="section">
    <div class="container">
      <div class="section-grid-2col" :class="{ 'section-grid-2col--reversed': reversed }">
        <div>
          <h2 v-if="title || aboutTitle || $slots.title" v-reveal class="section-title">
            <slot name="title">{{ title || aboutTitle }}</slot>
          </h2>
          <div v-reveal="{ delay: 100 }" class="text-lg text-secondary">
            <!-- Use slot if provided, otherwise use i18n content -->
            <slot>
              <template v-if="hasI18nContent">
                <p>{{ paragraph1 }}</p>
                <p v-if="paragraph2" style="margin-top: var(--space-4)">{{ paragraph2 }}</p>
              </template>
            </slot>
          </div>
        </div>
        <div v-reveal="{ animation: reversed ? 'fade-right' : 'fade-left', delay: 200 }" class="section-image">
          <slot name="image">
            <div class="image-placeholder">
              <IconCamera />
            </div>
          </slot>
        </div>
      </div>
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->
