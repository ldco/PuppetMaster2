<script setup lang="ts">
/**
 * Language Switcher Atom
 *
 * Button-based language switcher with popup panel.
 * Uses @nuxtjs/i18n under the hood.
 *
 * Props:
 * - direction: 'down' (header) | 'side' (sidebar) - where panel opens
 *
 * Wrapped in ClientOnly because locale depends on cookies (client-side only).
 * This prevents SSR/hydration mismatch where server renders 'en' but
 * client has 'ru' from cookie.
 */

const props = withDefaults(defineProps<{
  /** Direction panel opens: 'down' for header, 'side' for sidebar */
  direction?: 'down' | 'side'
}>(), {
  direction: 'down'
})

const { t } = useI18n()
const { locale, locales, setLocale } = useI18n()

const panelOpen = ref(false)

function togglePanel() {
  panelOpen.value = !panelOpen.value
}

function selectLocale(code: string) {
  setLocale(code as 'en' | 'ru' | 'he')
  panelOpen.value = false
}

// Close on click outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.lang-switcher-wrapper')) {
    panelOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <ClientOnly>
    <div
      class="lang-switcher-wrapper"
      :class="`lang-switcher--${direction}`"
    >
      <button
        type="button"
        class="lang-switcher-btn"
        :aria-label="t('common.language')"
        @click="togglePanel"
      >
        <span class="lang-switcher-code">{{ locale.toUpperCase() }}</span>
      </button>

      <div v-if="panelOpen" class="lang-switcher-panel">
        <button
          v-for="loc in locales"
          :key="loc.code"
          type="button"
          class="lang-switcher-option"
          :class="{ active: locale === loc.code }"
          @click="selectLocale(loc.code)"
        >
          {{ loc.code.toUpperCase() }}
        </button>
      </div>
    </div>
  </ClientOnly>
</template>

<!--
  Uses global CSS classes from ui/content/lang-switcher.css
-->

