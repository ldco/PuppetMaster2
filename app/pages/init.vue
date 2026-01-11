<script setup lang="ts">
/**
 * Build Configuration Wizard
 *
 * Configures project settings for BUILD mode.
 * User reaches this page after running `npm run init` and selecting BUILD.
 */
import IconWorld from '~icons/tabler/world'
import IconApps from '~icons/tabler/apps'
import IconCheck from '~icons/tabler/check'
import IconLoader from '~icons/tabler/loader-2'
import IconUpload from '~icons/tabler/upload'
import IconFileZip from '~icons/tabler/file-zip'
import IconX from '~icons/tabler/x'

definePageMeta({
  layout: 'blank'
})

useHead({
  title: 'Configure Project | Puppet Master'
})

// Phase state - complete-greenfield for new projects, complete-brownfield for imports
const phase = ref<'configure' | 'complete-greenfield' | 'complete-brownfield'>('configure')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const validationErrors = ref<string[]>([])

// Configuration
const config = reactive({
  projectType: 'website' as 'website' | 'app',
  adminEnabled: true,
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

// Import zip upload
const importZipFile = ref<File | null>(null)
const uploadingZip = ref(false)
const importFolderFiles = ref<string[]>([])
const hasBrownfieldContent = ref(false)

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

    // Load existing config values if available
    if (data.pmMode !== 'unconfigured') {
      config.projectType = data.projectType || 'website'
      config.adminEnabled = data.adminEnabled
      config.modules = data.enabledModules || ['contact']
      config.features = data.features || config.features
      config.locales = data.locales || config.locales
      config.defaultLocale = data.defaultLocale || 'en'
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

// Zip file upload handler
async function handleZipUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.name.endsWith('.zip')) {
    error.value = 'Please upload a .zip file'
    return
  }

  uploadingZip.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await $fetch('/api/setup/import-zip', {
      method: 'POST',
      body: formData
    }) as { files: string[] }

    importZipFile.value = file
    importFolderFiles.value = result.files
    hasBrownfieldContent.value = result.files.length > 0
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to upload zip file'
    importZipFile.value = null
  } finally {
    uploadingZip.value = false
  }
}

// Remove uploaded zip
async function removeImportZip() {
  try {
    await $fetch('/api/setup/import-zip', { method: 'DELETE' })
    importZipFile.value = null
    importFolderFiles.value = []
    hasBrownfieldContent.value = false
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to remove import files'
  }
}

// Validation
function validate(): boolean {
  validationErrors.value = []

  if (config.locales.length === 0) {
    validationErrors.value.push('At least one language is required')
  }

  return validationErrors.value.length === 0
}

// Apply configuration
async function applyConfig() {
  if (!validate()) {
    return
  }

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

    // Always show completion screen - developer needs to start coding
    saving.value = false
    if (hasBrownfieldContent.value) {
      phase.value = 'complete-brownfield'
    } else {
      phase.value = 'complete-greenfield'
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
      <div class="setup-label">Configure Project</div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="setup-loading">
      <IconLoader class="spinner" />
      <p>Loading configuration...</p>
    </div>

    <!-- Configuration Form -->
    <main v-else-if="phase === 'configure'" class="setup-content setup-form">
      <!-- Error Banner -->
      <div v-if="error" class="error-banner">
        {{ error }}
      </div>

      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="error-banner">
        <ul class="validation-errors">
          <li v-for="err in validationErrors" :key="err">{{ err }}</li>
        </ul>
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

      <!-- Import Existing Code (Optional) -->
      <section class="setup-section">
        <h2 class="section-title">Import Existing Code <span class="optional-badge">Optional</span></h2>
        <p class="section-desc">Have an existing project to migrate? Upload a zip file.</p>

        <div v-if="!importZipFile" class="upload-zone">
          <input
            type="file"
            accept=".zip"
            id="zip-upload"
            class="upload-input"
            :disabled="uploadingZip"
            @change="handleZipUpload"
          />
          <label for="zip-upload" class="upload-label">
            <IconUpload v-if="!uploadingZip" class="upload-icon" />
            <IconLoader v-else class="upload-icon spinner" />
            <span>{{ uploadingZip ? 'Uploading...' : 'Drop zip file or click to upload' }}</span>
            <span class="upload-hint">Your existing code will be analyzed after setup</span>
          </label>
        </div>

        <div v-else class="import-detected">
          <div class="import-header">
            <IconFileZip class="zip-icon" />
            <div class="import-info">
              <strong>{{ importZipFile.name }}</strong>
              <span>{{ importFolderFiles.length }} files extracted</span>
            </div>
            <button class="btn-icon" @click="removeImportZip" title="Remove">
              <IconX />
            </button>
          </div>
          <ul v-if="importFolderFiles.length > 0" class="import-files">
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
        <h2 class="section-title">Languages <span class="required-badge">Required</span></h2>
        <p class="section-desc">Select at least one language</p>

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
      <div class="form-actions form-actions-end">
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

    <!-- Complete Phase: Greenfield (new project) -->
    <main v-else-if="phase === 'complete-greenfield'" class="setup-content">
      <div class="complete-phase">
        <div class="complete-icon">
          <IconCheck />
        </div>
        <h1 class="complete-title">Ready to Code</h1>
        <p class="complete-desc">
          Your project is configured. Dev server is running.<br />
          Start building your {{ config.projectType }} from scratch.
        </p>

        <div class="complete-info">
          <div class="info-item">
            <strong>Dev Server</strong>
            <a href="http://localhost:3000" target="_blank" class="dev-link">http://localhost:3000</a>
          </div>
          <div class="info-item">
            <strong>Configuration</strong>
            <code>app/puppet-master.config.ts</code>
          </div>
        </div>

        <div class="complete-dirs">
          <strong>Key Directories</strong>
          <div class="dir-grid">
            <div class="dir-item">
              <code>app/pages/</code>
              <span>Route pages</span>
            </div>
            <div class="dir-item">
              <code>app/components/</code>
              <span>Vue components</span>
            </div>
            <div class="dir-item">
              <code>server/api/</code>
              <span>API endpoints</span>
            </div>
            <div class="dir-item">
              <code>app/assets/css/</code>
              <span>Styles</span>
            </div>
          </div>
        </div>

        <div v-if="config.adminEnabled" class="complete-hint">
          Admin panel available at <a href="/admin">/admin</a>
        </div>
      </div>
    </main>

    <!-- Complete Phase: Brownfield (imported code) -->
    <main v-else-if="phase === 'complete-brownfield'" class="setup-content">
      <div class="complete-phase">
        <div class="complete-icon">
          <IconCheck />
        </div>
        <h1 class="complete-title">Configuration Complete</h1>
        <p class="complete-desc">
          Your project is configured. Since you uploaded existing code,
          the next step is to migrate it to Puppet Master.
        </p>

        <div class="complete-steps">
          <div class="step">
            <span class="step-num">1</span>
            <div class="step-content">
              <strong>With Claude Code (Recommended)</strong>
              <p>Run AI-powered migration analysis:</p>
              <code>/pm-migrate</code>
              <p class="step-note">Claude analyzes your code and creates a migration plan, mapping each piece to PM equivalents.</p>
            </div>
          </div>
          <div class="step step-alt">
            <span class="step-num">or</span>
            <div class="step-content">
              <strong>Without Claude Code</strong>
              <p>Your files are in <code>./import/</code></p>
              <p class="step-note">Reference them manually as you build your PM project. Check package.json for dependencies, browse components and pages for logic to port.</p>
            </div>
          </div>
        </div>

        <div class="complete-files">
          <strong>Uploaded files:</strong>
          <div class="file-count">{{ importFolderFiles.length }} files in ./import/</div>
        </div>

        <div class="complete-info">
          <div class="info-item">
            <strong>Dev Server</strong>
            <a href="http://localhost:3000" target="_blank" class="dev-link">http://localhost:3000</a>
          </div>
        </div>
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

.form-actions-end {
  justify-content: flex-end;
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

/* Required/Optional Badges */
.required-badge,
.optional-badge {
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  margin-left: var(--space-2);
  vertical-align: middle;
}

.required-badge {
  background: color-mix(in oklch, var(--danger) 15%, var(--surface-2));
  color: var(--danger);
}

.optional-badge {
  background: var(--surface-3);
  color: var(--text-2);
}

/* Upload Zone */
.upload-zone {
  position: relative;
}

.upload-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-label:hover {
  border-color: var(--brand);
  background: var(--surface-3);
}

.upload-icon {
  width: 32px;
  height: 32px;
  color: var(--text-2);
}

.upload-hint {
  font-size: var(--text-xs);
  color: var(--text-3);
}

/* Import Header */
.import-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.zip-icon {
  width: 32px;
  height: 32px;
  color: var(--brand);
  flex-shrink: 0;
}

.import-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.import-info span {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.btn-icon {
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.btn-icon:hover {
  background: var(--surface-3);
  color: var(--danger);
}

/* Validation Errors */
.validation-errors {
  list-style: none;
  padding: 0;
  margin: 0;
}

.validation-errors li {
  padding: 2px 0;
}

/* Completion Phase */
.complete-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  max-width: 600px;
  margin: 0 auto;
}

.complete-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--success);
  border-radius: 50%;
  margin-bottom: var(--space-6);
}

.complete-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.complete-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.complete-desc {
  color: var(--text-2);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.complete-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  text-align: left;
  width: 100%;
  margin-bottom: var(--space-8);
}

.step {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-2);
  border-radius: var(--radius-lg);
}

.step-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.step-alt {
  border-style: dashed;
  border-color: var(--border);
  background: transparent;
}

.step-alt .step-num {
  background: var(--surface-3);
  color: var(--text-2);
  font-size: var(--text-xs);
}

.step-content {
  flex: 1;
}

.step-content strong {
  display: block;
  margin-bottom: var(--space-2);
}

.step-content p {
  color: var(--text-2);
  margin: 0;
  font-size: var(--text-sm);
}

.step-content code {
  display: inline-block;
  background: var(--surface-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  margin: var(--space-2) 0;
}

.step-note {
  margin-top: var(--space-2) !important;
  font-size: var(--text-xs) !important;
  color: var(--text-3) !important;
}

.complete-files {
  padding: var(--space-4);
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  width: 100%;
  margin-bottom: var(--space-6);
}

.file-count {
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-2);
}

.complete-actions {
  padding-top: var(--space-4);
}

/* Greenfield Completion */
.complete-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  margin-bottom: var(--space-6);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-2);
  border-radius: var(--radius-md);
}

.info-item strong {
  color: var(--text-2);
  font-size: var(--text-sm);
}

.info-item code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--surface-3);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.dev-link {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--brand);
  text-decoration: none;
}

.dev-link:hover {
  text-decoration: underline;
}

.complete-dirs {
  width: 100%;
  padding: var(--space-4);
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}

.complete-dirs > strong {
  display: block;
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-2);
}

.dir-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.dir-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dir-item code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--brand);
}

.dir-item span {
  font-size: var(--text-xs);
  color: var(--text-3);
}

.complete-hint {
  font-size: var(--text-sm);
  color: var(--text-2);
}

.complete-hint a {
  color: var(--brand);
  text-decoration: none;
}

.complete-hint a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .dir-grid {
    grid-template-columns: 1fr;
  }
}
</style>
