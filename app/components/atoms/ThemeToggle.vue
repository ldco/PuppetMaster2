<script setup lang="ts">
/**
 * Theme Toggle Atom
 *
 * Toggles between light and dark mode.
 * Uses @nuxtjs/color-mode under the hood.
 * Icons from Tabler via unplugin-icons.
 *
 * Uses ClientOnly to avoid SSR hydration mismatch since
 * colorMode.value can differ between server and client.
 */
import IconSun from '~icons/tabler/sun'
import IconMoon from '~icons/tabler/moon'

const colorMode = useColorMode()
const { t } = useI18n()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="btn btn-icon btn-ghost"
      :aria-label="t('theme.' + colorMode.preference)"
      @click="toggleTheme"
    >
      <IconMoon v-if="isDark" />
      <IconSun v-else />
    </button>
    <!-- Fallback shows nothing during SSR - button appears on hydration -->
    <template #fallback>
      <button type="button" class="btn btn-icon btn-ghost" aria-label="Theme">
        <IconSun />
      </button>
    </template>
  </ClientOnly>
</template>

<!-- No scoped styles needed - btn-icon handles sizing -->

