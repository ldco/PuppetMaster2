<script setup lang="ts">
/**
 * FooterNav Molecule
 *
 * Config-driven horizontal footer navigation links.
 * Uses skeleton classes from footer.css (.footer-nav-inline)
 */
import config from '~/puppet-master.config'

const { t } = useI18n()
const localePath = useLocalePath()

// Get sections that should appear in navigation
const navSections = computed(() =>
  config.sections.filter(section => section.inNav)
)

// Generate nav links
const navLinks = computed(() =>
  navSections.value.map(section => ({
    id: section.id,
    label: t(`nav.${section.id}`),
    href: config.features.onepager
      ? `#${section.id}`
      : localePath(`/${section.id === 'home' ? '' : section.id}`)
  }))
)
</script>

<template>
  <!-- Horizontal inline navigation -->
  <nav v-if="navLinks.length > 0" class="footer-nav-inline">
    <NuxtLink v-for="link in navLinks" :key="link.id" :href="link.href">
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>

