<script setup lang="ts">
/**
 * Admin Portfolios List Page
 *
 * Displays all portfolios with create/edit/delete functionality.
 * Uses existing CSS: .card, .btn, .input, .badge
 */
import IconPlus from '~icons/tabler/plus'
import IconEdit from '~icons/tabler/pencil'
import IconTrash from '~icons/tabler/trash'
import IconX from '~icons/tabler/x'
import IconPhoto from '~icons/tabler/photo'
import IconPresentation from '~icons/tabler/presentation'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: () => `${t('admin.navPortfolio')} | Admin`
})

const { confirm } = useConfirm()
const { toast } = useToast()

interface PortfolioItem {
  id: number
  thumbnailUrl: string | null
}

interface Portfolio {
  id: number
  slug: string
  name: string
  description: string | null
  type: 'gallery' | 'case_study'
  coverImageUrl: string | null
  coverThumbnailUrl: string | null
  published: boolean
  order: number
  items?: PortfolioItem[]
}

// Fetch portfolios with items for preview
const headers = useRequestHeaders(['cookie'])
const {
  data: portfolios,
  pending,
  refresh
} = await useFetch<Portfolio[]>('/api/portfolios', {
  query: { all: 'true', includeItems: 'true' },
  headers
})

// Modal state
const showModal = ref(false)
const editingPortfolio = ref<Portfolio | null>(null)
const form = reactive({
  slug: '',
  name: '',
  description: '',
  type: 'gallery' as 'gallery' | 'case_study',
  published: false,
  order: 0
})

// Image upload state
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const uploading = ref(false)

function resetForm() {
  form.slug = ''
  form.name = ''
  form.description = ''
  form.type = 'gallery'
  form.published = false
  form.order = 0
  imageFile.value = null
  imagePreview.value = ''
}

function openCreate() {
  editingPortfolio.value = null
  resetForm()
  showModal.value = true
}

function openEdit(portfolio: Portfolio) {
  editingPortfolio.value = portfolio
  form.slug = portfolio.slug
  form.name = portfolio.name
  form.description = portfolio.description || ''
  form.type = portfolio.type
  form.published = portfolio.published
  form.order = portfolio.order
  imagePreview.value = portfolio.coverThumbnailUrl || ''
  showModal.value = true
}

function handleImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    imageFile.value = input.files[0]
    imagePreview.value = URL.createObjectURL(input.files[0])
  }
}

// Auto-generate slug from name
function generateSlug() {
  if (!editingPortfolio.value && form.name && !form.slug) {
    form.slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

const saving = ref(false)
const error = ref('')

async function savePortfolio() {
  saving.value = true
  error.value = ''

  try {
    let coverImageUrl = editingPortfolio.value?.coverImageUrl || null
    let coverThumbnailUrl = editingPortfolio.value?.coverThumbnailUrl || null

    // Upload image if new one selected
    if (imageFile.value) {
      uploading.value = true
      const formData = new FormData()
      formData.append('image', imageFile.value)
      const uploadResult = await $fetch<{ url: string; thumbnailUrl: string }>(
        '/api/upload/image',
        {
          method: 'POST',
          body: formData
        }
      )
      coverImageUrl = uploadResult.url
      coverThumbnailUrl = uploadResult.thumbnailUrl
      uploading.value = false
    }

    const payload = {
      slug: form.slug,
      name: form.name,
      description: form.description || null,
      type: form.type,
      published: form.published,
      order: form.order,
      coverImageUrl,
      coverThumbnailUrl
    }

    if (editingPortfolio.value) {
      await $fetch(`/api/portfolios/${editingPortfolio.value.id}`, { method: 'PUT', body: payload })
    } else {
      await $fetch('/api/portfolios', { method: 'POST', body: payload })
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

async function deletePortfolio(portfolio: Portfolio) {
  const confirmed = await confirm(t('admin.confirmDelete'), {
    title: t('common.delete'),
    confirmText: t('common.delete'),
    variant: 'danger'
  })
  if (!confirmed) return

  deleting.value = portfolio.id
  try {
    await $fetch(`/api/portfolios/${portfolio.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to delete')
  } finally {
    deleting.value = null
  }
}

function getTypeLabel(type: string) {
  return type === 'gallery' ? t('admin.portfolioGallery') : t('admin.portfolioCaseStudy')
}
</script>

<template>
  <div class="admin-portfolios">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.portfolios') }}</h1>
      <button class="btn btn-primary" @click="openCreate">
        <IconPlus />
        {{ t('admin.addPortfolio') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

    <!-- Empty state -->
    <div v-else-if="!portfolios?.length" class="empty-state">
      <p>{{ t('admin.noPortfolios') }}</p>
    </div>

    <!-- Portfolio grid -->
    <div v-else class="portfolio-grid">
      <NuxtLink
        v-for="portfolio in portfolios"
        :key="portfolio.id"
        :to="`/admin/portfolios/${portfolio.id}`"
        class="portfolio-item card"
      >
        <div class="portfolio-item-image">
          <!-- Show cover image if set -->
          <img
            v-if="portfolio.coverThumbnailUrl"
            :src="portfolio.coverThumbnailUrl"
            :alt="portfolio.name"
          />
          <!-- Show item previews grid if no cover but has items -->
          <div
            v-else-if="portfolio.items?.length"
            class="portfolio-preview-grid"
          >
            <img
              v-for="item in portfolio.items.slice(0, 4)"
              :key="item.id"
              :src="item.thumbnailUrl || ''"
              :alt="portfolio.name"
              class="portfolio-preview-thumb"
            />
          </div>
          <!-- Empty placeholder -->
          <div v-else class="portfolio-item-placeholder">
            <IconPhoto v-if="portfolio.type === 'gallery'" />
            <IconPresentation v-else />
          </div>
          <span v-if="!portfolio.published" class="badge badge-warning status-badge">Draft</span>
          <span class="badge badge-secondary type-badge">{{ getTypeLabel(portfolio.type) }}</span>
        </div>
        <div class="portfolio-item-info">
          <h3 class="portfolio-item-title">{{ portfolio.name }}</h3>
          <p v-if="portfolio.description" class="portfolio-item-description">
            {{ portfolio.description }}
          </p>
        </div>
        <div class="portfolio-item-actions" @click.prevent>
          <button
            class="btn btn-icon btn-ghost"
            @click="openEdit(portfolio)"
            :title="t('admin.editPortfolio')"
          >
            <IconEdit />
          </button>
          <button
            class="btn btn-icon btn-ghost btn-danger"
            @click="deletePortfolio(portfolio)"
            :disabled="deleting === portfolio.id"
            :title="t('admin.deletePortfolio')"
          >
            <IconTrash />
          </button>
        </div>
      </NuxtLink>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>
              {{ editingPortfolio ? t('common.edit') : t('common.create') }}
              {{ t('admin.portfolio') }}
            </h2>
            <button type="button" class="btn btn-icon btn-ghost" @click="showModal = false">
              <IconX />
            </button>
          </div>
          <form @submit.prevent="savePortfolio" class="modal-body">
            <div v-if="error" class="form-error">{{ error }}</div>

            <!-- Cover image upload -->
            <div class="form-group">
              <label class="form-label">{{ t('admin.coverImage') }}</label>
              <div class="image-upload">
                <img v-if="imagePreview" :src="imagePreview" class="image-preview" />
                <input type="file" accept="image/*" @change="handleImageSelect" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ t('admin.portfolioName') }} *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input"
                  required
                  @blur="generateSlug"
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('admin.slug') }} *</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="input"
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('admin.portfolioType') }} *</label>
                <select v-model="form.type" class="input" :disabled="!!editingPortfolio">
                  <option value="gallery">{{ t('admin.portfolioGallery') }}</option>
                  <option value="case_study">{{ t('admin.portfolioCaseStudy') }}</option>
                </select>
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
  - admin/index.css: .portfolio-grid, .portfolio-item, .portfolio-item-*
  - ui/overlays/index.css: .modal-backdrop, .modal, .modal-header, .modal-body, .modal-footer
-->
