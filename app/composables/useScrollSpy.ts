/**
 * useScrollSpy - Active Section Detection for Onepager Navigation
 * 
 * Uses IntersectionObserver to detect which section is currently in view.
 * Provides the active section ID for nav link highlighting.
 * 
 * @example
 * ```vue
 * <script setup>
 * const { activeSection } = useScrollSpy(['home', 'about', 'portfolio', 'services', 'contact'])
 * </script>
 * 
 * <template>
 *   <a :class="{ active: activeSection === 'about' }" href="#about">About</a>
 * </template>
 * ```
 */

interface ScrollSpyOptions {
  /** Root margin for intersection (default: "-20% 0px -70% 0px" - triggers when section is in top 30% of viewport) */
  rootMargin?: string
  /** Threshold for intersection (default: 0) */
  threshold?: number | number[]
  /** Default section when at top of page (default: first section) */
  defaultSection?: string
}

interface ScrollSpyReturn {
  /** The currently active section ID */
  activeSection: Ref<string>
  /** Manually set active section (e.g., when clicking a nav link) */
  setActiveSection: (id: string) => void
}

export function useScrollSpy(
  sectionIds: string[],
  options: ScrollSpyOptions = {}
): ScrollSpyReturn {
  const {
    rootMargin = '-20% 0px -70% 0px',
    threshold = 0,
    defaultSection = sectionIds[0] || ''
  } = options

  const activeSection = ref(defaultSection)
  let observer: IntersectionObserver | null = null

  function setActiveSection(id: string) {
    activeSection.value = id
  }

  onMounted(() => {
    if (!import.meta.client) return

    // Create observer
    observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is intersecting
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeSection.value = entry.target.id
            break
          }
        }
      },
      { rootMargin, threshold }
    )

    // Observe all sections
    for (const id of sectionIds) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    // Set initial active section based on scroll position
    // If at top, use first section
    if (window.scrollY < 100) {
      activeSection.value = defaultSection
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    activeSection,
    setActiveSection
  }
}

