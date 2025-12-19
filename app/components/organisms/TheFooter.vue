<script setup lang="ts">
/**
 * TheFooter Organism
 *
 * Compact, config-driven footer with horizontal layout.
 * Uses skeleton classes from skeleton/footer.css.
 *
 * Structure:
 * ┌───────────────────────────────────────────────────────────┐
 * │ LOGO  [Social icons]     [CTA]    Home About Portfolio... │
 * ├───────────────────────────────────────────────────────────┤
 * │ © 2025 Company · ИНН: xxx · ОГРН: xxx · Address · Email   │
 * │ Privacy Policy | Terms of Service                         │
 * ├───────────────────────────────────────────────────────────┤
 * │              Made with [Puppet Master]                    │
 * └───────────────────────────────────────────────────────────┘
 */
import config from '~/puppet-master.config'

const { t } = useI18n()
const { settings } = useSiteSettings()

defineProps<{
  rich?: boolean
}>()

// Feature flags from config
const showFooterNav = computed(() => config.features.footerNav)
const showFooterCta = computed(() => config.features.footerCta)
const showLegalLinks = computed(() => config.features.footerLegalLinks)
const showMadeWith = computed(() => config.features.footerMadeWith)

// Legal links (only if URL exists in DB)
const privacyUrl = computed(() => settings.value?.footer.privacyUrl)
const termsUrl = computed(() => settings.value?.footer.termsUrl)
const hasLegalLinks = computed(() => showLegalLinks.value && (privacyUrl.value || termsUrl.value))
</script>

<template>
  <footer class="footer" :class="{ 'footer-rich': rich }">
    <div class="container">

      <!-- Grid: Logo | Social | Nav | CTA -->
      <div class="footer-grid">
        <AtomsLogo class="footer-logo" />
        <MoleculesSocialNav v-if="rich" circle class="footer-social" />
        <MoleculesFooterNav v-if="showFooterNav" />
        <MoleculesFooterCta v-if="showFooterCta" />
      </div>

      <!-- Legal bar -->
      <div class="legal-bar">
        <MoleculesLegalInfo />
        <nav v-if="hasLegalLinks" class="legal-links">
          <NuxtLink v-if="privacyUrl" :to="privacyUrl">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink v-if="termsUrl" :to="termsUrl">{{ t('footer.terms') }}</NuxtLink>
        </nav>
      </div>

      <!-- Made with PM -->
      <AtomsMadeWith v-if="showMadeWith" class="footer-made-with" />

    </div>
  </footer>
</template>

