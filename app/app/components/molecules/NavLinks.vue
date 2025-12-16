<script setup lang="ts">
/**
 * NavLinks Molecule
 *
 * A group of navigation links.
 * Supports both regular routes and anchor links (for one-pager mode).
 */
import config from '~/puppet-master.config'

interface Section {
  id: string
  inNav: boolean
}

defineProps<{
  /** Vertical layout (for mobile menu) */
  vertical?: boolean
}>()

const { t } = useI18n()

const emit = defineEmits<{
  navigate: []
}>()

// Navigation links - derived from sections config
const navLinks = computed(() => {
  const sections = config.sections as readonly Section[]

  // For one-pager: anchor links
  if (config.features.onepager) {
    return sections
      .filter((s: Section) => s.inNav)
      .map((s: Section) => ({
        to: `#${s.id}`,
        label: t(`nav.${s.id}`),
        isAnchor: true
      }))
  }

  // For SPA: page routes
  return sections
    .filter((s: Section) => s.inNav)
    .map((s: Section) => ({
      to: `/${s.id === 'home' ? '' : s.id}`,
      label: t(`nav.${s.id}`),
      isAnchor: false
    }))
})
</script>

<template>
  <!-- Uses global classes from skeleton/nav.css (.nav-links, .nav-links--vertical) -->
  <nav class="nav-links" :class="{ 'nav-links--vertical': vertical }">
    <AtomsNavLink
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      :is-anchor="link.isAnchor"
      @click="emit('navigate')"
    >
      {{ link.label }}
    </AtomsNavLink>
  </nav>
</template>

<!-- No scoped styles needed - uses skeleton/nav.css -->

