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
import IconX from '~icons/tabler/x'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()
const { confirm } = useConfirm()
const { toast } = useToast()

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
        <IconPlus /> {{ t('admin.addTranslation') }}
      </button>
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
        <span class="tab-badge">{{ (translations[loc] || []).length }}</span>
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
            <td class="cell--value cell--editable" :data-label="t('admin.translationValue')" dir="auto" @click="openEdit(item)">
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
            <h2>{{ editingId ? t('common.edit') : t('admin.addTranslation') }}</h2>
            <button type="button" class="btn btn-icon btn-ghost" @click="showModal = false">
              <IconX />
            </button>
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
                dir="auto"
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

<!--
  Uses global CSS classes:
  - ui/content/tabs.css: .tabs, .tabs--underline, .tab, .tab-badge
  - ui/forms/search.css: .search-bar, .search-icon
  - ui/content/data-table.css: .data-table
  - ui/overlays/modal.css: .modal-backdrop, .modal, .modal-header, .modal-body, .modal-footer
-->

