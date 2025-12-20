/**
 * Security Headers Middleware
 *
 * Adds security headers to all responses to protect against common web vulnerabilities.
 * Headers follow OWASP recommendations and modern security best practices.
 */

export default defineEventHandler((event) => {
  const headers = event.node.res

  // Prevent clickjacking attacks
  // DENY = page cannot be displayed in a frame
  headers.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  // Stops browsers from interpreting files as different MIME types
  headers.setHeader('X-Content-Type-Options', 'nosniff')

  // Control referrer information sent with requests
  // strict-origin-when-cross-origin: Send full URL for same-origin, only origin for cross-origin
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // HTTP Strict Transport Security (HSTS)
  // Only in production to avoid issues with local development
  if (process.env.NODE_ENV === 'production') {
    // max-age: 1 year, includeSubDomains, preload for HSTS preload list
    headers.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Content Security Policy (CSP)
  // Restricts sources for scripts, styles, images, etc.
  const cspDirectives = [
    // Default: only allow same-origin
    "default-src 'self'",

    // Scripts: self + inline (needed for Vue hydration) + eval (needed for Vue devtools in dev)
    process.env.NODE_ENV === 'production'
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

    // Styles: self + inline (needed for Vue scoped styles and dynamic styles) + Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

    // Images: self + data URIs + HTTPS sources (for external images)
    "img-src 'self' data: https:",

    // Fonts: self + Google Fonts
    "font-src 'self' https://fonts.gstatic.com",

    // Connect (XHR, WebSocket, etc.): self only
    "connect-src 'self'",

    // Media (audio/video): self + HTTPS
    "media-src 'self' https:",

    // Object/embed: none (no Flash, Java, etc.)
    "object-src 'none'",

    // Frame ancestors: none (clickjacking protection, same as X-Frame-Options)
    "frame-ancestors 'none'",

    // Base URI: self only (prevents base tag hijacking)
    "base-uri 'self'",

    // Form action: self only
    "form-action 'self'",

    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : [])
  ]

  headers.setHeader('Content-Security-Policy', cspDirectives.join('; '))

  // Permissions Policy (formerly Feature-Policy)
  // Restricts access to browser features
  const permissionsPolicies = [
    'camera=()',           // Disable camera
    'microphone=()',       // Disable microphone
    'geolocation=()',      // Disable geolocation
    'payment=()',          // Disable payment API
    'usb=()',              // Disable USB
    'magnetometer=()',     // Disable magnetometer
    'gyroscope=()',        // Disable gyroscope
    'accelerometer=()'     // Disable accelerometer
  ]

  headers.setHeader('Permissions-Policy', permissionsPolicies.join(', '))

  // Cross-Origin policies for additional isolation
  // Cross-Origin-Opener-Policy: Isolate browsing context
  headers.setHeader('Cross-Origin-Opener-Policy', 'same-origin')

  // Cross-Origin-Resource-Policy: Only allow same-origin access
  headers.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
})
