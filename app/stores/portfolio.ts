/**
 * Portfolio Store (Composition API)
 *
 * Manages portfolio items state for admin CRUD operations.
 * Demonstrates Pinia patterns for data management:
 * - Async actions (fetch, create, update, delete)
 * - Optimistic updates
 * - Loading/error states
 * - Filtering and sorting
 */
import { defineStore } from 'pinia'

export interface PortfolioItem {
  id: number
  title: string
  description: string | null
  imageUrl: string | null
  videoUrl: string | null // For video portfolio (YouTube blocked in Russia)
  category: string | null
  order: number
  published: boolean
  createdAt: string
  updatedAt: string
}

type SortField = 'order' | 'title' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

export const usePortfolioStore = defineStore('portfolio', () => {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const items = ref<PortfolioItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const categoryFilter = ref<string | null>(null)
  const publishedFilter = ref<boolean | null>(null)
  const searchQuery = ref('')

  // Sorting
  const sortField = ref<SortField>('order')
  const sortDirection = ref<SortDirection>('asc')

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  // All unique categories for filter dropdown
  const categories = computed(() => {
    const cats = new Set(items.value.map(i => i.category).filter(Boolean))
    return Array.from(cats) as string[]
  })

  // Filtered and sorted items
  const filteredItems = computed(() => {
    let result = [...items.value]

    // Apply category filter
    if (categoryFilter.value) {
      result = result.filter(i => i.category === categoryFilter.value)
    }

    // Apply published filter
    if (publishedFilter.value !== null) {
      result = result.filter(i => i.published === publishedFilter.value)
    }

    // Apply search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        i => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDirection.value === 'asc' ? comparison : -comparison
    })

    return result
  })

  // Published items only (for public display)
  const publishedItems = computed(() =>
    items.value.filter(i => i.published).sort((a, b) => a.order - b.order)
  )

  // Stats
  const stats = computed(() => ({
    total: items.value.length,
    published: items.value.filter(i => i.published).length,
    draft: items.value.filter(i => !i.published).length,
    withVideo: items.value.filter(i => i.videoUrl).length
  }))

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  async function fetchAll() {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<PortfolioItem[]>('/api/admin/portfolio')
      items.value = data
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch portfolio items'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function create(item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>) {
    isLoading.value = true
    error.value = null

    try {
      const created = await $fetch<PortfolioItem>('/api/admin/portfolio', {
        method: 'POST',
        body: item
      })
      items.value.push(created)
      return created
    } catch (e: any) {
      error.value = e.message || 'Failed to create item'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function update(id: number, updates: Partial<PortfolioItem>) {
    error.value = null

    // Optimistic update
    const index = items.value.findIndex(i => i.id === id)
    const original = items.value[index]
    if (index !== -1) {
      items.value[index] = { ...original, ...updates }
    }

    try {
      const updated = await $fetch<PortfolioItem>(`/api/admin/portfolio/${id}`, {
        method: 'PUT',
        body: updates
      })
      // Replace with server response
      if (index !== -1) {
        items.value[index] = updated
      }
      return updated
    } catch (e: any) {
      // Rollback on error
      if (index !== -1) {
        items.value[index] = original
      }
      error.value = e.message || 'Failed to update item'
      throw e
    }
  }

  async function remove(id: number) {
    error.value = null

    // Optimistic delete
    const index = items.value.findIndex(i => i.id === id)
    const original = items.value[index]
    if (index !== -1) {
      items.value.splice(index, 1)
    }

    try {
      await $fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' })
    } catch (e: any) {
      // Rollback on error
      if (original) {
        items.value.splice(index, 0, original)
      }
      error.value = e.message || 'Failed to delete item'
      throw e
    }
  }

  async function reorder(orderedIds: number[]) {
    error.value = null

    try {
      await $fetch('/api/admin/portfolio/reorder', {
        method: 'POST',
        body: { ids: orderedIds }
      })
      // Update local order
      orderedIds.forEach((id, index) => {
        const item = items.value.find(i => i.id === id)
        if (item) item.order = index
      })
    } catch (e: any) {
      error.value = e.message || 'Failed to reorder items'
      throw e
    }
  }

  // Filter/sort actions
  function setFilter(category: string | null) {
    categoryFilter.value = category
  }

  function setPublishedFilter(published: boolean | null) {
    publishedFilter.value = published
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  function setSort(field: SortField, direction: SortDirection) {
    sortField.value = field
    sortDirection.value = direction
  }

  function clearFilters() {
    categoryFilter.value = null
    publishedFilter.value = null
    searchQuery.value = ''
  }

  return {
    // State
    items,
    isLoading,
    error,
    categoryFilter,
    publishedFilter,
    searchQuery,
    sortField,
    sortDirection,

    // Getters
    categories,
    filteredItems,
    publishedItems,
    stats,

    // Actions
    fetchAll,
    create,
    update,
    remove,
    reorder,
    setFilter,
    setPublishedFilter,
    setSearch,
    setSort,
    clearFilters
  }
})
