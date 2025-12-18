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
import IconX from '~icons/tabler/x'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()
const { confirm } = useConfirm()
const { toast } = useToast()

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
    console.error('Portfolio save error:', e)
    error.value = e.data?.statusMessage || e.data?.message || e.message || 'Failed to save'
  } finally {
    saving.value = false
    uploading.value = false
  }
}

const deleting = ref<number | null>(null)

async function deleteItem(item: PortfolioItem) {
  const confirmed = await confirm(t('admin.confirmDelete'), {
    title: t('common.delete'),
    confirmText: t('common.delete'),
    variant: 'danger'
  })
  if (!confirmed) return

  deleting.value = item.id
  try {
    await $fetch(`/api/portfolio/${item.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to delete')
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
            <button type="button" class="btn btn-icon btn-ghost" @click="showModal = false">
              <IconX />
            </button>
          </div>
          <form @submit.prevent="saveItem" class="modal-body">
            <div v-if="error" class="form-error">{{ error }}</div>

            <!-- Image upload -->
            <div class="form-group">
              <label class="form-label">{{ t('admin.image') }}</label>
              <div class="image-upload">
                <img v-if="imagePreview" :src="imagePreview" class="image-preview" />
                <input type="file" accept="image/*" @change="handleImageSelect" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ t('admin.itemTitle') }} *</label>
                <input v-model="form.title" type="text" class="input" required />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('admin.slug') }} *</label>
                <input v-model="form.slug" type="text" class="input" required pattern="[a-z0-9-]+" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('admin.category') }}</label>
                <input v-model="form.category" type="text" class="input" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('admin.order') }}</label>
                <input v-model.number="form.order" type="number" class="input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.description') }}</label>
              <textarea v-model="form.description" class="input" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.tags') }}</label>
              <input v-model="form.tags" type="text" class="input" :placeholder="t('admin.tagsHint')" />
            </div>

            <div class="form-group">
              <label class="checkbox">
                <input v-model="form.published" type="checkbox" />
                <span>{{ t('admin.published') }}</span>
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

<!--
  Uses global CSS classes:
  - admin/index.css: .portfolio-grid, .portfolio-item, .portfolio-item-*, .image-upload, .image-preview
  - ui/overlays/index.css: .modal-backdrop, .modal, .modal-header, .modal-body, .modal-footer
-->

