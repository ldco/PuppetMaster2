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

<style scoped>
.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: color-mix(in srgb, var(--p-black), transparent 50%);
}

.mobile-nav-panel {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: min(320px, 85vw);
  background: var(--l-bg);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--l-border);
}

.mobile-nav-links {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.mobile-nav-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--l-border);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

[dir="rtl"] .slide-enter-from,
[dir="rtl"] .slide-leave-to {
  transform: translateX(100%);
}
</style>

