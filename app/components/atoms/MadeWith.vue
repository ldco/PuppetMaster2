<script setup lang="ts">
/**
 * MadeWith Atom
 *
 * "Made with Puppet Master" branding with horizontal logo.
 * Links to the Puppet Master website.
 * Centered at the very bottom of footer.
 *
 * IMPORTANT: Logo is stored in /public/puppetmaster/ - a special folder
 * that should NOT be replaced when customizing the site for clients.
 */

const { t } = useI18n()
const puppetMasterUrl = 'https://puppetmaster.dev'
</script>

<template>
  <div class="made-with">
    <span class="made-with-text">{{ t('footer.madeWith') }}</span>
    <a
      :href="puppetMasterUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="made-with-link"
      :aria-label="t('footer.puppetMaster')"
    >
      <!-- Horizontal logo in /puppetmaster/ folder - framework assets, don't replace! -->
      <img
        src="/puppetmaster/horizontal_dark_en.svg"
        alt="Puppet Master"
        class="made-with-logo light-logo"
      />
      <img
        src="/puppetmaster/horizontal_light_en.svg"
        alt="Puppet Master"
        class="made-with-logo dark-logo"
      />
    </a>
  </div>
</template>

