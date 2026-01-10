<script setup lang="ts">
/**
 * Admin Sections Page
 *
 * Manage homepage section visibility and ordering.
 * Sections are defined in puppet-master.config.ts
 * Future: Drag-and-drop reordering, enable/disable per section.
 */
import IconLayout from '~icons/tabler/layout'
import IconEye from '~icons/tabler/eye'
import IconEyeOff from '~icons/tabler/eye-off'
import IconGripVertical from '~icons/tabler/grip-vertical'
import config from '~/puppet-master.config'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
  pageTransition: false
})

const { t } = useI18n()

useHead({
  title: () => `${t('admin.navSections')} | Admin`
})

// Get website sections from config
// config.sections is array of { id: string, inNav: boolean }
const websiteSections = computed(() => {
  return (config.sections || []).map(section => ({
    id: section.id,
    enabled: true, // All sections in config are enabled
    inNav: section.inNav
  }))
})

// Available section types (for reference)
const sectionTypes = [
  'hero',
  'features',
  'services',
  'portfolio',
  'team',
  'testimonials',
  'clients',
  'pricing',
  'faq',
  'blog',
  'cta',
  'contact'
]
</script>

<template>
  <div class="admin-sections">
    <div class="page-header">
      <h1 class="page-title">
        <IconLayout class="page-title-icon" />
        {{ t('admin.sections') }}
      </h1>
    </div>

    <!-- Info card -->
    <div class="card info-card">
      <p class="text-secondary">
        {{ t('admin.sectionsDescription') }}
      </p>
    </div>

    <!-- Current sections -->
    <div class="card">
      <h3 class="card-title">{{ t('admin.currentSections') }}</h3>
      <div class="sections-list">
        <div
          v-for="(section, index) in websiteSections"
          :key="section.id"
          class="section-item"
        >
          <div class="section-drag">
            <IconGripVertical class="drag-icon" />
          </div>
          <div class="section-order">{{ index + 1 }}</div>
          <div class="section-name">
            {{ t(`sections.${section.id}`, section.id) }}
          </div>
          <div class="section-status">
            <IconEye v-if="section.inNav" class="status-enabled" />
            <IconEyeOff v-else class="status-disabled" />
          </div>
        </div>
      </div>
    </div>

    <!-- Coming soon notice -->
    <div class="card coming-soon-card">
      <h3>{{ t('admin.sectionsComingSoon') }}</h3>
      <p class="text-secondary">
        {{ t('admin.sectionsComingSoonDesc') }}
      </p>
      <ul class="feature-list">
        <li>{{ t('admin.sectionsFeature1') }}</li>
        <li>{{ t('admin.sectionsFeature2') }}</li>
        <li>{{ t('admin.sectionsFeature3') }}</li>
      </ul>
    </div>

    <!-- Config reference -->
    <div class="card">
      <h3 class="card-title">{{ t('admin.configReference') }}</h3>
      <p class="text-secondary">
        {{ t('admin.sectionsConfigHint') }}
      </p>
      <code class="code-block">
        // puppet-master.config.ts<br />
        sections: [<br />
        &nbsp;&nbsp;{ id: 'home', inNav: true },<br />
        &nbsp;&nbsp;{ id: 'about', inNav: true },<br />
        &nbsp;&nbsp;...<br />
        ]
      </code>
    </div>
  </div>
</template>
