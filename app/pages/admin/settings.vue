<script setup lang="ts">
/**
 * Admin Settings Page
 *
 * Config-driven form to edit site settings.
 * Settings schema is defined in puppet-master.config.ts
 */
import config from '~/puppet-master.config'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

// Fetch settings
const { data: settings, pending, refresh } = await useFetch<Record<string, Record<string, string | null>>>('/api/settings')

// Form state - dynamically built from config
const form = reactive<Record<string, string>>(
  Object.fromEntries(config.settings.map(s => [s.key, '']))
)

// Populate form when settings load
watchEffect(() => {
  if (settings.value) {
    for (const setting of config.settings) {
      const [group, key] = setting.key.split('.')
      form[setting.key] = settings.value[group]?.[key] || ''
    }
  }
})

// Group settings by their group
const settingsByGroup = computed(() => {
  const grouped: Record<string, typeof config.settings[number][]> = {}
  for (const setting of config.settings) {
    if (!grouped[setting.group]) grouped[setting.group] = []
    grouped[setting.group].push(setting)
  }
  return grouped
})

// Get input type for setting
function getInputType(type: string): string {
  switch (type) {
    case 'email': return 'email'
    case 'url': return 'url'
    case 'tel': return 'tel'
    case 'text': return 'textarea'
    default: return 'text'
  }
}

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

async function saveSettings() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: form
    })
    saveSuccess.value = true
    await refresh()
    setTimeout(() => saveSuccess.value = false, 3000)
  } catch (e: any) {
    saveError.value = e.data?.message || 'Failed to save settings'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="admin-settings">
    <h1 class="page-title">{{ t('admin.settings') }}</h1>

    <div v-if="pending" class="loading-state">Loading...</div>

    <form v-else @submit.prevent="saveSettings" class="settings-form">
      <!-- Dynamic settings groups from config -->
      <section v-for="group in config.settingGroups" :key="group.key" class="card">
        <div class="card-header">
          <h2 class="section-title">{{ group.label }}</h2>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div
              v-for="setting in settingsByGroup[group.key]"
              :key="setting.key"
              class="form-group"
              :class="{ 'form-group--full': setting.type === 'text' }"
            >
              <label class="form-label">{{ setting.label }}</label>
              <textarea
                v-if="setting.type === 'text'"
                v-model="form[setting.key]"
                class="input"
                rows="3"
              ></textarea>
              <input
                v-else
                v-model="form[setting.key]"
                :type="getInputType(setting.type)"
                class="input"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Save Button -->
      <div class="form-actions">
        <div v-if="saveSuccess" class="form-success">{{ t('admin.settingsSaved') }}</div>
        <div v-if="saveError" class="form-error">{{ saveError }}</div>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? t('common.saving') : t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<!--
  Uses global CSS classes from admin/index.css:
  - .admin-settings, .section-title, .settings-form, .form-actions
-->

