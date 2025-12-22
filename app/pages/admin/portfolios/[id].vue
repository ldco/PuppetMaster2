<script setup lang="ts">
/**
 * Admin Portfolio Detail Page
 *
 * Manages items within a portfolio.
 * Different UI for gallery (media grid) vs case_study (project cards).
 */
import IconPlus from '~icons/tabler/plus'
import IconEdit from '~icons/tabler/pencil'
import IconTrash from '~icons/tabler/trash'
import IconX from '~icons/tabler/x'
import IconArrowLeft from '~icons/tabler/arrow-left'
import IconPhoto from '~icons/tabler/photo'
import IconVideo from '~icons/tabler/video'
import IconLink from '~icons/tabler/link'
import IconUpload from '~icons/tabler/upload'

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
const route = useRoute()

interface Portfolio {
  id: number
  slug: string
  name: string
  description: string | null
  type: 'gallery' | 'case_study'
  coverImageUrl: string | null
  coverThumbnailUrl: string | null
  published: boolean
  items: PortfolioItem[]
}

interface PortfolioItem {
  id: number
  portfolioId: number
  itemType: 'image' | 'video' | 'link' | 'case_study'
  order: number
  published: boolean
  mediaUrl: string | null
  thumbnailUrl: string | null
  caption: string | null
  slug: string | null
  title: string | null
  description: string | null
  content: string | null
  tags: string[]
  category: string | null
}

// Use computed for reactive route params
const portfolioId = computed(() => route.params.id as string)

// Fetch portfolio with items - use computed URL for reactivity on route change
const headers = useRequestHeaders(['cookie'])
const {
  data: portfolio,
  pending,
  refresh
} = await useFetch<Portfolio>(() => `/api/portfolios/${portfolioId.value}`, {
  query: { includeItems: 'true' },
  headers,
  watch: [portfolioId]
})

// Modal state
const showItemModal = ref(false)
const editingItem = ref<PortfolioItem | null>(null)

// Form for gallery items
const galleryForm = reactive({
  itemType: 'image' as 'image' | 'video' | 'link',
  mediaUrl: '',
  caption: '',
  published: true,
  order: 0
})

// Form for case study items
const caseStudyForm = reactive({
  slug: '',
  title: '',
  description: '',
  content: '',
  category: '',
  tags: '',
  published: true,
  order: 0
})

// Image/video upload state
const mediaFile = ref<File | null>(null)
const mediaPreview = ref('')
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function resetForms() {
  galleryForm.itemType = 'image'
  galleryForm.mediaUrl = ''
  galleryForm.caption = ''
  galleryForm.published = true
  galleryForm.order = 0

  caseStudyForm.slug = ''
  caseStudyForm.title = ''
  caseStudyForm.description = ''
  caseStudyForm.content = ''
  caseStudyForm.category = ''
  caseStudyForm.tags = ''
  caseStudyForm.published = true
  caseStudyForm.order = 0

  mediaFile.value = null
  mediaPreview.value = ''
  // Clear file input so the same file can be selected again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function openAddItem() {
  editingItem.value = null
  resetForms()
  showItemModal.value = true
}

function openEditItem(item: PortfolioItem) {
  editingItem.value = item
  resetForms()

  if (item.itemType === 'case_study') {
    caseStudyForm.slug = item.slug || ''
    caseStudyForm.title = item.title || ''
    caseStudyForm.description = item.description || ''
    caseStudyForm.content = item.content || ''
    caseStudyForm.category = item.category || ''
    caseStudyForm.tags = item.tags?.join(', ') || ''
    caseStudyForm.published = item.published
    caseStudyForm.order = item.order
    mediaPreview.value = item.thumbnailUrl || ''
  } else {
    galleryForm.itemType = item.itemType as 'image' | 'video' | 'link'
    galleryForm.mediaUrl = item.mediaUrl || ''
    galleryForm.caption = item.caption || ''
    galleryForm.published = item.published
    galleryForm.order = item.order
    mediaPreview.value = item.thumbnailUrl || item.mediaUrl || ''
  }

  showItemModal.value = true
}

function handleMediaSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    mediaFile.value = input.files[0]
    mediaPreview.value = URL.createObjectURL(input.files[0])
    // Auto-detect type
    if (input.files[0].type.startsWith('video/')) {
      galleryForm.itemType = 'video'
    } else {
      galleryForm.itemType = 'image'
    }
  }
}

// Auto-generate slug from title
function generateSlug() {
  if (!editingItem.value && caseStudyForm.title && !caseStudyForm.slug) {
    caseStudyForm.slug = caseStudyForm.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

const saving = ref(false)
const error = ref('')

async function saveItem() {
  saving.value = true
  error.value = ''

  try {
    const isGallery = portfolio.value?.type === 'gallery'
    let payload: Record<string, unknown>

    if (isGallery) {
      // Validate: for image/video, need either a file or existing URL
      // For link, need a URL
      if (galleryForm.itemType === 'link') {
        if (!galleryForm.mediaUrl) {
          error.value = t('validation.required')
          saving.value = false
          return
        }
      } else {
        // image or video: need file for new items, or existing URL for edits
        if (!mediaFile.value && !galleryForm.mediaUrl && !editingItem.value?.mediaUrl) {
          error.value = t('validation.required')
          saving.value = false
          return
        }
      }

      let mediaUrl = galleryForm.mediaUrl || editingItem.value?.mediaUrl || ''
      let thumbnailUrl: string | null = editingItem.value?.thumbnailUrl || null

      // Upload media if file selected
      if (mediaFile.value) {
        uploading.value = true
        const formData = new FormData()
        const isVideo = mediaFile.value.type.startsWith('video/')
        formData.append(isVideo ? 'video' : 'image', mediaFile.value)

        const uploadResult = await $fetch<{ url: string; thumbnailUrl?: string }>(
          `/api/upload/${isVideo ? 'video' : 'image'}`,
          {
            method: 'POST',
            body: formData
          }
        )
        mediaUrl = uploadResult.url
        thumbnailUrl = uploadResult.thumbnailUrl || null
        uploading.value = false
      }

      payload = {
        itemType: galleryForm.itemType,
        mediaUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        caption: galleryForm.caption || undefined,
        published: galleryForm.published,
        order: galleryForm.order
      }
    } else {
      // Case study
      let mediaUrl = editingItem.value?.mediaUrl || null
      let thumbnailUrl = editingItem.value?.thumbnailUrl || null

      // Upload cover image if file selected
      if (mediaFile.value) {
        uploading.value = true
        const formData = new FormData()
        formData.append('image', mediaFile.value)

        const uploadResult = await $fetch<{ url: string; thumbnailUrl: string }>(
          '/api/upload/image',
          {
            method: 'POST',
            body: formData
          }
        )
        mediaUrl = uploadResult.url
        thumbnailUrl = uploadResult.thumbnailUrl
        uploading.value = false
      }

      payload = {
        itemType: 'case_study',
        slug: caseStudyForm.slug,
        title: caseStudyForm.title,
        description: caseStudyForm.description || undefined,
        content: caseStudyForm.content || undefined,
        category: caseStudyForm.category || undefined,
        tags: caseStudyForm.tags
          ? caseStudyForm.tags
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
          : [],
        mediaUrl: mediaUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        published: caseStudyForm.published,
        order: caseStudyForm.order
      }
    }

    if (editingItem.value) {
      await $fetch(`/api/portfolios/${portfolioId.value}/items/${editingItem.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch(`/api/portfolios/${portfolioId.value}/items`, {
        method: 'POST',
        body: payload
      })
    }

    showItemModal.value = false
    await refresh()
  } catch (e: any) {
    console.error('Item save error:', e)
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
    await $fetch(`/api/portfolios/${portfolioId.value}/items/${item.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to delete')
  } finally {
    deleting.value = null
  }
}

function getItemTypeIcon(type: string) {
  switch (type) {
    case 'video':
      return IconVideo
    case 'link':
      return IconLink
    default:
      return IconPhoto
  }
}
</script>

<template>
  <div class="admin-portfolio-detail">
    <!-- Back button and header -->
    <div class="page-header">
      <div class="page-header-left">
        <NuxtLink to="/admin/portfolios" class="btn btn-ghost btn-icon">
          <IconArrowLeft />
        </NuxtLink>
        <div v-if="portfolio">
          <h1 class="page-title">{{ portfolio.name }}</h1>
          <p v-if="portfolio.description" class="page-subtitle">{{ portfolio.description }}</p>
        </div>
      </div>
      <button v-if="portfolio" class="btn btn-primary" @click="openAddItem">
        <IconPlus />
        {{ portfolio.type === 'gallery' ? t('admin.addMedia') : t('admin.addCaseStudy') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

    <!-- Portfolio not found -->
    <div v-else-if="!portfolio" class="empty-state">
      <p>{{ t('admin.portfolioNotFound') }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!portfolio.items?.length" class="empty-state">
      <p>{{ t('admin.noItems') }}</p>
      <button class="btn btn-primary" @click="openAddItem">
        <IconPlus />
        {{ portfolio.type === 'gallery' ? t('admin.addMedia') : t('admin.addCaseStudy') }}
      </button>
    </div>

    <!-- Gallery type: Media grid -->
    <div v-else-if="portfolio.type === 'gallery'" class="media-grid">
      <div v-for="item in portfolio.items" :key="item.id" class="media-item card">
        <div class="media-item-preview">
          <img
            v-if="item.thumbnailUrl || item.mediaUrl"
            :src="item.thumbnailUrl || item.mediaUrl || ''"
            :alt="item.caption || ''"
          />
          <div v-else class="media-item-placeholder">
            <component :is="getItemTypeIcon(item.itemType)" />
          </div>
          <span v-if="!item.published" class="badge badge-warning status-badge">Draft</span>
          <span class="badge badge-secondary type-badge">{{ item.itemType }}</span>
        </div>
        <div v-if="item.caption" class="media-item-caption">{{ item.caption }}</div>
        <div class="media-item-actions">
          <button
            class="btn btn-icon btn-ghost"
            @click="openEditItem(item)"
            :title="t('common.edit')"
          >
            <IconEdit />
          </button>
          <button
            class="btn btn-icon btn-ghost btn-danger"
            @click="deleteItem(item)"
            :disabled="deleting === item.id"
            :title="t('common.delete')"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>

    <!-- Case study type: Project cards -->
    <div v-else class="portfolio-grid">
      <div v-for="item in portfolio.items" :key="item.id" class="portfolio-item card">
        <div class="portfolio-item-image">
          <img v-if="item.thumbnailUrl" :src="item.thumbnailUrl" :alt="item.title || ''" />
          <div v-else class="portfolio-item-placeholder"></div>
          <span v-if="!item.published" class="badge badge-warning status-badge">Draft</span>
        </div>
        <div class="portfolio-item-info">
          <h3 class="portfolio-item-title">{{ item.title }}</h3>
          <p v-if="item.category" class="portfolio-item-category">{{ item.category }}</p>
        </div>
        <div class="portfolio-item-actions">
          <button
            class="btn btn-icon btn-ghost"
            @click="openEditItem(item)"
            :title="t('common.edit')"
          >
            <IconEdit />
          </button>
          <button
            class="btn btn-icon btn-ghost btn-danger"
            @click="deleteItem(item)"
            :disabled="deleting === item.id"
            :title="t('common.delete')"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>

    <!-- Item Modal -->
    <Teleport to="body">
      <div v-if="showItemModal" class="modal-backdrop" @click.self="showItemModal = false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h2>
              {{ editingItem ? t('common.edit') : t('common.create') }}
              {{ portfolio?.type === 'gallery' ? t('admin.mediaItem') : t('admin.caseStudy') }}
            </h2>
            <button type="button" class="btn btn-icon btn-ghost" @click="showItemModal = false">
              <IconX />
            </button>
          </div>
          <form @submit.prevent="saveItem" class="modal-body">
            <div v-if="error" class="form-error">{{ error }}</div>

            <!-- Gallery item form -->
            <template v-if="portfolio?.type === 'gallery'">
              <!-- Type selector (for new items) -->
              <div v-if="!editingItem" class="form-group">
                <label class="form-label">{{ t('admin.mediaType') }}</label>
                <div class="type-selector">
                  <label class="type-option" :class="{ active: galleryForm.itemType === 'image' }">
                    <input
                      type="radio"
                      v-model="galleryForm.itemType"
                      value="image"
                      class="sr-only"
                    />
                    <IconPhoto />
                    <span>{{ t('admin.image') }}</span>
                  </label>
                  <label class="type-option" :class="{ active: galleryForm.itemType === 'video' }">
                    <input
                      type="radio"
                      v-model="galleryForm.itemType"
                      value="video"
                      class="sr-only"
                    />
                    <IconVideo />
                    <span>{{ t('admin.video') }}</span>
                  </label>
                  <label class="type-option" :class="{ active: galleryForm.itemType === 'link' }">
                    <input
                      type="radio"
                      v-model="galleryForm.itemType"
                      value="link"
                      class="sr-only"
                    />
                    <IconLink />
                    <span>{{ t('admin.externalLink') }}</span>
                  </label>
                </div>
              </div>

              <!-- Upload for image/video -->
              <div v-if="galleryForm.itemType !== 'link'" class="form-group">
                <label class="form-label">{{
                  galleryForm.itemType === 'video' ? t('admin.video') : t('admin.image')
                }}</label>
                <div class="upload-area" @click="triggerFileInput" role="button" tabindex="0" @keypress.enter="triggerFileInput">
                  <img v-if="mediaPreview" :src="mediaPreview" class="upload-preview" />
                  <div v-else class="upload-placeholder">
                    <IconUpload />
                    <span>{{ t('admin.clickToUpload') }}</span>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    :accept="galleryForm.itemType === 'video' ? 'video/*' : 'image/*'"
                    class="sr-only"
                    @change="handleMediaSelect"
                  />
                </div>
              </div>

              <!-- URL for link type -->
              <div v-if="galleryForm.itemType === 'link'" class="form-group">
                <label class="form-label">{{ t('admin.externalUrl') }} *</label>
                <input
                  v-model="galleryForm.mediaUrl"
                  type="url"
                  class="input"
                  required
                  placeholder="https://..."
                />
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('admin.caption') }}</label>
                <input v-model="galleryForm.caption" type="text" class="input" />
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">{{ t('admin.order') }}</label>
                  <input v-model.number="galleryForm.order" type="number" class="input" />
                </div>
                <div class="form-group">
                  <label class="checkbox">
                    <input v-model="galleryForm.published" type="checkbox" />
                    <span>{{ t('admin.published') }}</span>
                  </label>
                </div>
              </div>
            </template>

            <!-- Case study form -->
            <template v-else>
              <!-- Cover image -->
              <div class="form-group">
                <label class="form-label">{{ t('admin.coverImage') }}</label>
                <div class="image-upload">
                  <img v-if="mediaPreview" :src="mediaPreview" class="image-preview" />
                  <input type="file" accept="image/*" @change="handleMediaSelect" />
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">{{ t('admin.itemTitle') }} *</label>
                  <input
                    v-model="caseStudyForm.title"
                    type="text"
                    class="input"
                    required
                    @blur="generateSlug"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ t('admin.slug') }} *</label>
                  <input
                    v-model="caseStudyForm.slug"
                    type="text"
                    class="input"
                    required
                    pattern="[a-z0-9-]+"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ t('admin.category') }}</label>
                  <input v-model="caseStudyForm.category" type="text" class="input" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ t('admin.order') }}</label>
                  <input v-model.number="caseStudyForm.order" type="number" class="input" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('admin.description') }}</label>
                <textarea v-model="caseStudyForm.description" class="input" rows="2"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('admin.content') }}</label>
                <textarea v-model="caseStudyForm.content" class="input" rows="6"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">{{ t('admin.tags') }}</label>
                <input
                  v-model="caseStudyForm.tags"
                  type="text"
                  class="input"
                  :placeholder="t('admin.tagsHint')"
                />
              </div>

              <div class="form-group">
                <label class="checkbox">
                  <input v-model="caseStudyForm.published" type="checkbox" />
                  <span>{{ t('admin.published') }}</span>
                </label>
              </div>
            </template>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showItemModal = false">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving || uploading">
                {{ uploading ? t('common.uploading') : saving ? t('common.saving') : t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<!--
  Uses global CSS classes from admin/index.css and ui/ folders
  New classes needed: .media-grid, .media-item, .upload-area, .type-selector
-->
