<script setup lang="ts">
/**
 * Admin Translations Page
 *
 * Manage all text content across languages.
 * Uses existing CSS: .card, .btn, .input, .badge, .page-header, .page-title
 */
import IconPlus from '~icons/tabler/plus'
import IconTrash from '~icons/tabler/trash'
import IconSearch from '~icons/tabler/search'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

interface Translation {
  id: number
  key: string
  value: string
}

interface TranslationsData {
  locales: string[]
  translations: Record<string, Translation[]>
}

// Fetch translations - pass cookies for SSR auth
const headers = useRequestHeaders(['cookie'])
const { data, pending, error: fetchError, refresh } = await useFetch<TranslationsData>('/api/admin/translations', {
  headers
})

// Debug
console.log('[translations page] data:', data.value, 'error:', fetchError.value)

const locales = computed(() => data.value?.locales || ['en', 'ru', 'he'])
const translations = computed(() => data.value?.translations || {})

// Current locale tab
const activeLocale = ref('en')

// Search/filter
const searchQuery = ref('')

const filteredTranslations = computed(() => {
  const items = translations.value[activeLocale.value] || []
  if (!searchQuery.value) return items
  const query = searchQuery.value.toLowerCase()
  return items.filter(t => 
    t.key.toLowerCase().includes(query) || 
    t.value.toLowerCase().includes(query)
  )
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
  } catch (e: any) {
    saveError.value = e.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

const deleting = ref<number | null>(null)

async function deleteTranslation(item: Translation) {
  if (!confirm(t('admin.confirmDelete'))) return
  deleting.value = item.id
  try {
    await $fetch(`/api/admin/translations/${item.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete')
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
        <IconPlus /> {{ t('admin.addTranslation') }}
      </button>
    </div>

    <!-- Locale tabs -->
    <div class="locale-tabs">
      <button
        v-for="loc in locales"
        :key="loc"
        class="locale-tab"
        :class="{ 'is-active': activeLocale === loc }"
        @click="activeLocale = loc"
      >
        {{ localeNames[loc] || loc.toUpperCase() }}
        <span class="badge badge-secondary">{{ (translations[loc] || []).length }}</span>
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
    <div v-else class="translations-table card">
      <table>
        <thead>
          <tr>
            <th>{{ t('admin.translationKey') }}</th>
            <th>{{ t('admin.translationValue') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredTranslations" :key="item.id">
            <td class="key-cell">
              <code>{{ item.key }}</code>
            </td>
            <td class="value-cell" @click="openEdit(item)">
              {{ item.value }}
            </td>
            <td class="actions-cell">
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
            <h2>{{ editingId ? t('common.edit') : t('admin.addTranslation') }}</h2>
          </div>
          <form @submit.prevent="saveTranslation" class="modal-body">
            <div v-if="saveError" class="form-error">{{ saveError }}</div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.translationKey') }}</label>
              <input
                v-model="form.key"
                type="text"
                class="input"
                required
                placeholder="e.g., nav.home"
                :disabled="!!editingId"
              />
              <small class="form-hint">Use dot notation: section.key</small>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.translationValue') }}</label>
              <textarea
                v-model="form.value"
                class="input"
                rows="3"
                required
              ></textarea>
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

<style scoped>
/* Page-specific styles - .page-header, .page-title, .loading-state, .empty-state are global */

.locale-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--l-border);
  padding-bottom: var(--space-2);
}

.locale-tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  color: var(--t-secondary);
  font-weight: var(--font-medium);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s, color 0.2s;
}

.locale-tab:hover {
  background: var(--l-bg-sunken);
}

.locale-tab.is-active {
  color: var(--i-brand);
  background: var(--i-brand-subtle);
}

.search-bar {
  position: relative;
  margin-bottom: var(--space-4);
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--t-muted);
  width: 18px;
  height: 18px;
}

.search-bar .input {
  padding-left: var(--space-10);
}

.translations-table {
  overflow: hidden;
}

.translations-table table {
  width: 100%;
  border-collapse: collapse;
}

.translations-table th,
.translations-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--l-border);
}

.translations-table th {
  font-weight: var(--font-medium);
  color: var(--t-secondary);
  font-size: var(--text-sm);
}

.key-cell {
  width: 35%;
}

.key-cell code {
  font-size: var(--text-sm);
  background: var(--l-bg-sunken);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
}

.value-cell {
  cursor: pointer;
}

.value-cell:hover {
  background: var(--l-bg-sunken);
}

.actions-cell {
  width: 60px;
  text-align: right;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: var(--z-modal);
}

.modal {
  background: var(--l-bg-elevated);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
}

.modal-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--l-border);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--text-lg);
}

.modal-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--l-border);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--t-muted);
  margin-top: var(--space-1);
}
</style>

