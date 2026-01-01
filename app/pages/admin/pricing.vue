<script setup lang="ts">
/**
 * Admin Pricing Page
 *
 * Manage pricing tiers and their features with multi-language support.
 * Uses existing CSS: .card, .btn, .input, .badge, .page-header, .pricing-card
 */
import IconPlus from '~icons/tabler/plus'
import IconEdit from '~icons/tabler/pencil'
import IconTrash from '~icons/tabler/trash'
import IconX from '~icons/tabler/x'
import IconGripVertical from '~icons/tabler/grip-vertical'
import IconCheck from '~icons/tabler/check'
import IconLanguage from '~icons/tabler/language'
import config from '~/puppet-master.config'

// Tier type from API (with translations)
interface PricingTier {
  id: number
  slug: string
  name: string
  description: string | null
  price: number | null
  currency: string | null
  period: 'month' | 'year' | 'one-time' | null
  featured: boolean | null
  ctaText: string | null
  ctaUrl: string | null
  order: number | null
  published: boolean | null
  translations: Record<string, { name: string | null; description: string | null; ctaText: string | null }>
  features: Array<{
    id: number
    text: string
    included: boolean | null
    order: number | null
    translations: Record<string, string | null>
  }>
}

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: () => `${t('admin.pricing')} | Admin`
})

const { confirm } = useConfirm()
const { toast } = useToast()

// Available locales from config
const locales = config.locales.map(l => l.code)
const defaultLocale = config.defaultLocale || 'en'

// Fetch tiers
const headers = useRequestHeaders(['cookie'])
const {
  data: tiers,
  pending,
  refresh
} = await useFetch<PricingTier[]>('/api/admin/pricing', {
  headers
})

// Modal state
const showModal = ref(false)
const showTranslateModal = ref(false)
const editingTier = ref<PricingTier | null>(null)
const saving = ref(false)
const selectedLocale = ref('')

const form = reactive({
  slug: '',
  name: '',
  description: '',
  price: null as number | null,
  currency: 'USD',
  period: 'month' as 'month' | 'year' | 'one-time',
  featured: false,
  ctaText: '',
  ctaUrl: '/contact',
  order: 0,
  published: true,
  features: [] as Array<{ id?: number; text: string; included: boolean }>
})

// Translation form
const translationForm = reactive({
  name: '',
  description: '',
  ctaText: '',
  features: [] as Array<{ featureId: number; text: string }>
})

function resetForm() {
  form.slug = ''
  form.name = ''
  form.description = ''
  form.price = null
  form.currency = 'USD'
  form.period = 'month'
  form.featured = false
  form.ctaText = ''
  form.ctaUrl = '/contact'
  form.order = 0
  form.published = true
  form.features = []
}

function openCreate() {
  editingTier.value = null
  resetForm()
  showModal.value = true
}

function openEdit(tier: PricingTier) {
  editingTier.value = tier
  form.slug = tier.slug
  form.name = tier.name
  form.description = tier.description || ''
  form.price = tier.price
  form.currency = tier.currency || 'USD'
  form.period = tier.period || 'month'
  form.featured = tier.featured || false
  form.ctaText = tier.ctaText || ''
  form.ctaUrl = tier.ctaUrl || '/contact'
  form.order = tier.order || 0
  form.published = tier.published ?? true
  form.features = (tier.features || []).map(f => ({
    id: f.id,
    text: f.text,
    included: f.included ?? true
  }))
  showModal.value = true
}

function openTranslate(tier: PricingTier, locale: string) {
  editingTier.value = tier
  selectedLocale.value = locale

  // Load existing translations for this locale
  const tierTrans = tier.translations?.[locale]
  translationForm.name = tierTrans?.name || ''
  translationForm.description = tierTrans?.description || ''
  translationForm.ctaText = tierTrans?.ctaText || ''
  translationForm.features = (tier.features || []).map(f => ({
    featureId: f.id,
    text: f.translations?.[locale] || ''
  }))

  showTranslateModal.value = true
}

// Auto-generate slug from name
function generateSlug() {
  if (!editingTier.value && form.name && !form.slug) {
    form.slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

// Feature management
function addFeature() {
  form.features.push({ text: '', included: true })
}

function removeFeature(index: number) {
  form.features.splice(index, 1)
}

async function saveTier() {
  saving.value = true

  try {
    const payload = {
      ...form,
      features: form.features
        .filter(f => f.text.trim())
        .map((f, i) => ({ ...f, order: i }))
    }

    if (editingTier.value) {
      await $fetch(`/api/admin/pricing/${editingTier.value.id}`, {
        method: 'PUT',
        body: payload
      })
      toast.success(t('common.saved'))
    } else {
      await $fetch('/api/admin/pricing', {
        method: 'POST',
        body: payload
      })
      toast.success(t('common.saved'))
    }

    showModal.value = false
    refresh()
  } catch (e: unknown) {
    const error = e as { data?: { message?: string } }
    toast.error(error.data?.message || t('common.error'))
  } finally {
    saving.value = false
  }
}

async function deleteTier(tier: PricingTier) {
  const confirmed = await confirm(t('admin.confirmDelete'), {
    title: t('common.delete'),
    confirmText: t('common.delete'),
    variant: 'danger'
  })

  if (!confirmed) return

  try {
    await $fetch(`/api/admin/pricing/${tier.id}`, { method: 'DELETE' })
    toast.success(t('common.deleted'))
    refresh()
  } catch (e: unknown) {
    const error = e as { data?: { message?: string } }
    toast.error(error.data?.message || t('common.error'))
  }
}

// Format price for display
function formatPrice(tier: PricingTier): string {
  if (tier.price === null) return t('pricing.custom')
  if (tier.price === 0) return t('pricing.free')
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', RUB: '₽', ILS: '₪' }
  const symbol = symbols[tier.currency || 'USD'] || tier.currency
  return `${symbol}${tier.price}`
}

// Get locale name
function getLocaleName(code: string): string {
  const locale = config.locales.find(l => l.code === code)
  return locale?.name || code.toUpperCase()
}

// Check if tier has translation for a locale
function hasTranslation(tier: PricingTier, locale: string): boolean {
  return !!(tier.translations?.[locale]?.name)
}

// Get non-default locales that need translation
const translationLocales = computed(() => locales.filter(l => l !== defaultLocale))

// Save translation
async function saveTranslation() {
  if (!editingTier.value) return
  saving.value = true

  try {
    await $fetch(`/api/admin/pricing/${editingTier.value.id}/translations`, {
      method: 'PUT',
      body: {
        locale: selectedLocale.value,
        tier: {
          name: translationForm.name || null,
          description: translationForm.description || null,
          ctaText: translationForm.ctaText || null
        },
        features: translationForm.features.map(f => ({
          featureId: f.featureId,
          text: f.text || null
        }))
      }
    })
    toast.success(t('common.saved'))
    showTranslateModal.value = false
    refresh()
  } catch (e: unknown) {
    const error = e as { data?: { message?: string } }
    toast.error(error.data?.message || t('common.error'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="admin-pricing">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.pricing') }}</h1>
      <button class="btn btn-primary" @click="openCreate">
        <IconPlus />
        {{ t('admin.addItem') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

    <!-- Empty state -->
    <div v-else-if="!tiers?.length" class="empty-state">
      <p>{{ t('admin.noItems') }}</p>
    </div>

    <!-- Tiers grid -->
    <div v-else class="pricing-tiers__grid">
      <div
        v-for="tier in tiers"
        :key="tier.id"
        class="pricing-card"
        :class="{ 'pricing-card--featured': tier.featured }"
      >
        <!-- Featured badge -->
        <span v-if="tier.featured" class="pricing-card__badge">
          {{ t('admin.featured') }}
        </span>

        <!-- Status badge (top right) -->
        <span
          class="badge pricing-card__status"
          :class="tier.published ? 'badge-success' : 'badge-warning'"
        >
          {{ tier.published ? t('admin.published') : t('common.draft') }}
        </span>

        <!-- Header -->
        <div class="pricing-card__header">
          <h3 class="pricing-card__name">{{ tier.name }}</h3>
          <p v-if="tier.description" class="pricing-card__description">
            {{ tier.description }}
          </p>
        </div>

        <!-- Price -->
        <div class="pricing-card__price">
          <span v-if="tier.price === null" class="pricing-card__price-custom">
            {{ t('pricing.custom') }}
          </span>
          <template v-else>
            <span class="pricing-card__price-value">{{ formatPrice(tier) }}</span>
            <span v-if="tier.period !== 'one-time'" class="pricing-card__price-period">
              {{ tier.period === 'year' ? t('pricing.perYear') : t('pricing.perMonth') }}
            </span>
          </template>
        </div>

        <!-- Features -->
        <ul class="pricing-card__features">
          <li
            v-for="feature in tier.features?.slice(0, 4)"
            :key="feature.id"
            class="pricing-card__feature"
            :class="{ 'pricing-card__feature--excluded': !feature.included }"
          >
            <span class="pricing-card__feature-icon">
              <IconCheck v-if="feature.included" />
              <IconX v-else />
            </span>
            <span class="pricing-card__feature-text">{{ feature.text }}</span>
          </li>
          <li v-if="(tier.features?.length || 0) > 4" class="pricing-card__feature">
            <span class="pricing-card__feature-icon" />
            <span class="pricing-card__feature-text text-secondary">
              +{{ (tier.features?.length || 0) - 4 }} {{ t('common.more') }}
            </span>
          </li>
        </ul>

        <!-- Translation status -->
        <div v-if="translationLocales.length > 0" class="pricing-card__translations">
          <button
            v-for="locale in translationLocales"
            :key="locale"
            class="btn btn-xs"
            :class="hasTranslation(tier, locale) ? 'btn-success' : 'btn-ghost'"
            :title="`${getLocaleName(locale)}: ${hasTranslation(tier, locale) ? t('admin.translated') : t('admin.notTranslated')}`"
            @click="openTranslate(tier, locale)"
          >
            {{ locale.toUpperCase() }}
          </button>
        </div>

        <!-- Actions -->
        <div class="pricing-card__actions">
          <button class="btn btn-sm btn-secondary" @click="openEdit(tier)">
            <IconEdit /> {{ t('common.edit') }}
          </button>
          <button class="btn btn-sm btn-ghost text-error" @click="deleteTier(tier)">
            <IconTrash />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="modal modal--lg">
          <header class="modal-header">
            <h2>{{ editingTier ? t('common.edit') : t('admin.addItem') }}</h2>
            <button class="btn btn-ghost btn-sm" @click="showModal = false">
              <IconX />
            </button>
          </header>

          <form class="modal-body" @submit.prevent="saveTier">
            <div class="form-row form-row--2col">
              <div class="form-group">
                <label class="form-label" for="tier-name">{{ t('admin.name') }} *</label>
                <input
                  id="tier-name"
                  v-model="form.name"
                  type="text"
                  class="input"
                  required
                  @blur="generateSlug"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="tier-slug">{{ t('admin.slug') }} *</label>
                <input
                  id="tier-slug"
                  v-model="form.slug"
                  type="text"
                  class="input"
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="tier-price">{{ t('admin.price') }}</label>
                <input
                  id="tier-price"
                  v-model.number="form.price"
                  type="number"
                  class="input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="tier-currency">{{ t('admin.currency') }}</label>
                <select id="tier-currency" v-model="form.currency" class="input">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="RUB">RUB (₽)</option>
                  <option value="ILS">ILS (₪)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="tier-period">{{ t('admin.period') }}</label>
                <select id="tier-period" v-model="form.period" class="input">
                  <option value="month">{{ t('pricing.monthly') }}</option>
                  <option value="year">{{ t('pricing.yearly') }}</option>
                  <option value="one-time">{{ t('pricing.oneTime') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="tier-order">{{ t('admin.order') }}</label>
                <input
                  id="tier-order"
                  v-model.number="form.order"
                  type="number"
                  class="input"
                  min="0"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="tier-description">{{ t('admin.description') }}</label>
              <textarea
                id="tier-description"
                v-model="form.description"
                class="input"
                rows="2"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="tier-cta-text">{{ t('admin.ctaText') }}</label>
              <input
                id="tier-cta-text"
                v-model="form.ctaText"
                type="text"
                class="input"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="tier-cta-url">{{ t('admin.ctaUrl') }}</label>
              <input
                id="tier-cta-url"
                v-model="form.ctaUrl"
                type="text"
                class="input"
              />
            </div>

            <div class="form-row">
              <label class="form-checkbox">
                <input v-model="form.featured" type="checkbox" />
                <span>{{ t('admin.featured') }}</span>
              </label>
              <label class="form-checkbox">
                <input v-model="form.published" type="checkbox" />
                <span>{{ t('admin.published') }}</span>
              </label>
            </div>

            <!-- Features -->
            <div class="form-group">
              <div class="form-group-header">
                <label class="form-label">{{ t('admin.features') }}</label>
                <button type="button" class="btn btn-sm btn-ghost" @click="addFeature">
                  <IconPlus /> {{ t('admin.addItem') }}
                </button>
              </div>

              <div v-if="!form.features.length" class="text-secondary text-sm">
                {{ t('admin.noItems') }}
              </div>

              <div v-for="(feature, index) in form.features" :key="index" class="input-row">
                <button type="button" class="btn btn-ghost btn-sm">
                  <IconGripVertical />
                </button>
                <input
                  v-model="feature.text"
                  type="text"
                  class="input"
                />
                <label class="form-checkbox">
                  <input v-model="feature.included" type="checkbox" />
                  <span>{{ t('admin.included') }}</span>
                </label>
                <button type="button" class="btn btn-ghost btn-sm text-error" @click="removeFeature(index)">
                  <IconTrash />
                </button>
              </div>
            </div>
          </form>

          <footer class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
              @click="saveTier"
            >
              {{ saving ? t('common.saving') : t('common.save') }}
            </button>
          </footer>
        </div>
      </div>
    </Teleport>

    <!-- Translation Modal -->
    <Teleport to="body">
      <div v-if="showTranslateModal" class="modal-backdrop" @click.self="showTranslateModal = false">
        <div class="modal modal--lg">
          <header class="modal-header">
            <h2>
              <IconLanguage class="icon" />
              {{ t('admin.translate') }}: {{ getLocaleName(selectedLocale) }}
            </h2>
            <button class="btn btn-ghost btn-sm" @click="showTranslateModal = false">
              <IconX />
            </button>
          </header>

          <form class="modal-body" @submit.prevent="saveTranslation">
            <!-- Original values shown as reference -->
            <p class="text-secondary text-sm mb-4">
              {{ t('admin.translateHint', { locale: getLocaleName(defaultLocale) }) }}
            </p>

            <div class="form-group">
              <label class="form-label">{{ t('admin.name') }}</label>
              <div class="text-secondary text-sm mb-1">{{ editingTier?.name }}</div>
              <input
                v-model="translationForm.name"
                type="text"
                class="input"
                :placeholder="editingTier?.name || ''"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.description') }}</label>
              <div class="text-secondary text-sm mb-1">{{ editingTier?.description || '-' }}</div>
              <textarea
                v-model="translationForm.description"
                class="input"
                rows="2"
                :placeholder="editingTier?.description || ''"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('admin.ctaText') }}</label>
              <div class="text-secondary text-sm mb-1">{{ editingTier?.ctaText || '-' }}</div>
              <input
                v-model="translationForm.ctaText"
                type="text"
                class="input"
                :placeholder="editingTier?.ctaText || ''"
              />
            </div>

            <!-- Feature translations -->
            <div class="form-group">
              <label class="form-label">{{ t('admin.features') }}</label>
              <div v-for="(feature, index) in translationForm.features" :key="feature.featureId" class="mb-3">
                <div class="text-secondary text-sm mb-1">
                  {{ editingTier?.features?.find(f => f.id === feature.featureId)?.text || '-' }}
                </div>
                <input
                  v-model="feature.text"
                  type="text"
                  class="input"
                  :placeholder="editingTier?.features?.find(f => f.id === feature.featureId)?.text || ''"
                />
              </div>
            </div>
          </form>

          <footer class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTranslateModal = false">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
              @click="saveTranslation"
            >
              {{ saving ? t('common.saving') : t('common.save') }}
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>
