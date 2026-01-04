/**
 * useAdaptiveNav
 *
 * Detects when navigation items overflow their container
 * and signals when to collapse to hamburger menu.
 *
 * Uses ResizeObserver to detect size changes and checks
 * if nav content exceeds available space.
 */
export function useAdaptiveNav() {
  const headerRef = ref<HTMLElement | null>(null)
  const navRef = ref<HTMLElement | null>(null)
  const isCollapsed = ref(false)

  // Track if we're on client
  const isClient = import.meta.client

  function checkOverflow() {
    if (!isClient || !headerRef.value || !navRef.value) return

    const header = headerRef.value
    const nav = navRef.value

    // Get header inner container
    const headerInner = header.querySelector('.header-inner') as HTMLElement
    if (!headerInner) return

    // Calculate available space for nav
    // Header inner width - logo width - actions width - gaps
    const headerWidth = headerInner.clientWidth
    const logo = headerInner.querySelector('.header-logo') as HTMLElement
    const actions = headerInner.querySelector('.header-actions') as HTMLElement

    const logoWidth = logo?.offsetWidth || 0
    const actionsWidth = actions?.offsetWidth || 0

    // Account for gaps (approximately 2 gaps of 24px each)
    const gaps = 48

    // Available space for nav
    const availableWidth = headerWidth - logoWidth - actionsWidth - gaps

    // Nav scroll width = actual content width
    const navWidth = nav.scrollWidth

    // Collapse if nav doesn't fit
    isCollapsed.value = navWidth > availableWidth
  }

  // Set up ResizeObserver
  onMounted(() => {
    if (!isClient) return

    // Initial check after DOM settles
    nextTick(() => {
      checkOverflow()
    })

    // Watch for resize
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow()
    })

    if (headerRef.value) {
      resizeObserver.observe(headerRef.value)
    }

    // Also check on window resize (for font loading, etc.)
    window.addEventListener('resize', checkOverflow)

    // Cleanup
    onUnmounted(() => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', checkOverflow)
    })
  })

  return {
    headerRef,
    navRef,
    isCollapsed
  }
}
