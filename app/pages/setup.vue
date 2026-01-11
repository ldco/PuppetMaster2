<script setup lang="ts">
/**
 * Setup Page
 *
 * Two-phase setup:
 * 1. Mode Selection (BUILD vs DEVELOP)
 * 2. BUILD: Single-page configuration form
 *    DEVELOP: One-click apply
 */
import IconRocket from '~icons/tabler/rocket'
import IconCode from '~icons/tabler/code'
import IconWorld from '~icons/tabler/world'
import IconApps from '~icons/tabler/apps'
import IconCheck from '~icons/tabler/check'
import IconChevronLeft from '~icons/tabler/chevron-left'
import IconLoader from '~icons/tabler/loader-2'
import IconPackageImport from '~icons/tabler/package-import'
import IconSparkles from '~icons/tabler/sparkles'
import IconFolder from '~icons/tabler/folder'

definePageMeta({
  layout: 'blank'
})

useHead({
  title: 'Setup | Puppet Master'
})

// Phase state
const phase = ref<'mode-select' | 'configure'>('mode-select')
const loading = ref(true)
const saving = ref(false)
const error = ref('')

// Configuration
const config = reactive({
  pmMode: 'build' as 'build' | 'develop',
  projectType: 'website' as 'website' | 'app',
  adminEnabled: true,
  importMode: 'fresh' as 'fresh' | 'import',
  modules: ['contact'] as string[],
  features: {
    multiLangs: false,
    doubleTheme: true,
    onepager: false,
    pwa: false
  },
  locales: [{ code: 'en', iso: 'en-US', name: 'English' }] as Array<{
    code: string
    iso: string
    name: string
  }>,
  defaultLocale: 'en'
})

// Brownfield detection
const hasBrownfieldContent = ref(false)
const importFolderFiles = ref<string[]>([])

// Current config from server
const currentConfig = ref<any>(null)

// Fetch current config on mount
onMounted(async () => {
  try {
    const data = await $fetch('/api/setup/config')
    currentConfig.value = data

    // Capture brownfield info
    if (data.hasBrownfieldContent) {
      hasBrownfieldContent.value = true
      importFolderFiles.value = data.importFolderFiles || []
    }

    // If already configured, show different starting point
    if (data.pmMode !== 'unconfigured') {
      config.pmMode = data.pmMode
      config.projectType = data.projectType || 'website'
      config.adminEnabled = data.adminEnabled
      config.modules = data.enabledModules
      config.features = data.features
      config.locales = data.locales
      config.defaultLocale = data.defaultLocale
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load configuration'
  } finally {
    loading.value = false
  }
})

// Available modules
const availableModules = [
  { id: 'blog', name: 'Blog', desc: 'Posts, categories, tags' },
  { id: 'portfolio', name: 'Portfolio', desc: 'Project showcase' },
  { id: 'team', name: 'Team', desc: 'Team member profiles' },
  { id: 'testimonials', name: 'Testimonials', desc: 'Customer reviews' },
  { id: 'faq', name: 'FAQ', desc: 'Questions & answers' },
  { id: 'pricing', name: 'Pricing', desc: 'Pricing tables' },
  { id: 'clients', name: 'Clients', desc: 'Client logos' },
  { id: 'features', name: 'Features', desc: 'Feature cards' },
  { id: 'contact', name: 'Contact', desc: 'Contact form' }
]

// Available locales
const availableLocales = [
  { code: 'en', iso: 'en-US', name: 'English' },
  { code: 'ru', iso: 'ru-RU', name: 'Russian' },
  { code: 'he', iso: 'he-IL', name: 'Hebrew' },
  { code: 'es', iso: 'es-ES', name: 'Spanish' },
  { code: 'fr', iso: 'fr-FR', name: 'French' },
  { code: 'de', iso: 'de-DE', name: 'German' },
  { code: 'zh', iso: 'zh-CN', name: 'Chinese' },
  { code: 'ja', iso: 'ja-JP', name: 'Japanese' }
]

// Start BUILD configuration
function startBuildConfig() {
  config.pmMode = 'build'
  phase.value = 'configure'
}

// Back to mode selection
function backToModeSelect() {
  phase.value = 'mode-select'
}

// Apply DEVELOP mode immediately
async function applyDevelopMode() {
  saving.value = true
  error.value = ''

  try {
    await $fetch('/api/setup/config', {
      method: 'POST',
      body: {
        pmMode: 'develop',
        projectType: 'website',
        adminEnabled: true,
        modules: availableModules.map(m => m.id),
        features: {
          multiLangs: true,
          doubleTheme: true,
          onepager: false,
          pwa: false
        }
      }
    })
    window.location.href = '/'
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to apply configuration'
    saving.value = false
  }
}

// Retry loading config
async function retryLoad() {
  error.value = ''
  loading.value = true
  try {
    const data = await $fetch('/api/setup/config')
    currentConfig.value = data
    if (data.hasBrownfieldContent) {
      hasBrownfieldContent.value = true
      importFolderFiles.value = data.importFolderFiles || []
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load configuration'
  } finally {
    loading.value = false
  }
}

// Module toggle
function toggleModule(moduleId: string) {
  const index = config.modules.indexOf(moduleId)
  if (index === -1) {
    config.modules.push(moduleId)
  } else {
    config.modules.splice(index, 1)
  }
}

// Locale toggle
function toggleLocale(locale: (typeof availableLocales)[0]) {
  const index = config.locales.findIndex(l => l.code === locale.code)
  if (index === -1) {
    config.locales.push(locale)
    if (config.locales.length === 1) {
      config.defaultLocale = locale.code
    }
  } else if (config.locales.length > 1) {
    config.locales.splice(index, 1)
    if (config.defaultLocale === locale.code) {
      config.defaultLocale = config.locales[0].code
    }
  }
}

// Apply configuration
async function applyConfig() {
  saving.value = true
  error.value = ''

  try {
    await $fetch('/api/setup/config', {
      method: 'POST',
      body: {
        pmMode: 'build',
        projectType: config.projectType,
        adminEnabled: config.adminEnabled,
        modules: config.modules,
        features: config.features,
        locales: config.locales,
        defaultLocale: config.defaultLocale
      }
    })

    // Redirect based on settings
    if (config.adminEnabled) {
      window.location.href = '/admin'
    } else {
      window.location.href = '/'
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save configuration'
    saving.value = false
  }
}
</script>

<template>
  <div class="setup-page">
    <!-- Header -->
    <header class="setup-header">
      <div class="setup-logo">
        <span class="logo-icon">🎭</span>
        <span class="logo-text">Puppet Master</span>
      </div>
      <div class="setup-label">
        {{ phase === 'mode-select' ? 'Setup' : 'Configure Build' }}
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="setup-loading">
      <IconLoader class="spinner" />
      <p>Loading configuration...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error && phase === 'mode-select'" class="setup-error">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="retryLoad">
        Try Again
      </button>
    </div>

    <!-- Mode Selection -->
    <main v-else-if="phase === 'mode-select'" class="setup-content">
      <section class="setup-section">
        <h1 class="section-title">Choose Your Mode</h1>
        <p class="section-desc">How will you use Puppet Master?</p>

        <div class="mode-cards">
          <button
            class="mode-card"
            @click="startBuildConfig"
          >
            <IconRocket class="mode-icon" />
            <h2>BUILD</h2>
            <p>Create a client project</p>
            <ul>
              <li>Website or App</li>
              <li>Select specific modules</li>
              <li>Customize for client needs</li>
            </ul>
            <span class="mode-action">Configure →</span>
          </button>

          <button
            class="mode-card"
            :disabled="saving"
            @click="applyDevelopMode"
          >
            <IconCode class="mode-icon" />
            <h2>DEVELOP</h2>
            <p>Work on the framework</p>
            <ul>
              <li>Enable all features</li>
              <li>Showcase mode</li>
              <li>Test & develop PM itself</li>
            </ul>
            <span class="mode-action">
              <IconLoader v-if="saving" class="spinner" />
              {{ saving ? 'Applying...' : 'Start Now →' }}
            </span>
          </button>
        </div>
      </section>
    </main>

    <!-- BUILD Configuration Form -->
    <main v-else class="setup-content setup-form">
      <!-- Error Banner -->
      <div v-if="error" class="error-banner">
        {{ error }}
      </div>

      <!-- Project Type -->
      <section class="setup-section">
        <h2 class="section-title">Project Type</h2>
        <p class="section-desc">What are you building?</p>

        <div class="type-cards">
          <button
            class="type-card"
            :class="{ active: config.projectType === 'website' }"
            @click="config.projectType = 'website'"
          >
            <IconWorld class="type-icon" />
            <div class="type-info">
              <h3>Website</h3>
              <p>Marketing site, landing pages, SEO content</p>
            </div>
            <IconCheck v-if="config.projectType === 'website'" class="check-icon" />
          </button>

          <button
            class="type-card"
            :class="{ active: config.projectType === 'app' }"
            @click="config.projectType = 'app'"
          >
            <IconApps class="type-icon" />
            <div class="type-info">
              <h3>App</h3>
              <p>Dashboard, user features, login required</p>
            </div>
            <IconCheck v-if="config.projectType === 'app'" class="check-icon" />
          </button>
        </div>

        <label class="checkbox-label">
          <input v-model="config.adminEnabled" type="checkbox" />
          <span>Enable Admin Panel</span>
        </label>
      </section>

      <!-- Import Mode -->
      <section class="setup-section">
        <h2 class="section-title">Setup Source</h2>
        <p class="section-desc">Are you starting fresh or importing existing code?</p>

        <div class="type-cards">
          <button
            class="type-card"
            :class="{ active: config.importMode === 'fresh' }"
            @click="config.importMode = 'fresh'"
          >
            <IconSparkles class="type-icon" />
            <div class="type-info">
              <h3>Fresh Start</h3>
              <p>Clean slate with default configs</p>
            </div>
            <IconCheck v-if="config.importMode === 'fresh'" class="check-icon" />
          </button>

          <button
            class="type-card"
            :class="{ active: config.importMode === 'import', disabled: !hasBrownfieldContent }"
            :disabled="!hasBrownfieldContent"
            @click="hasBrownfieldContent && (config.importMode = 'import')"
          >
            <IconPackageImport class="type-icon" />
            <div class="type-info">
              <h3>Import Existing</h3>
              <p>Migrate from ./import/ folder</p>
            </div>
            <IconCheck v-if="config.importMode === 'import'" class="check-icon" />
          </button>
        </div>

        <div v-if="!hasBrownfieldContent" class="info-box">
          <IconFolder class="info-icon" />
          <div>
            <strong>No import content detected</strong>
            <p>Place files in <code>./import/</code> folder to enable import mode.</p>
          </div>
        </div>

        <div v-else-if="config.importMode === 'import'" class="import-detected">
          <strong>Found {{ importFolderFiles.length }} items in ./import/</strong>
          <ul class="import-files">
            <li v-for="file in importFolderFiles.slice(0, 5)" :key="file">{{ file }}</li>
            <li v-if="importFolderFiles.length > 5" class="more-files">
              +{{ importFolderFiles.length - 5 }} more
            </li>
          </ul>
          <p class="import-note">Run <code>/pm-migrate</code> after setup to analyze and import.</p>
        </div>
      </section>

      <!-- Modules -->
      <section class="setup-section">
        <h2 class="section-title">Modules</h2>
        <p class="section-desc">Select the modules you need</p>

        <div class="modules-grid">
          <button
            v-for="mod in availableModules"
            :key="mod.id"
            class="module-card"
            :class="{ active: config.modules.includes(mod.id) }"
            @click="toggleModule(mod.id)"
          >
            <IconCheck v-if="config.modules.includes(mod.id)" class="check-icon" />
            <h3>{{ mod.name }}</h3>
            <p>{{ mod.desc }}</p>
          </button>
        </div>
      </section>

      <!-- Languages -->
      <section class="setup-section">
        <h2 class="section-title">Languages</h2>
        <p class="section-desc">Select supported languages</p>

        <div class="locales-grid">
          <button
            v-for="locale in availableLocales"
            :key="locale.code"
            class="locale-chip"
            :class="{
              active: config.locales.some(l => l.code === locale.code),
              default: config.defaultLocale === locale.code
            }"
            @click="toggleLocale(locale)"
          >
            {{ locale.name }}
            <span v-if="config.defaultLocale === locale.code" class="default-badge">default</span>
          </button>
        </div>

        <div v-if="config.locales.length > 1" class="form-group">
          <label class="form-label">Default Language</label>
          <select v-model="config.defaultLocale" class="input">
            <option v-for="l in config.locales" :key="l.code" :value="l.code">
              {{ l.name }}
            </option>
          </select>
        </div>
      </section>

      <!-- Features -->
      <section class="setup-section">
        <h2 class="section-title">Features</h2>
        <p class="section-desc">Additional functionality</p>

        <div class="features-list">
          <label class="checkbox-label">
            <input v-model="config.features.doubleTheme" type="checkbox" />
            <span>Dark/Light Mode Toggle</span>
          </label>
          <label class="checkbox-label">
            <input v-model="config.features.onepager" type="checkbox" />
            <span>One-page Layout (scroll navigation)</span>
          </label>
          <label class="checkbox-label">
            <input v-model="config.features.pwa" type="checkbox" />
            <span>Progressive Web App (PWA)</span>
          </label>
        </div>
      </section>

      <!-- Database Warning -->
      <div v-if="currentConfig?.databaseExists" class="warning-box">
        <strong>Note:</strong> A database already exists. Your data will be preserved.
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button
          class="btn btn-secondary"
          @click="backToModeSelect"
          :disabled="saving"
        >
          <IconChevronLeft />
          Back
        </button>

        <button
          class="btn btn-primary btn-success"
          @click="applyConfig"
          :disabled="saving"
        >
          <IconLoader v-if="saving" class="spinner" />
          <IconCheck v-else />
          {{ saving ? 'Applying...' : 'Apply & Start' }}
        </button>
      </div>
    </main>
  </div>
</template>

<style>
/* Setup Page */
.setup-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
}

.setup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.setup-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: 600;
}

.logo-icon {
  font-size: var(--text-2xl);
}

.setup-label {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.setup-loading,
.setup-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.setup-content {
  flex: 1;
  padding: var(--space-8) var(--space-6);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.setup-form {
  padding-bottom: var(--space-16);
}

.setup-section {
  margin-bottom: var(--space-8);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.section-desc {
  color: var(--text-2);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
}

/* Mode Cards (Mode Selection) */
.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.mode-card {
  padding: var(--space-6);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-card:hover {
  border-color: var(--brand);
  background: var(--surface-3);
}

.mode-card.active {
  border-color: var(--brand);
  background: color-mix(in oklch, var(--brand) 10%, var(--surface-2));
}

.mode-icon {
  width: 48px;
  height: 48px;
  color: var(--brand);
  margin-bottom: var(--space-3);
}

.mode-card h2 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-1);
}

.mode-card p {
  color: var(--text-2);
  margin-bottom: var(--space-3);
}

.mode-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mode-card li {
  padding: var(--space-1) 0;
  padding-left: var(--space-4);
  position: relative;
  color: var(--text-2);
  font-size: var(--text-sm);
}

.mode-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success);
}

.mode-action {
  display: block;
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
  color: var(--brand);
  font-weight: 600;
  font-size: var(--text-sm);
}

/* Type Cards (inline selection) */
.type-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.type-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-card:hover {
  border-color: var(--brand);
}

.type-card.active {
  border-color: var(--brand);
  background: color-mix(in oklch, var(--brand) 8%, var(--surface-2));
}

.type-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-card.disabled:hover {
  border-color: var(--border);
}

.type-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: var(--brand);
}

.type-info {
  flex: 1;
}

.type-info h3 {
  font-size: var(--text-base);
  margin-bottom: 2px;
}

.type-info p {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.type-card .check-icon {
  width: 24px;
  height: 24px;
  color: var(--brand);
  flex-shrink: 0;
}

/* Modules Grid */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}

.module-card {
  padding: var(--space-3);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.module-card:hover {
  border-color: var(--brand);
}

.module-card.active {
  border-color: var(--brand);
  background: color-mix(in oklch, var(--brand) 10%, var(--surface-2));
}

.module-card .check-icon {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  color: var(--brand);
  width: 18px;
  height: 18px;
}

.module-card h3 {
  font-size: var(--text-sm);
  margin-bottom: 2px;
}

.module-card p {
  font-size: var(--text-xs);
  color: var(--text-2);
}

/* Locales */
.locales-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.locale-chip {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--surface-2);
  cursor: pointer;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.locale-chip:hover {
  border-color: var(--brand);
}

.locale-chip.active {
  border-color: var(--brand);
  background: color-mix(in oklch, var(--brand) 15%, var(--surface-2));
}

.locale-chip .default-badge {
  font-size: var(--text-xs);
  background: var(--brand);
  color: var(--brand-contrast);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

/* Features */
.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--brand);
}

/* Form Group */
.form-group {
  margin-top: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
}

/* Info/Warning Boxes */
.info-box {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.info-box .info-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--text-2);
}

.info-box p {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-2);
}

.info-box code {
  background: var(--surface-1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.import-detected {
  padding: var(--space-3);
  background: color-mix(in oklch, var(--success) 10%, var(--surface-2));
  border: 1px solid var(--success);
  border-radius: var(--radius-md);
}

.import-files {
  list-style: none;
  padding: 0;
  margin: var(--space-2) 0;
  font-family: monospace;
  font-size: var(--text-sm);
}

.import-files li {
  padding: 2px var(--space-2);
  background: var(--surface-1);
  border-radius: var(--radius-sm);
  margin-bottom: 2px;
  display: inline-block;
  margin-right: var(--space-1);
}

.import-files .more-files {
  font-style: italic;
  color: var(--text-2);
  background: transparent;
}

.import-note {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.import-note code {
  background: var(--surface-1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.warning-box {
  padding: var(--space-3) var(--space-4);
  background: color-mix(in oklch, var(--warning) 15%, var(--surface-2));
  border: 1px solid var(--warning);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-6);
}

.error-banner {
  padding: var(--space-3) var(--space-4);
  background: color-mix(in oklch, var(--danger) 15%, var(--surface-2));
  border: 1px solid var(--danger);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
  color: var(--danger);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
}

.form-actions .btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-success {
  background: var(--success);
}

.btn-success:hover {
  background: color-mix(in oklch, var(--success) 85%, var(--black));
}
</style>
