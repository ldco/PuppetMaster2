<script setup lang="ts">
/**
 * Language Switcher Atom
 *
 * Dropdown to switch between available languages.
 * Uses @nuxtjs/i18n under the hood.
 *
 * Wrapped in ClientOnly because locale depends on cookies (client-side only).
 * This prevents SSR/hydration mismatch where server renders 'en' but
 * client has 'ru' from cookie.
 */

const { locale, locales, setLocale } = useI18n()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  setLocale(target.value as 'en' | 'ru' | 'he')
}
</script>

<template>
  <ClientOnly>
    <select
      class="input lang-switcher"
      :value="locale"
      @change="handleChange"
    >
      <option
        v-for="loc in locales"
        :key="loc.code"
        :value="loc.code"
      >
        {{ loc.name }}
      </option>
    </select>
  </ClientOnly>
</template>

<!--
  Uses global CSS classes from ui/content/index.css:
  - .input (base)
  - .lang-switcher
-->

