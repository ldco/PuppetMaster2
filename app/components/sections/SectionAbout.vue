<script setup lang="ts">
/**
 * About Section
 *
 * About/intro content with image and text.
 * Uses Tabler icons via unplugin-icons.
 */
import IconCamera from '~icons/tabler/camera'

defineProps<{
  /** Section title */
  title?: string
  /** Main text content */
  content?: string
  /** Image URL */
  image?: string
  /** Image alt text */
  imageAlt?: string
  /** Reverse layout (image on right) */
  reversed?: boolean
}>()
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
          <h2 class="section-title">
            <slot name="title">{{ title ?? 'About Us' }}</slot>
          </h2>
          <div class="text-lg text-secondary">
            <slot>
              <p>
                {{ content ?? 'Tell your story here. What makes you unique? What drives you?' }}
              </p>
            </slot>
          </div>
        </div>
        <div class="section-image">
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
