<script setup lang="ts">
/**
 * BackToTop Atom
 *
 * Fixed button that appears when scrolling down.
 * Scrolls smoothly to top of page when clicked.
 */
import IconArrowUp from '~icons/tabler/arrow-up'

const { t } = useI18n()

// Track scroll position
const isVisible = ref(false)
const scrollThreshold = 300 // Show after scrolling 300px

const handleScroll = () => {
  isVisible.value = window.scrollY > scrollThreshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  // Check initial position
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="fade-slide">
    <button
      v-if="isVisible"
      type="button"
      class="back-to-top"
      :aria-label="t('footer.backToTop')"
      @click="scrollToTop"
    >
      <IconArrowUp />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: var(--z-sticky);

  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  background: var(--l-bg-elevated);
  color: var(--t-secondary);
  border: 1px solid var(--l-border);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.back-to-top:hover {
  background: var(--i-brand);
  color: var(--t-on-brand);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.back-to-top:active {
  transform: translateY(0);
}

/* Transition animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

