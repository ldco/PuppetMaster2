/**
 * useConfig - Access build-time configuration
 *
 * Provides reactive access to puppet-master.config.ts settings.
 * Use this composable in components to access configuration.
 *
 * @example
 * ```vue
 * <script setup>
 * const { hasWebsite, hasAdmin, hasLoginButton } = useConfig()
 * </script>
 *
 * <template>
 *   <LoginButton v-if="hasLoginButton" />
 * </template>
 * ```
 */
import config from '~/puppet-master.config'
import type { AppMode } from '~/puppet-master.config'

export function useConfig() {
  return {
    // ═══════════════════════════════════════════════════════════════════════
    // MODE - Primary app structure
    // ═══════════════════════════════════════════════════════════════════════
    mode: config.mode as AppMode,

    // Mode-derived booleans (for conditional rendering)
    hasWebsite: config.hasWebsite, // Has public website (all except app-only)
    hasAdmin: config.hasAdmin, // Has admin panel (all except website-only)
    hasLoginButton: config.hasLoginButton, // Show login button in header (website-app only)
    isAppPrimary: config.isAppPrimary, // Admin is the main app (app-only, website-app)
    isWebsitePrimary: config.isWebsitePrimary, // Website is the main app (website-admin, website-only)

    // ═══════════════════════════════════════════════════════════════════════
    // FEATURES - Fine-tuned behavior toggles
    // ═══════════════════════════════════════════════════════════════════════
    features: config.features,

    // Website features
    isMultiLang: config.isMultiLang,
    hasThemeToggle: config.hasThemeToggle,
    isOnepager: config.useOnepager, // Combined: hasWebsite && onepager
    hasInteractiveHeader: config.useInteractiveHeader, // Combined: hasWebsite && interactiveHeader
    hideHeaderOnScroll: config.features.hideHeaderOnScroll,

    // Admin features
    appVerticalNav: config.features.appVerticalNav,

    // ═══════════════════════════════════════════════════════════════════════
    // DATA - Locales, colors, sections, logo
    // ═══════════════════════════════════════════════════════════════════════
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    sections: config.sections,
    colors: config.colors,
    logo: config.logo,

    // Full config access (for advanced use cases)
    config
  }
}
