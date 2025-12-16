<script setup lang="ts">
/**
 * Contact Section
 *
 * Contact form with config-driven contact info sidebar.
 * Uses <ContactInfo /> component for email, phone, location.
 * Location supports: empty (hidden), address text, coordinates (Yandex map).
 */

const { t } = useI18n()

defineProps<{
  /** Section title */
  title?: string
  /** Show contact info sidebar (from settings) */
  showInfo?: boolean
  /** Show map widget if location has coordinates */
  showMap?: boolean
}>()

// Form state
const form = reactive({
  name: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

async function handleSubmit() {
  isSubmitting.value = true
  submitStatus.value = 'idle'

  try {
    await $fetch('/api/contact/submit', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        message: form.message
      }
    })
    submitStatus.value = 'success'
    form.name = ''
    form.email = ''
    form.message = ''
  } catch {
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!--
    Uses global classes from:
    - layout/sections.css (.section)
    - typography/base.css (.section-title, .section-title--center)
    - ui/forms/inputs.css (.contact-grid, .contact-form, .contact-info, .form-*, .input)
  -->
  <section id="contact" class="section">
    <div class="container">
      <h2 class="section-title section-title--center">
        <slot name="title">{{ title ?? 'Get in Touch' }}</slot>
      </h2>

      <div class="contact-grid">
        <form class="contact-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="contact-name">{{ t('contact.nameLabel') }}</label>
            <input
              id="contact-name"
              v-model="form.name"
              type="text"
              class="input"
              :placeholder="t('contact.namePlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="contact-email">{{ t('contact.emailLabel') }}</label>
            <input
              id="contact-email"
              v-model="form.email"
              type="email"
              class="input"
              :placeholder="t('contact.emailPlaceholder')"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="contact-message">{{ t('contact.messageLabel') }}</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              class="input"
              rows="5"
              :placeholder="t('contact.messagePlaceholder')"
              required
            ></textarea>
          </div>

          <AtomsCtaButton
            type="submit"
            variant="primary"
            size="lg"
            full-width
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? t('contact.sending') : t('contact.sendButton') }}
          </AtomsCtaButton>

          <p v-if="submitStatus === 'success'" class="form-success">
            ✓ {{ t('contact.successMessage') }}
          </p>
          <p v-if="submitStatus === 'error'" class="form-error">
            ✕ {{ t('contact.errorMessage') }}
          </p>
        </form>

        <!-- Contact Info sidebar - config-driven via settings -->
        <aside v-if="showInfo" class="contact-sidebar">
          <MoleculesContactInfo :show-map="showMap" />
          <MoleculesSocialNav vertical class="contact-social" />
        </aside>
      </div>
    </div>
  </section>
</template>

<!-- No scoped styles needed - all styles come from global CSS -->

