<script setup lang="ts">
/**
 * Admin Contacts Page
 *
 * View and manage contact form submissions.
 * Uses global CSS: .card, .badge, .btn, .flex, .grid utilities
 */
import IconTrash from '~icons/tabler/trash'
import IconMail from '~icons/tabler/mail'
import IconMailOpened from '~icons/tabler/mail-opened'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

// Shared unread count for nav badge
const { decrementUnread, incrementUnread, fetchUnreadCount } = useUnreadCount()

interface ContactSubmission {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  read: boolean
  createdAt: number
}

// Fetch contacts - pass cookies for SSR auth
const headers = useRequestHeaders(['cookie'])
const { data, pending, refresh } = await useFetch<{ items: ContactSubmission[]; unreadCount: number }>('/api/admin/contacts', {
  headers
})

const items = computed(() => data.value?.items || [])
const localUnreadCount = computed(() => data.value?.unreadCount || 0)

// Selected message for detail view
const selectedMessage = ref<ContactSubmission | null>(null)

async function toggleRead(item: ContactSubmission) {
  const wasUnread = !item.read
  try {
    await $fetch(`/api/admin/contacts/${item.id}`, {
      method: 'PUT',
      body: { read: !item.read }
    })
    // Update nav badge immediately (optimistic)
    if (wasUnread) {
      decrementUnread()
    } else {
      incrementUnread()
    }
    await refresh()
  } catch (e: any) {
    // Revert on error
    fetchUnreadCount()
    alert(e.data?.message || 'Failed to update')
  }
}

const deleting = ref<number | null>(null)

async function deleteMessage(item: ContactSubmission) {
  if (!confirm(t('admin.confirmDelete'))) return
  const wasUnread = !item.read
  deleting.value = item.id
  try {
    await $fetch(`/api/admin/contacts/${item.id}`, { method: 'DELETE' })
    // Update nav badge if deleted message was unread
    if (wasUnread) {
      decrementUnread()
    }
    if (selectedMessage.value?.id === item.id) {
      selectedMessage.value = null
    }
    await refresh()
  } catch (e: any) {
    fetchUnreadCount() // Revert on error
    alert(e.data?.message || 'Failed to delete')
  } finally {
    deleting.value = null
  }
}

function selectMessage(item: ContactSubmission) {
  selectedMessage.value = item
  // Mark as read when opening
  if (!item.read) {
    toggleRead(item)
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="admin-page">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        {{ t('admin.contacts') }}
        <span v-if="localUnreadCount" class="badge badge-primary">{{ localUnreadCount }}</span>
      </h1>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="card card-body text-center">
      <p class="text-secondary">{{ t('common.loading') }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!items.length" class="card card-body text-center">
      <IconMail class="icon-xl text-secondary mx-auto mb-4" />
      <p class="text-secondary">{{ t('admin.noMessages') }}</p>
    </div>

    <!-- Messages grid: list + detail -->
    <div v-else class="grid gap-4" style="grid-template-columns: minmax(280px, 1fr) 2fr;">
      <!-- Messages list -->
      <div class="card flex flex-col" style="max-height: 70vh; overflow-y: auto;">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="card-body flex flex-col gap-1 text-start border-b cursor-pointer"
          :class="{
            'bg-brand-subtle': selectedMessage?.id === item.id,
            'font-bold': !item.read
          }"
          @click="selectMessage(item)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-medium truncate">{{ item.name }}</span>
            <span class="text-xs text-secondary whitespace-nowrap">{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="text-sm truncate">{{ item.subject || t('admin.noSubject') }}</div>
          <div class="text-sm text-secondary truncate">{{ item.message.slice(0, 60) }}{{ item.message.length > 60 ? '...' : '' }}</div>
        </button>
      </div>

      <!-- Message detail -->
      <div class="card">
        <template v-if="selectedMessage">
          <div class="card-header flex items-center justify-between">
            <h2 class="text-lg font-bold">{{ selectedMessage.subject || t('admin.noSubject') }}</h2>
            <div class="flex gap-2">
              <button
                type="button"
                class="btn btn-icon btn-ghost"
                @click="toggleRead(selectedMessage)"
                :title="selectedMessage.read ? t('admin.markUnread') : t('admin.markRead')"
              >
                <IconMailOpened v-if="selectedMessage.read" />
                <IconMail v-else />
              </button>
              <button
                type="button"
                class="btn btn-icon btn-ghost text-danger"
                @click="deleteMessage(selectedMessage)"
                :disabled="deleting === selectedMessage.id"
                :title="t('common.delete')"
              >
                <IconTrash />
              </button>
            </div>
          </div>
          <div class="card-body flex flex-col gap-4">
            <div class="flex flex-col gap-1 text-sm text-secondary">
              <p><strong>{{ t('admin.from') }}:</strong> {{ selectedMessage.name }} &lt;{{ selectedMessage.email }}&gt;</p>
              <p v-if="selectedMessage.phone"><strong>{{ t('admin.phone') }}:</strong> {{ selectedMessage.phone }}</p>
              <p><strong>{{ t('admin.date') }}:</strong> {{ formatDate(selectedMessage.createdAt) }}</p>
            </div>
            <div class="whitespace-pre-wrap">{{ selectedMessage.message }}</div>
          </div>
        </template>
        <div v-else class="card-body text-center text-secondary">
          <IconMail class="icon-xl mx-auto mb-4 opacity-50" />
          <p>{{ t('admin.selectMessage') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  Uses global CSS classes:
  - ui/content: .card, .card-body, .card-header, .badge
  - ui/buttons: .btn, .btn-icon, .btn-ghost
  - common/utilities: .flex, .grid, .gap-*, .items-center, .justify-between
  - typography: .text-*, .font-*, .truncate
-->
