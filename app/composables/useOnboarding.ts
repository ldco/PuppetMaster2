/**
 * Onboarding Wizard State (LOW-05)
 *
 * Manages the onboarding wizard flow for first-time users.
 * Tracks current step, validates completion, and handles navigation.
 */

export interface OnboardingStep {
  id: string
  title: string
  description: string
  required: boolean
  fields: string[]
}

// Define onboarding steps with their required fields
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'admin.onboarding.welcomeTitle',
    description: 'admin.onboarding.welcomeDesc',
    required: false,
    fields: []
  },
  {
    id: 'contact',
    title: 'admin.onboarding.contactTitle',
    description: 'admin.onboarding.contactDesc',
    required: true,
    fields: ['contact.email', 'contact.phone']
  },
  {
    id: 'social',
    title: 'admin.onboarding.socialTitle',
    description: 'admin.onboarding.socialDesc',
    required: false,
    fields: ['social.telegram', 'social.instagram', 'social.facebook']
  },
  {
    id: 'seo',
    title: 'admin.onboarding.seoTitle',
    description: 'admin.onboarding.seoDesc',
    required: true,
    fields: ['seo.title', 'seo.description']
  },
  {
    id: 'complete',
    title: 'admin.onboarding.completeTitle',
    description: 'admin.onboarding.completeDesc',
    required: false,
    fields: []
  }
]

export function useOnboarding() {
  const currentStepIndex = useState<number>('onboarding-step', () => 0)
  const formData = useState<Record<string, string>>('onboarding-data', () => ({}))
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  const currentStep = computed(() => ONBOARDING_STEPS[currentStepIndex.value])
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value === ONBOARDING_STEPS.length - 1)
  const progress = computed(() => ((currentStepIndex.value + 1) / ONBOARDING_STEPS.length) * 100)

  // Check if current step is valid (required fields filled)
  const isStepValid = computed(() => {
    const step = currentStep.value
    if (!step.required || step.fields.length === 0) return true

    return step.fields.some(field => {
      const value = formData.value[field]
      return value && value.trim().length > 0
    })
  })

  function nextStep() {
    if (currentStepIndex.value < ONBOARDING_STEPS.length - 1) {
      currentStepIndex.value++
    }
  }

  function prevStep() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  function goToStep(index: number) {
    if (index >= 0 && index < ONBOARDING_STEPS.length) {
      currentStepIndex.value = index
    }
  }

  function updateField(key: string, value: string) {
    formData.value[key] = value
  }

  async function saveSettings() {
    isSubmitting.value = true
    error.value = null

    try {
      // Filter out empty values
      const settingsToSave = Object.fromEntries(
        Object.entries(formData.value).filter(([_, v]) => v && v.trim())
      )

      if (Object.keys(settingsToSave).length > 0) {
        await $fetch('/api/admin/settings', {
          method: 'PUT',
          body: settingsToSave
        })
      }

      return true
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to save settings'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function completeOnboarding() {
    // Save any remaining settings
    const success = await saveSettings()

    if (success) {
      // Mark onboarding as complete
      await $fetch('/api/admin/settings', {
        method: 'PUT',
        body: { 'system.onboardingComplete': 'true' }
      })
    }

    return success
  }

  function reset() {
    currentStepIndex.value = 0
    formData.value = {}
    error.value = null
  }

  return {
    // State
    currentStepIndex,
    currentStep,
    formData,
    isSubmitting,
    error,

    // Computed
    isFirstStep,
    isLastStep,
    isStepValid,
    progress,
    steps: ONBOARDING_STEPS,

    // Actions
    nextStep,
    prevStep,
    goToStep,
    updateField,
    saveSettings,
    completeOnboarding,
    reset
  }
}
