<script setup lang="ts">
/**
 * MobileNav Organism
 * 
 * Full-screen mobile navigation overlay.
 * Slides in from the left (RTL: right).
 */

defineProps<{
  /** Whether the nav is visible */
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') emit('close')
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => window.removeEventListener('keydown', handleEscape))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="mobile-nav-overlay"
        @click.self="emit('close')"
      >
        <Transition name="slide">
          <div v-if="isOpen" class="mobile-nav-panel">
            <div class="mobile-nav-header">
              <AtomsLogo />
              <button
                type="button"
                class="btn btn-icon btn-ghost"
                aria-label="Close menu"
                @click="emit('close')"
              >
                ✕
              </button>
            </div>
            
            <nav class="mobile-nav-links">
              <MoleculesNavLinks vertical @navigate="emit('close')" />
            </nav>
            
            <div class="mobile-nav-footer">
              <MoleculesHeaderActions />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<!--
  Uses global CSS classes from skeleton/mobile-nav.css:
  - .mobile-nav-overlay, .mobile-nav-panel, .mobile-nav-header
  - .mobile-nav-links, .mobile-nav-footer
  - .fade-*, .slide-* animation classes
-->

