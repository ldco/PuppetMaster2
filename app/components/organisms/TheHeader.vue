<script setup lang="ts">
/**
 * TheHeader Organism
 *
 * Main site header with responsive behavior.
 * Desktop: Full nav visible
 * Mobile: Hamburger menu with overlay navigation
 * Uses Tabler icons via unplugin-icons.
 */
import config from '~/puppet-master.config'
import IconX from '~icons/tabler/x'

const { t } = useI18n()
const isMenuOpen = ref(false)
const showMenu = ref(false)

// Scroll behavior - ONLY in onepager mode!
// hideOnScroll respects config.features.hideHeaderOnScroll
const { isScrolled, isHidden } = useScrollHeader({
  threshold: 50,
  hideOnScroll: config.features.hideHeaderOnScroll,
  enabled: config.features.onepager && config.features.interactiveHeader
})

// Animation timing for hamburger
watch(isMenuOpen, (open) => {
  if (open) {
    setTimeout(() => { showMenu.value = true }, 200)
  } else {
    showMenu.value = false
  }
})

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <header
    class="header"
    :class="{
      'header--scrolled': isScrolled,
      'header--hidden': isHidden
    }"
  >
    <div class="header-inner container">
      <!-- Mobile: Hamburger (left) -->
      <div class="mobile-only">
        <AtomsHamburgerIcon
          :is-open="isMenuOpen"
          :label="isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          @toggle="isMenuOpen = !isMenuOpen"
        />
      </div>

      <!-- Logo (center on mobile, left on desktop) -->
      <AtomsLogo class="header-logo" />

      <!-- Desktop: Navigation (center) -->
      <MoleculesNavLinks class="desktop-only" />

      <!-- Desktop: Actions (right) -->
      <MoleculesHeaderActions class="desktop-only" />

      <!-- Mobile spacer for centering logo -->
      <div class="mobile-only" style="width: 48px;"></div>
    </div>

    <!-- Mobile Navigation Overlay - uses skeleton/mobile-nav.css -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="showMenu" class="mobile-nav-backdrop" @click="closeMenu" />
      </Transition>
      <Transition name="slide-left">
        <nav v-if="showMenu" class="mobile-nav">
          <div class="mobile-nav-header">
            <AtomsLogo />
            <button
              type="button"
              class="mobile-nav-close"
              :aria-label="t('nav.closeMenu')"
              @click="closeMenu"
            >
              <IconX />
            </button>
          </div>
          <div class="mobile-nav-body">
            <MoleculesNavLinks vertical @navigate="closeMenu" />
          </div>
          <div class="mobile-nav-settings">
            <MoleculesHeaderActions />
          </div>
        </nav>
      </Transition>
    </Teleport>
  </header>
</template>

<!--
  All styles are in global CSS:
  - skeleton/header.css (header, logo, mobile layout)
  - skeleton/mobile-nav.css (mobile nav overlay)
  - skeleton/nav.css (nav links)
  No scoped styles needed!
-->

