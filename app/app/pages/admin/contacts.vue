<script setup lang="ts">
/**
 * Admin Contacts Page
 *
 * View and manage contact form submissions.
 * Uses existing CSS: .card, .badge, .btn
 */
import IconTrash from '~icons/tabler/trash'
import IconMail from '~icons/tabler/mail'
import IconMailOpened from '~icons/tabler/mail-opened'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()

interface ContactSubmission {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  read: boolean
  createdAt: Date
}

// Fetch contacts - pass cookies for SSR auth
const headers = useRequestHeaders(['cookie'])
const { data, pending, refresh } = await useFetch<{ items: ContactSubmission[]; unreadCount: number }>('/api/admin/contacts', {
  headers
})

const items = computed(() => data.value?.items || [])
const unreadCount = computed(() => data.value?.unreadCount || 0)

// Selected message for detail view
const selectedMessage = ref<ContactSubmission | null>(null)

async function toggleRead(item: ContactSubmission) {
  try {
    await $fetch(`/api/admin/contacts/${item.id}`, {
      method: 'PUT',
      body: { read: !item.read }
    })
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Failed to update')
  }
}

const deleting = ref<number | null>(null)

async function deleteMessage(item: ContactSubmission) {
  if (!confirm(t('admin.confirmDelete'))) return
  deleting.value = item.id
  try {
    await $fetch(`/api/admin/contacts/${item.id}`, { method: 'DELETE' })
    if (selectedMessage.value?.id === item.id) {
      selectedMessage.value = null
    }
    await refresh()
  } catch (e: any) {
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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="admin-contacts">
    <div class="page-header">
      <h1 class="page-title">
        {{ t('admin.contacts') }}
        <span v-if="unreadCount" class="badge badge-primary">{{ unreadCount }}</span>
      </h1>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

    <!-- Empty state -->
    <div v-else-if="!items.length" class="empty-state">
      <p>{{ t('admin.noMessages') }}</p>
    </div>

    <!-- Messages list and detail -->
    <div v-else class="contacts-layout">
      <!-- Messages list -->
      <div class="messages-list card">
        <div
          v-for="item in items"
          :key="item.id"
          class="message-item"
          :class="{ 'is-unread': !item.read, 'is-selected': selectedMessage?.id === item.id }"
          @click="selectMessage(item)"
        >
          <div class="message-item-header">
            <span class="message-sender">{{ item.name }}</span>
            <span class="message-date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="message-subject">{{ item.subject || '(No subject)' }}</div>
          <div class="message-preview">{{ item.message.slice(0, 80) }}{{ item.message.length > 80 ? '...' : '' }}</div>
        </div>
      </div>

      <!-- Message detail -->
      <div class="message-detail card">
        <template v-if="selectedMessage">
          <div class="card-header">
            <div class="message-detail-header">
              <h2>{{ selectedMessage.subject || '(No subject)' }}</h2>
              <div class="message-detail-actions">
                <button
                  class="btn btn-icon btn-ghost"
                  @click="toggleRead(selectedMessage)"
                  :title="selectedMessage.read ? t('admin.markUnread') : t('admin.markRead')"
                >
                  <IconMailOpened v-if="selectedMessage.read" />
                  <IconMail v-else />
                </button>
                <button
                  class="btn btn-icon btn-ghost btn-danger"
                  @click="deleteMessage(selectedMessage)"
                  :disabled="deleting === selectedMessage.id"
                  :title="t('common.delete')"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="message-meta">
              <p><strong>From:</strong> {{ selectedMessage.name }} &lt;{{ selectedMessage.email }}&gt;</p>
              <p v-if="selectedMessage.phone"><strong>Phone:</strong> {{ selectedMessage.phone }}</p>
              <p><strong>Date:</strong> {{ formatDate(selectedMessage.createdAt) }}</p>
            </div>
            <div class="message-body">{{ selectedMessage.message }}</div>
          </div>
        </template>
        <div v-else class="empty-detail">
          <p>Select a message to view</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page-specific styles - .page-header, .page-title, .loading-state, .empty-state are global */

.contacts-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--space-4);
  min-height: 500px;
}

@media (max-width: 900px) {
  .contacts-layout {
    grid-template-columns: 1fr;
  }
}

.messages-list {
  overflow-y: auto;
  max-height: 600px;
}

.message-item {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--l-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item:hover {
  background: var(--l-bg-sunken);
}

.message-item.is-selected {
  background: var(--i-brand-subtle);
}

.message-item.is-unread {
  border-left: 3px solid var(--i-brand);
}

.message-item.is-unread .message-sender {
  font-weight: var(--font-semibold);
}

.message-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.message-sender {
  font-size: var(--text-sm);
}

.message-date {
  font-size: var(--text-xs);
  color: var(--t-muted);
}

.message-subject {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-1);
}

.message-preview {
  font-size: var(--text-sm);
  color: var(--t-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-detail {
  display: flex;
  flex-direction: column;
}

.message-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-detail-header h2 {
  margin: 0;
  font-size: var(--text-lg);
}

.message-detail-actions {
  display: flex;
  gap: var(--space-1);
}

.message-meta {
  font-size: var(--text-sm);
  color: var(--t-secondary);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--l-border);
}

.message-meta p {
  margin: var(--space-1) 0;
}

.message-body {
  white-space: pre-wrap;
  line-height: 1.6;
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--t-muted);
}

</style>
