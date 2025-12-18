<script setup lang="ts">
/**
 * NavLinks Molecule
 *
 * A group of navigation links.
 * Supports both regular routes and anchor links (for one-pager mode).
 * Uses scrollspy for active state in onepager mode.
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

// Get section IDs for scrollspy
const sectionIds = computed(() =>
  (config.sections as readonly Section[])
    .filter((s: Section) => s.inNav)
    .map((s: Section) => s.id)
)

// Scrollspy for onepager mode - detects which section is in view
const { activeSection } = config.features.onepager
  ? useScrollSpy(sectionIds.value)
  : { activeSection: ref('') }

// Navigation links - derived from sections config
const navLinks = computed(() => {
  const sections = config.sections as readonly Section[]

  // For one-pager: all sections use anchor links
  // Active state is handled by scrollspy (isActive prop)
  if (config.features.onepager) {
    return sections
      .filter((s: Section) => s.inNav)
      .map((s: Section) => ({
        id: s.id,
        to: `#${s.id}`,
        label: t(`nav.${s.id}`),
        isAnchor: true
      }))
  }

  // For SPA: page routes
  return sections
    .filter((s: Section) => s.inNav)
    .map((s: Section) => ({
      id: s.id,
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
      :is-active="link.isAnchor && activeSection === link.id"
      @click="emit('navigate')"
    >
      {{ link.label }}
    </AtomsNavLink>
  </nav>
</template>

<!-- No scoped styles needed - uses skeleton/nav.css -->

