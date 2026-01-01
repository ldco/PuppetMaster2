<script setup lang="ts">
/**
 * Admin Translations Page
 *
 * Manage all text content across languages.
 * - Content translations: editable by admin+
 * - System translations: editable by master only (separate section)
 */
import IconPlus from '~icons/tabler/plus'
import IconTrash from '~icons/tabler/trash'
import IconSearch from '~icons/tabler/search'
import IconX from '~icons/tabler/x'
import IconSettings from '~icons/tabler/settings'
import IconFileText from '~icons/tabler/file-text'
import type { Translation, TranslationsData } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: () => `${t('admin.navTranslations')} | Admin`
})

const { confirm } = useConfirm()
const { toast } = useToast()

// Fetch translations - pass cookies for SSR auth
const headers = useRequestHeaders(['cookie'])
const {
  data,
  pending,
  refresh
} = await useFetch<TranslationsData>('/api/admin/translations', {
  headers
})

const locales = computed(() => data.value?.locales || ['en', 'ru', 'he'])
const contentTranslations = computed(() => data.value?.content || {})
const systemTranslations = computed(() => data.value?.system || {})
const canEditSystem = computed(() => data.value?.canEditSystem || false)

// Section toggle: 'content' or 'system'
const activeSection = ref<'content' | 'system'>('content')

// Current locale tab
const activeLocale = ref('en')

// Search/filter
const searchQuery = ref('')

// Get translations for current section and locale
const currentTranslations = computed(() => {
  const source = activeSection.value === 'system' ? systemTranslations.value : contentTranslations.value
  return source[activeLocale.value] || []
})

const filteredTranslations = computed(() => {
  const items = currentTranslations.value
  if (!searchQuery.value) return items
  const query = searchQuery.value.toLowerCase()
  return items.filter(
    t => t.key.toLowerCase().includes(query) || t.value.toLowerCase().includes(query)
  )
})

// Count for tabs
const contentCount = computed(() => {
  return Object.values(contentTranslations.value).flat().length
})
const systemCount = computed(() => {
  return Object.values(systemTranslations.value).flat().length
})

// Add/Edit modal
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  key: '',
  value: ''
})

function openAdd() {
  editingId.value = null
  form.key = ''
  form.value = ''
  showModal.value = true
}

function openEdit(item: Translation) {
  editingId.value = item.id
  form.key = item.key
  form.value = item.value
  showModal.value = true
}

const saving = ref(false)
const saveError = ref('')

async function saveTranslation() {
  saving.value = true
  saveError.value = ''
  try {
    await $fetch('/api/admin/translations', {
      method: 'POST',
      body: {
        locale: activeLocale.value,
        key: form.key,
        value: form.value
      }
    })
    showModal.value = false
    await refresh()
    toast.success(t('common.success'))
  } catch (e: any) {
    saveError.value = e.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

const deleting = ref<number | null>(null)

async function deleteTranslation(item: Translation) {
  const confirmed = await confirm(t('admin.confirmDelete'), {
    title: t('common.delete'),
    confirmText: t('common.delete'),
    variant: 'danger'
  })
  if (!confirmed) return

  deleting.value = item.id
  try {
    await $fetch(`/api/admin/translations/${item.id}`, { method: 'DELETE' })
    await refresh()
    toast.success(t('common.success'))
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to delete')
  } finally {
    deleting.value = null
  }
}

const localeNames: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  he: 'עברית'
}
</script>

<template>
  <div class="admin-translations">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('admin.translations') }}</h1>
        <p class="text-secondary">{{ t('admin.translationsSubtitle') }}</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <IconPlus />
        {{ t('admin.addTranslation') }}
      </button>
    </div>

    <!-- Section toggle (Content / System) - only show if user can edit system -->
    <div v-if="canEditSystem" class="section-toggle">
      <button
        class="section-toggle-btn"
        :class="{ 'is-active': activeSection === 'content' }"
        @click="activeSection = 'content'"
      >
        <IconFileText />
        {{ t('admin.translationsContent') }}
        <span class="section-toggle-count">{{ contentCount }}</span>
      </button>
      <button
        class="section-toggle-btn"
        :class="{ 'is-active': activeSection === 'system' }"
        @click="activeSection = 'system'"
      >
        <IconSettings />
        {{ t('admin.translationsSystem') }}
        <span class="section-toggle-count">{{ systemCount }}</span>
      </button>
    </div>

    <!-- System translations notice -->
    <div v-if="activeSection === 'system'" class="alert alert--warning">
      <strong>{{ t('admin.translationsSystemWarning') }}</strong> - {{ t('admin.translationsSystemWarningDesc') }}
    </div>

    <!-- Locale tabs -->
    <div class="tabs tabs--underline">
      <button
        v-for="loc in locales"
        :key="loc"
        class="tab"
        :class="{ 'is-active': activeLocale === loc }"
        @click="activeLocale = loc"
      >
        {{ localeNames[loc] || loc.toUpperCase() }}
        <span class="tab-badge">
          {{ (activeSection === 'system' ? systemTranslations : contentTranslations)[loc]?.length || 0 }}
        </span>
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <IconSearch class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        class="input"
        placeholder="Search by key or value..."
      />
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

    <!-- Empty state -->
    <div v-else-if="!filteredTranslations.length" class="empty-state">
      <p>{{ searchQuery ? 'No matches found' : t('admin.noTranslations') }}</p>
    </div>

    <!-- Translations table -->
    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('admin.translationKey') }}</th>
            <th>{{ t('admin.translationValue') }}</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredTranslations" :key="item.id">
            <td class="cell--key" :data-label="t('admin.translationKey')">
              <code>{{ item.key }}</code>
            </td>
            <td
              class="cell--value cell--editable"
              :data-label="t('admin.translationValue')"
              dir="auto"
              @click="openEdit(item)"
            >
              {{ item.value }}
            </td>
            <td class="actions-col">
              <button
                class="btn btn-icon btn-ghost btn-danger"
                @click="deleteTranslation(item)"
                :disabled="deleting === item.id"
              >
                <IconTrash />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>
              {{ editingId ? t('common.edit') : t('admin.addTranslation') }}
              <span v-if="!editingId && canEditSystem" class="modal-section-badge" :class="activeSection">
                {{ activeSection === 'system' ? t('admin.translationsSystem') : t('admin.translationsContent') }}
              </span>
            </h2>
            <button type="button" class="btn btn-icon btn-ghost" @click="showModal = false">
              <IconX />
            </button>
          </div>
          <form @submit.prevent="saveTranslation" class="modal-body">
            <div v-if="saveError" class="form-error">{{ saveError }}</div>

            <!-- Section info for new translations -->
            <div v-if="!editingId && activeSection === 'system'" class="form-info form-info--system">
              <strong>{{ t('admin.translationsAddingToSystem') }}</strong>
              {{ t('admin.translationsSystemPrefixHint') }} <code>common.</code>, <code>admin.</code>, <code>nav.</code>, <code>auth.</code>
            </div>
            <div v-else-if="!editingId && canEditSystem" class="form-info">
              {{ t('admin.translationsAddingToContent') }} <code>hero.</code>, <code>about.</code>, <code>cta.</code>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.translationKey') }}</label>
              <input
                v-model="form.key"
                type="text"
                class="input"
                required
                :placeholder="activeSection === 'system' ? 'e.g., common.newKey or admin.label' : 'e.g., hero.title or about.description'"
                :disabled="!!editingId"
              />
              <small class="form-hint">Use dot notation: section.key</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.translationValue') }}</label>
              <textarea v-model="form.value" class="input" rows="3" required dir="auto"></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showModal = false">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? t('common.saving') : t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
/* Section toggle - Content/System switcher */
.section-toggle {
  display: flex;
  gap: var(--space-2);
  margin-block-end: var(--space-4);
}

.section-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.section-toggle-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.section-toggle-btn.is-active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.section-toggle-count {
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.1);
  font-size: var(--text-xs);
}

.section-toggle-btn.is-active .section-toggle-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Alert for system translations */
.alert--warning {
  padding: var(--space-3) var(--space-4);
  margin-block-end: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-warning-bg, #fef3cd);
  border: 1px solid var(--color-warning-border, #ffc107);
  color: var(--color-warning-text, #856404);
  font-size: var(--text-sm);
}

/* Modal section badge */
.modal-section-badge {
  display: inline-block;
  margin-inline-start: var(--space-2);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  vertical-align: middle;
}

.modal-section-badge.content {
  background: var(--color-primary-light, #e3f2fd);
  color: var(--color-primary, #1976d2);
}

.modal-section-badge.system {
  background: var(--color-warning-bg, #fff3cd);
  color: var(--color-warning-text, #856404);
}

/* Form info boxes */
.form-info {
  padding: var(--space-2) var(--space-3);
  margin-block-end: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.form-info code {
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.05));
  font-size: var(--text-xs);
}

.form-info--system {
  background: var(--color-warning-bg, #fff3cd);
  border-color: var(--color-warning-border, #ffc107);
  color: var(--color-warning-text, #856404);
}
</style>

<!--
  Uses global CSS classes:
  - ui/content/tabs.css: .tabs, .tabs--underline, .tab, .tab-badge
  - ui/forms/search.css: .search-bar, .search-icon
  - ui/content/data-table.css: .data-table
  - ui/overlays/modal.css: .modal-backdrop, .modal, .modal-header, .modal-body, .modal-footer
-->
