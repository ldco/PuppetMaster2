<script setup lang="ts">
/**
 * Features Section
 *
 * Displays feature cards with icons, titles, and descriptions.
 * Uses icon map pattern for dynamic icon rendering.
 *
 * CSS: ui/content/features.css
 * Classes: .features-grid, .feature-card, .feature-icon, .feature-title, .feature-description
 */

// Import feature icons
import IconDeviceMobile from '~icons/tabler/device-mobile'
import IconRocket from '~icons/tabler/rocket'
import IconSearch from '~icons/tabler/search'
import IconShieldCheck from '~icons/tabler/shield-check'
import IconChartBar from '~icons/tabler/chart-bar'
import IconHeadset from '~icons/tabler/headset'
import IconStar from '~icons/tabler/star'
import IconBolt from '~icons/tabler/bolt'
import IconLock from '~icons/tabler/lock'
import IconCloud from '~icons/tabler/cloud'
import IconCode from '~icons/tabler/code'
import IconPalette from '~icons/tabler/palette'
import IconSettings from '~icons/tabler/settings'
import IconHeart from '~icons/tabler/heart'

// Icon map: database icon name → component
const iconMap: Record<string, Component> = {
  'device-mobile': IconDeviceMobile,
  'rocket': IconRocket,
  'search': IconSearch,
  'shield-check': IconShieldCheck,
  'chart-bar': IconChartBar,
  'headset': IconHeadset,
  'star': IconStar,
  'bolt': IconBolt,
  'lock': IconLock,
  'cloud': IconCloud,
  'code': IconCode,
  'palette': IconPalette,
  'settings': IconSettings,
  'heart': IconHeart
}

interface FeatureData {
  id: number
  slug: string
  icon: string
  imageUrl: string | null
  hoverImageUrl: string | null
  category: string | null
  title: string
  description: string | null
}

const { t, te, locale } = useI18n()

defineProps<{
  title?: string
  /** Use bento grid layout */
  bento?: boolean
}>()

const sectionTitle = computed(() => {
  if (te('features.title')) return t('features.title')
  if (te('nav.features')) return t('nav.features')
  return ''
})

const { isEnabled } = useModule('features')

const { data: features, pending } = await useFetch<FeatureData[]>('/api/features', {
  key: `features-${locale.value}`,
  query: { locale: locale.value },
  watch: [locale]
})

// Check if any feature has images - use image-based layout
const hasImages = computed(() => {
  return features.value?.some(f => f.imageUrl) ?? false
})

// Get icon component for a feature
function getIcon(iconName: string): Component {
  return iconMap[iconName] || IconStar
}
</script>

<template>
  <section v-if="isEnabled" id="features" class="section">
    <div class="container">
      <h2 v-if="title || sectionTitle || $slots.title" v-reveal class="section-title section-title--center">
        <slot name="title">{{ title ?? sectionTitle }}</slot>
      </h2>

      <div class="section-body">
        <div v-if="pending" class="features-loading">{{ t('common.loading') }}</div>

        <p v-else-if="!features?.length" class="text-center text-secondary">{{ t('features.noItems') }}</p>

        <div
          v-else
          class="features-grid"
          :class="{
            'features-grid--bento': bento && features.length === 6 && !hasImages,
            'features-grid--images': hasImages
          }"
          v-reveal
        >
          <!-- Image-based cards -->
          <template v-if="hasImages">
            <div
              v-for="feature in features"
              :key="feature.id"
              class="feature-card"
              :class="{ 'feature-card--image': feature.imageUrl }"
            >
              <!-- Image version -->
              <template v-if="feature.imageUrl">
                <div class="feature-card__image">
                  <img
                    :src="feature.imageUrl"
                    :alt="feature.title"
                    class="feature-card__img feature-card__img--default"
                  />
                  <img
                    v-if="feature.hoverImageUrl"
                    :src="feature.hoverImageUrl"
                    :alt="feature.title"
                    class="feature-card__img feature-card__img--hover"
                  />
                </div>
                <div class="feature-card__content">
                  <h3 class="feature-card__title">{{ feature.title }}</h3>
                  <p v-if="feature.description" class="feature-card__description">
                    {{ feature.description }}
                  </p>
                </div>
              </template>
              <!-- Icon fallback -->
              <template v-else>
                <div class="feature-card__icon">
                  <component :is="getIcon(feature.icon)" />
                </div>
                <div class="feature-card__content">
                  <h3 class="feature-card__title">{{ feature.title }}</h3>
                  <p v-if="feature.description" class="feature-card__description">
                    {{ feature.description }}
                  </p>
                </div>
              </template>
            </div>
          </template>

          <!-- Icon-based cards (default) -->
          <template v-else>
            <div
              v-for="feature in features"
              :key="feature.id"
              class="feature-card"
            >
              <div class="feature-card__icon">
                <component :is="getIcon(feature.icon)" />
              </div>
              <div class="feature-card__content">
                <h3 class="feature-card__title">{{ feature.title }}</h3>
                <p v-if="feature.description" class="feature-card__description">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
