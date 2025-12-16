<script setup lang="ts">
/**
 * Admin Portfolio Page
 *
 * CRUD interface for portfolio items with image upload.
 * Uses existing CSS: .card, .btn, .input, .badge
 */
import IconPlus from '~icons/tabler/plus'
import IconEdit from '~icons/tabler/pencil'
import IconTrash from '~icons/tabler/trash'
import IconEye from '~icons/tabler/eye'
import IconEyeOff from '~icons/tabler/eye-off'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

interface PortfolioItem {
  id: number
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  thumbnailUrl: string | null
  category: string | null
  tags: string[]
  published: boolean
  order: number
}

// Fetch portfolio items (including unpublished for admin)
const headers = useRequestHeaders(['cookie'])
const { data: items, pending, refresh } = await useFetch<PortfolioItem[]>('/api/portfolio', {
  query: { all: 'true' },
  headers
})

// Modal state
const showModal = ref(false)
const editingItem = ref<PortfolioItem | null>(null)
const form = reactive({
  slug: '',
  title: '',
  description: '',
  category: '',
  tags: '',
  published: false,
  order: 0
})

// Image upload state
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const uploading = ref(false)

function resetForm() {
  form.slug = ''
  form.title = ''
  form.description = ''
  form.category = ''
  form.tags = ''
  form.published = false
  form.order = 0
  imageFile.value = null
  imagePreview.value = ''
}

function openCreate() {
  editingItem.value = null
  resetForm()
  showModal.value = true
}

function openEdit(item: PortfolioItem) {
  editingItem.value = item
  form.slug = item.slug
  form.title = item.title
  form.description = item.description || ''
  form.category = item.category || ''
  form.tags = item.tags?.join(', ') || ''
  form.published = item.published
  form.order = item.order
  imagePreview.value = item.thumbnailUrl || ''
  showModal.value = true
}

function handleImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    imageFile.value = input.files[0]
    imagePreview.value = URL.createObjectURL(input.files[0])
  }
}

const saving = ref(false)
const error = ref('')

async function saveItem() {
  saving.value = true
  error.value = ''

  try {
    let imageUrl = editingItem.value?.imageUrl || null
    let thumbnailUrl = editingItem.value?.thumbnailUrl || null

    // Upload image if new one selected
    if (imageFile.value) {
      uploading.value = true
      const formData = new FormData()
      formData.append('image', imageFile.value)
      const uploadResult = await $fetch<{ url: string; thumbnailUrl: string }>('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      imageUrl = uploadResult.url
      thumbnailUrl = uploadResult.thumbnailUrl
      uploading.value = false
    }

    const payload = {
      slug: form.slug,
      title: form.title,
      description: form.description || null,
      category: form.category || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      published: form.published,
      order: form.order,
      imageUrl,
      thumbnailUrl
    }

    if (editingItem.value) {
      await $fetch(`/api/portfolio/${editingItem.value.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/portfolio', { method: 'POST', body: payload })
    }

    showModal.value = false
    await refresh()
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save'
  } finally {
    saving.value = false
    uploading.value = false
  }
}

const deleting = ref<number | null>(null)

async function deleteItem(item: PortfolioItem) {
  if (!confirm(t('admin.confirmDelete'))) return
  deleting.value = item.id
  try {
    await $fetch(`/api/portfolio/${item.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete')
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="admin-portfolio">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.portfolio') }}</h1>
      <button class="btn btn-primary" @click="openCreate">
        <IconPlus /> {{ t('admin.addItem') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

    <!-- Empty state -->
    <div v-else-if="!items?.length" class="empty-state">
      <p>{{ t('admin.noItems') }}</p>
    </div>

    <!-- Portfolio grid -->
    <div v-else class="portfolio-grid">
      <div v-for="item in items" :key="item.id" class="portfolio-item card">
        <div class="portfolio-item-image">
          <img v-if="item.thumbnailUrl" :src="item.thumbnailUrl" :alt="item.title" />
          <div v-else class="portfolio-item-placeholder"></div>
          <span v-if="!item.published" class="badge badge-warning status-badge">Draft</span>
        </div>
        <div class="portfolio-item-info">
          <h3 class="portfolio-item-title">{{ item.title }}</h3>
          <p v-if="item.category" class="portfolio-item-category">{{ item.category }}</p>
        </div>
        <div class="portfolio-item-actions">
          <button class="btn btn-icon btn-ghost" @click="openEdit(item)" :title="t('admin.editItem')">
            <IconEdit />
          </button>
          <button
            class="btn btn-icon btn-ghost btn-danger"
            @click="deleteItem(item)"
            :disabled="deleting === item.id"
            :title="t('admin.deleteItem')"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingItem ? t('common.edit') : t('common.create') }} {{ t('admin.portfolio') }}</h2>
          </div>
          <form @submit.prevent="saveItem" class="modal-body">
            <div v-if="error" class="form-error">{{ error }}</div>

            <!-- Image upload -->
            <div class="form-group">
              <label class="form-label">Image</label>
              <div class="image-upload">
                <img v-if="imagePreview" :src="imagePreview" class="image-preview" />
                <input type="file" accept="image/*" @change="handleImageSelect" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Title</label>
                <input v-model="form.title" type="text" class="input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Slug</label>
                <input v-model="form.slug" type="text" class="input" required pattern="[a-z0-9-]+" />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <input v-model="form.category" type="text" class="input" />
              </div>
              <div class="form-group">
                <label class="form-label">Order</label>
                <input v-model.number="form.order" type="number" class="input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="input" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Tags (comma-separated)</label>
              <input v-model="form.tags" type="text" class="input" />
            </div>

            <div class="form-group">
              <label class="checkbox">
                <input v-model="form.published" type="checkbox" />
                <span>Published</span>
              </label>
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
/* Page-specific styles - .page-header, .page-title, .loading-state, .empty-state, .form-grid are global */

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.portfolio-item {
  display: flex;
  flex-direction: column;
}

.portfolio-item-image {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
  background: var(--l-bg-sunken);
}

.portfolio-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portfolio-item-placeholder {
  width: 100%;
  height: 100%;
  background: var(--l-bg-sunken);
}

.status-badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
}

.portfolio-item-info {
  padding: var(--space-3);
  flex: 1;
}

.portfolio-item-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
}

.portfolio-item-category {
  font-size: var(--text-sm);
  color: var(--t-muted);
  margin: var(--space-1) 0 0;
}

.portfolio-item-actions {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--l-border);
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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
  margin-top: var(--space-2);
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.image-preview {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

</style>

