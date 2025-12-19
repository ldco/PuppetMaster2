<script setup lang="ts">
/**
 * HeaderActions Molecule
 *
 * Header action buttons grouped together:
 * - Quick contact buttons (phone + messenger) - optional via prop
 * - Theme toggle (if doubleTheme enabled)
 * - Language switcher (if multiLangs enabled)
 * - Login button (only in website-app mode)
 *
 * Shows only enabled features based on config.
 */
import IconLogin from '~icons/tabler/login'
import config from '~/puppet-master.config'

const props = withDefaults(defineProps<{
  /** Show contact buttons (set false in mobile menu where they're in header) */
  showContact?: boolean
  /** Language switcher direction: down (header), side (sidebar), inline (mobile menu) */
  langDirection?: 'down' | 'side' | 'inline'
}>(), {
  showContact: true,
  langDirection: 'down'
})

const { t } = useI18n()
</script>

<template>
  <!-- Uses global .header-actions class from skeleton/header.css -->
  <div class="header-actions">
    <!-- Quick contact buttons (left of toggles) - hidden in mobile menu -->
    <MoleculesHeaderContact v-if="showContact && config.headerContact?.enabled" />

    <AtomsThemeToggle v-if="config.hasThemeToggle" />
    <AtomsLangSwitcher v-if="config.isMultiLang" :direction="langDirection" />

    <!-- Login button - only in website-app mode -->
    <NuxtLink
      v-if="config.hasLoginButton"
      to="/login"
      class="header-login-btn"
    >
      <IconLogin aria-hidden="true" />
      <span>{{ t('auth.login') }}</span>
    </NuxtLink>
  </div>
</template>

<!-- No scoped styles needed - uses skeleton/header.css -->

