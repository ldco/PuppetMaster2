<script setup lang="ts">
/**
 * TheFooter Organism
 *
 * Site footer with social links, contact info, and legal info.
 * Supports minimal (copyright only) and rich (with contact/social) variants.
 *
 * Uses config-driven components:
 * - <SocialNav /> - renders social links from settings
 * - <ContactInfo /> - renders contact info from settings
 */

defineProps<{
  /** Show extended footer with contact and social */
  rich?: boolean
  /** Show contact info in rich footer */
  showContact?: boolean
}>()
</script>

<template>
  <!--
    Uses global classes from skeleton/footer.css:
    .footer, .footer-rich, .footer-main, .footer-brand, .footer-divider
  -->
  <footer class="footer" :class="{ 'footer-rich': rich }">
    <div class="container">
      <!-- Rich footer: Logo + Social + Contact -->
      <template v-if="rich">
        <div class="footer-main">
          <div class="footer-brand">
            <AtomsLogo />
          </div>

          <!-- Social links from settings -->
          <MoleculesSocialNav />
        </div>

        <!-- Contact info (optional) -->
        <MoleculesContactInfo v-if="showContact" horizontal />

        <div class="footer-divider"></div>
      </template>

      <!-- Always show: Legal info -->
      <MoleculesLegalInfo>
        <slot name="legal-links">
          <!-- Default legal links - can be overridden via slot -->
        </slot>
      </MoleculesLegalInfo>
    </div>
  </footer>
</template>

<!-- No scoped styles needed - all styles come from skeleton/footer.css -->

