<script setup lang="ts">
/**
 * Onboarding Wizard (LOW-05)
 *
 * Step-by-step wizard for first-time site setup.
 * Guides users through essential configuration.
 */

const { t } = useI18n()
const router = useRouter()

const {
  currentStep,
  currentStepIndex,
  formData,
  isFirstStep,
  isLastStep,
  isStepValid,
  progress,
  steps,
  isSubmitting,
  error,
  nextStep,
  prevStep,
  updateField,
  completeOnboarding
} = useOnboarding()

async function handleNext() {
  if (isLastStep.value) {
    const success = await completeOnboarding()
    if (success) {
      router.push('/admin')
    }
  } else {
    nextStep()
  }
}

function handleSkip() {
  if (!isLastStep.value) {
    nextStep()
  }
}
</script>

<template>
  <div class="onboarding-wizard">
    <!-- Progress bar -->
    <div class="onboarding-progress">
      <div class="onboarding-progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- Step indicators -->
    <div class="onboarding-steps">
      <button
        v-for="(step, index) in steps"
        :key="step.id"
        class="onboarding-step-dot"
        :class="{
          'is-active': index === currentStepIndex,
          'is-completed': index < currentStepIndex
        }"
        :disabled="index > currentStepIndex"
        @click="index < currentStepIndex && (currentStepIndex = index)"
      >
        <span class="sr-only">{{ t(step.title) }}</span>
      </button>
    </div>

    <!-- Step content -->
    <div class="onboarding-content">
      <h1 class="onboarding-title">{{ t(currentStep.title) }}</h1>
      <p class="onboarding-description">{{ t(currentStep.description) }}</p>

      <!-- Welcome step -->
      <div v-if="currentStep.id === 'welcome'" class="onboarding-step-content">
        <div class="onboarding-welcome-icon">
          <IconTablerRocket class="icon-xl" />
        </div>
        <p class="onboarding-welcome-text">{{ t('admin.onboarding.welcomeText') }}</p>
      </div>

      <!-- Contact step -->
      <div v-else-if="currentStep.id === 'contact'" class="onboarding-step-content">
        <div class="onboarding-form">
          <div class="form-group">
            <label class="form-label">{{ t('admin.onboarding.email') }}</label>
            <input
              type="email"
              class="input"
              :value="formData['contact.email']"
              @input="updateField('contact.email', ($event.target as HTMLInputElement).value)"
              :placeholder="t('admin.onboarding.emailPlaceholder')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('admin.onboarding.phone') }}</label>
            <input
              type="tel"
              class="input"
              :value="formData['contact.phone']"
              @input="updateField('contact.phone', ($event.target as HTMLInputElement).value)"
              :placeholder="t('admin.onboarding.phonePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('admin.onboarding.location') }}</label>
            <input
              type="text"
              class="input"
              :value="formData['contact.location']"
              @input="updateField('contact.location', ($event.target as HTMLInputElement).value)"
              :placeholder="t('admin.onboarding.locationPlaceholder')"
            />
          </div>
        </div>
      </div>

      <!-- Social step -->
      <div v-else-if="currentStep.id === 'social'" class="onboarding-step-content">
        <div class="onboarding-form">
          <div class="form-group">
            <label class="form-label">
              <IconTablerBrandTelegram class="icon-sm" />
              Telegram
            </label>
            <input
              type="url"
              class="input"
              :value="formData['social.telegram']"
              @input="updateField('social.telegram', ($event.target as HTMLInputElement).value)"
              placeholder="https://t.me/username"
            />
          </div>
          <div class="form-group">
            <label class="form-label">
              <IconTablerBrandInstagram class="icon-sm" />
              Instagram
            </label>
            <input
              type="url"
              class="input"
              :value="formData['social.instagram']"
              @input="updateField('social.instagram', ($event.target as HTMLInputElement).value)"
              placeholder="https://instagram.com/username"
            />
          </div>
          <div class="form-group">
            <label class="form-label">
              <IconTablerBrandFacebook class="icon-sm" />
              Facebook
            </label>
            <input
              type="url"
              class="input"
              :value="formData['social.facebook']"
              @input="updateField('social.facebook', ($event.target as HTMLInputElement).value)"
              placeholder="https://facebook.com/page"
            />
          </div>
          <div class="form-group">
            <label class="form-label">
              <IconTablerBrandWhatsapp class="icon-sm" />
              WhatsApp
            </label>
            <input
              type="url"
              class="input"
              :value="formData['social.whatsapp']"
              @input="updateField('social.whatsapp', ($event.target as HTMLInputElement).value)"
              placeholder="https://wa.me/1234567890"
            />
          </div>
        </div>
        <p class="onboarding-hint">{{ t('admin.onboarding.socialHint') }}</p>
      </div>

      <!-- SEO step -->
      <div v-else-if="currentStep.id === 'seo'" class="onboarding-step-content">
        <div class="onboarding-form">
          <div class="form-group">
            <label class="form-label">{{ t('admin.onboarding.siteTitle') }}</label>
            <input
              type="text"
              class="input"
              :value="formData['seo.title']"
              @input="updateField('seo.title', ($event.target as HTMLInputElement).value)"
              :placeholder="t('admin.onboarding.siteTitlePlaceholder')"
            />
          </div>
          <div class="form-group form-group--full">
            <label class="form-label">{{ t('admin.onboarding.siteDescription') }}</label>
            <textarea
              class="input"
              rows="3"
              :value="formData['seo.description']"
              @input="updateField('seo.description', ($event.target as HTMLTextAreaElement).value)"
              :placeholder="t('admin.onboarding.siteDescriptionPlaceholder')"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Complete step -->
      <div v-else-if="currentStep.id === 'complete'" class="onboarding-step-content">
        <div class="onboarding-complete-icon">
          <IconTablerCircleCheck class="icon-xl" />
        </div>
        <p class="onboarding-complete-text">{{ t('admin.onboarding.completeText') }}</p>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="onboarding-error">{{ error }}</div>

    <!-- Navigation -->
    <div class="onboarding-nav">
      <button
        v-if="!isFirstStep"
        type="button"
        class="btn btn-ghost"
        @click="prevStep"
        :disabled="isSubmitting"
      >
        {{ t('common.back') }}
      </button>
      <div class="onboarding-nav-spacer"></div>
      <button
        v-if="!isLastStep && !currentStep.required"
        type="button"
        class="btn btn-ghost"
        @click="handleSkip"
        :disabled="isSubmitting"
      >
        {{ t('common.skip') }}
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="handleNext"
        :disabled="isSubmitting || (currentStep.required && !isStepValid)"
      >
        {{ isSubmitting ? t('common.saving') : isLastStep ? t('admin.onboarding.finish') : t('common.next') }}
      </button>
    </div>
  </div>
</template>
