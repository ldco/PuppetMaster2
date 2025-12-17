<script setup lang="ts">
/**
 * Admin Users Page
 *
 * Manage users and their roles.
 * Only visible to master and admin users.
 * Uses existing CSS: .card, .badge, .btn, .data-table
 */
import IconPlus from '~icons/tabler/plus'
import IconEdit from '~icons/tabler/edit'
import IconTrash from '~icons/tabler/trash'
import IconX from '~icons/tabler/x'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { t } = useI18n()
const { confirm } = useConfirm()
const { toast } = useToast()
const { user: currentUser, canManageUsers, getAssignableRoles, isMaster } = useAuth()

// Redirect if user can't manage users
if (!canManageUsers.value) {
  navigateTo('/admin')
}

interface User {
  id: number
  email: string
  name: string | null
  role: 'master' | 'admin' | 'editor'
  createdAt: Date
}

// Fetch users
const headers = useRequestHeaders(['cookie'])
const { data, pending, refresh } = await useFetch<{ users: User[] }>('/api/admin/users', { headers })
const users = computed(() => data.value?.users || [])

// Modal state
const showModal = ref(false)
const editingUser = ref<User | null>(null)
const formError = ref('')
const saving = ref(false)

// Form data
const form = reactive({
  email: '',
  password: '',
  name: '',
  role: 'editor' as 'master' | 'admin' | 'editor'
})

const assignableRoles = computed(() => getAssignableRoles())

function openCreateModal() {
  editingUser.value = null
  form.email = ''
  form.password = ''
  form.name = ''
  form.role = 'editor'
  formError.value = ''
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  form.email = user.email
  form.password = ''
  form.name = user.name || ''
  form.role = user.role
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function saveUser() {
  formError.value = ''
  saving.value = true

  try {
    if (editingUser.value) {
      // Update existing user
      const body: Record<string, unknown> = {
        email: form.email,
        name: form.name || null,
        role: form.role
      }
      if (form.password) body.password = form.password

      await $fetch(`/api/admin/users/${editingUser.value.id}`, {
        method: 'PUT',
        body
      })
    } else {
      // Create new user
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password,
          name: form.name || null,
          role: form.role
        }
      })
    }
    closeModal()
    await refresh()
  } catch (e: any) {
    formError.value = e.data?.message || 'Failed to save user'
  } finally {
    saving.value = false
  }
}

const deleting = ref<number | null>(null)

async function deleteUser(user: User) {
  const confirmed = await confirm(t('admin.confirmDelete'), {
    title: t('common.delete'),
    confirmText: t('common.delete'),
    variant: 'danger'
  })
  if (!confirmed) return

  deleting.value = user.id
  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to delete user')
  } finally {
    deleting.value = null
  }
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const roleLabels: Record<string, string> = {
  master: 'Master',
  admin: 'Admin',
  editor: 'Editor'
}

const roleBadgeClass: Record<string, string> = {
  master: 'badge-warning',
  admin: 'badge-primary',
  editor: 'badge-secondary'
}
</script>

<template>
  <div class="admin-users">
    <div class="page-header">
      <h1 class="page-title">{{ t('admin.users') }}</h1>
      <div class="page-actions">
        <button class="btn btn-primary" @click="openCreateModal">
          <IconPlus /> {{ t('admin.addUser') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">{{ t('common.loading') }}</div>

    <!-- Users table -->
    <div v-else class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('admin.name') }}</th>
            <th>{{ t('admin.email') }}</th>
            <th>{{ t('admin.role') }}</th>
            <th>{{ t('admin.created') }}</th>
            <th class="actions-col">{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name || '—' }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="roleBadgeClass[user.role]">
                {{ roleLabels[user.role] }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td class="actions-col">
              <button
                class="btn btn-icon btn-ghost"
                @click="openEditModal(user)"
                :title="t('common.edit')"
                :disabled="user.role === 'master' && !isMaster"
              >
                <IconEdit />
              </button>
              <button
                class="btn btn-icon btn-ghost btn-danger"
                @click="deleteUser(user)"
                :disabled="deleting === user.id || user.id === currentUser?.id || (user.role === 'master' && !isMaster)"
                :title="t('common.delete')"
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
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingUser ? t('admin.editUser') : t('admin.addUser') }}</h2>
            <button class="btn btn-icon btn-ghost" @click="closeModal">
              <IconX />
            </button>
          </div>
          <form class="modal-body" @submit.prevent="saveUser">
            <div v-if="formError" class="form-error">{{ formError }}</div>

            <div class="form-group">
              <label for="email">{{ t('admin.email') }} *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="input"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">
                {{ t('admin.password') }}
                {{ editingUser ? '' : '*' }}
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="input"
                :required="!editingUser"
                :placeholder="editingUser ? t('admin.leaveBlankToKeep') : ''"
              />
            </div>

            <div class="form-group">
              <label for="name">{{ t('admin.name') }}</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="input"
              />
            </div>

            <div class="form-group">
              <label for="role">{{ t('admin.role') }} *</label>
              <select id="role" v-model="form.role" class="input" required>
                <option
                  v-for="role in assignableRoles"
                  :key="role"
                  :value="role"
                >
                  {{ roleLabels[role] }}
                </option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-ghost" @click="closeModal">
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
