<script setup lang="ts">
/**
 * LegalInfo Molecule
 *
 * Config-driven copyright and legal/juridical info.
 * - Company name from settings (for copyright)
 * - Legal details: ИНН, ОГРН, Address, Email (shown in small print)
 * - Only shows items that have values in database
 */

const { t } = useI18n()
const { settings } = useSiteSettings()
const currentYear = new Date().getFullYear()

// Company name for copyright (fallback to site name or 'Puppet Master')
const companyName = computed(() => {
  return settings.value?.legal.companyName
    || settings.value?.site.name
    || 'Puppet Master'
})

// Legal details (only those with values)
const legalDetails = computed(() => {
  const legal = settings.value?.legal
  if (!legal) return []

  const items: Array<{ label: string; value: string }> = []

  if (legal.inn) items.push({ label: 'ИНН', value: legal.inn })
  if (legal.ogrn) items.push({ label: 'ОГРН', value: legal.ogrn })
  if (legal.address) items.push({ label: 'Адрес', value: legal.address })
  if (legal.email) items.push({ label: 'Email', value: legal.email })

  return items
})
</script>

<template>
  <!-- Uses global classes from skeleton/footer.css (.legal-info, .copyright, .legal-links) -->
  <div class="legal-info">
    <!-- Copyright -->
    <p class="copyright">
      © {{ currentYear }} {{ companyName }}. {{ t('footer.rights') }}
    </p>

    <!-- Legal/Juridical details (small print) -->
    <p v-if="legalDetails.length > 0" class="legal-details">
      <span v-for="(item, index) in legalDetails" :key="item.label" class="legal-item">
        {{ item.label }}: {{ item.value }}<span v-if="index < legalDetails.length - 1" class="legal-sep"> · </span>
      </span>
    </p>

    <!-- Legal links slot (Privacy Policy, Terms, etc.) -->
    <nav class="legal-links">
      <slot />
    </nav>
  </div>
</template>

<style scoped>
.legal-details {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}

.legal-item {
  white-space: nowrap;
}

.legal-sep {
  color: var(--text-tertiary);
  opacity: 0.5;
}
</style>

