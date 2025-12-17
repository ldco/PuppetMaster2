<script setup lang="ts">
/**
 * Admin Login Page
 *
 * Used in:
 * - app-only mode: Main entry point (/ redirects here)
 * - website-admin mode: Hidden admin access at /admin/login
 *
 * Reuses the same login form logic, different layout context.
 *
 * Uses ClientOnly for logo to avoid SSR hydration mismatch.
 */
import config from '~/puppet-master.config'
import IconLogin from '~icons/tabler/login'
import IconMail from '~icons/tabler/mail'
import IconLock from '~icons/tabler/lock'

definePageMeta({
  layout: 'blank'
})

const { t } = useI18n()
const { login, isLoading, isAuthenticated } = useAuth()
const { shortLogo } = useLogo()

// SSR fallback: use the default theme logo
const ssrFallbackLogo = computed(() => {
  const theme = config.defaultTheme === 'dark' ? 'light' : 'dark'
  return `${config.logo.basePath}/circle_${theme}_${config.defaultLocale}.svg`
})

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorMessage = ref('')

// Redirect if already authenticated
onMounted(async () => {
  const { checkSession } = useAuth()
  await checkSession()
  if (isAuthenticated.value) {
    navigateTo('/admin')
  }
})

async function handleSubmit() {
  errorMessage.value = ''

  const result = await login({
    email: email.value,
    password: password.value,
    rememberMe: rememberMe.value
  })

  if (result.success) {
    navigateTo('/admin')
  } else {
    errorMessage.value = result.error || t('auth.loginFailed')
  }
}
</script>

<template>
  <!-- Uses .auth-page, .auth-card, etc. from ui/forms/inputs.css -->
  <div class="auth-page">
    <div class="auth-card">
      <!-- Logo - using circle variant for auth pages - ClientOnly for SSR -->
      <div class="auth-logo">
        <ClientOnly>
          <img :src="shortLogo" alt="Logo" class="auth-logo-img">
          <template #fallback>
            <img :src="ssrFallbackLogo" alt="Logo" class="auth-logo-img">
          </template>
        </ClientOnly>
      </div>

      <!-- Title -->
      <h1 class="auth-title">Admin {{ t('auth.login') }}</h1>

      <!-- Error Message -->
      <div v-if="errorMessage" class="form-error" style="text-align: center; margin-block-end: var(--space-4);">
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="handleSubmit">
        <!-- Email -->
        <div class="form-group">
          <label class="form-label" for="email">{{ t('auth.email') }}</label>
          <div class="input-with-icon">
            <IconMail class="input-icon" aria-hidden="true" />
            <input
              id="email"
              v-model="email"
              type="email"
              class="input"
              autocomplete="email"
              required
            >
          </div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label" for="password">{{ t('auth.password') }}</label>
          <div class="input-with-icon">
            <IconLock class="input-icon" aria-hidden="true" />
            <input
              id="password"
              v-model="password"
              type="password"
              class="input"
              autocomplete="current-password"
              required
            >
          </div>
        </div>

        <!-- Remember me -->
        <label class="checkbox">
          <input v-model="rememberMe" type="checkbox">
          <span>{{ t('auth.rememberMe') }}</span>
        </label>

        <!-- Submit -->
        <button type="submit" class="btn btn-primary btn-full" :disabled="isLoading">
          <IconLogin v-if="!isLoading" aria-hidden="true" />
          <span>{{ isLoading ? t('common.loading') : t('auth.login') }}</span>
        </button>
      </form>

      <!-- Back to site link (only for website-admin mode) -->
      <div class="auth-footer">
        <NuxtLink to="/" class="auth-link">
          ← Back to website
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

