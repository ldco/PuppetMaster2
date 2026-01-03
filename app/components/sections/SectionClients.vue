<script setup lang="ts">
/**
 * Clients Section
 *
 * Displays client/sponsor/partner logos.
 */

interface ClientData {
  id: number
  name: string
  logoUrl: string
  websiteUrl: string | null
  category: string | null
}

const { t, te, locale } = useI18n()

defineProps<{
  title?: string
}>()

const sectionTitle = computed(() => {
  if (te('clients.title')) return t('clients.title')
  if (te('nav.clients')) return t('nav.clients')
  return ''
})

const { isEnabled, config } = useModule('clients')

const { data: clients, pending } = await useFetch<ClientData[]>('/api/clients', {
  key: `clients-${locale.value}`,
  watch: [locale]
})
</script>

<template>
  <section v-if="isEnabled" id="clients" class="section section--bg-alt">
    <div class="container">
      <h2 v-if="title || sectionTitle || $slots.title" v-reveal class="section-title section-title--center">
        <slot name="title">{{ title ?? sectionTitle }}</slot>
      </h2>

      <div class="section-body">
        <div v-if="pending" class="clients-loading">{{ t('common.loading') }}</div>

        <p v-else-if="!clients?.length" class="text-center text-secondary">{{ t('clients.noItems') }}</p>

        <div v-else class="clients-strip" :class="{ 'clients-strip--grayscale': config?.grayscale }" v-reveal>
          <a
            v-for="client in clients"
            :key="client.id"
            :href="client.websiteUrl || '#'"
            :target="client.websiteUrl ? '_blank' : undefined"
            :rel="client.websiteUrl ? 'noopener noreferrer' : undefined"
            class="clients-strip__item"
            :title="client.name"
          >
            <img :src="client.logoUrl" :alt="client.name" loading="lazy" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
