<script setup lang="ts">
/**
 * HeaderActions Molecule
 *
 * Header action buttons grouped together:
 * - Theme toggle (if doubleTheme enabled)
 * - Language switcher (if multiLangs enabled)
 * - Login button (only in site-app mode)
 *
 * Shows only enabled features based on config.
 */
import IconLogin from '~icons/tabler/login'
import config from '~/puppet-master.config'

const { t } = useI18n()
</script>

<template>
  <!-- Uses global .header-actions class from skeleton/header.css -->
  <div class="header-actions">
    <AtomsThemeToggle v-if="config.hasThemeToggle" />
    <AtomsLangSwitcher v-if="config.isMultiLang" />

    <!-- Login button - only in site-app mode -->
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

