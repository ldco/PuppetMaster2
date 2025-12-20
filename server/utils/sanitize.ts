/**
 * HTML Sanitization Utility (HIGH-09)
 *
 * Server-side HTML sanitization to prevent XSS attacks.
 * Removes dangerous tags, event handlers, and javascript: URLs.
 *
 * Usage:
 * import { sanitizeHtml } from '../utils/sanitize'
 * const cleanContent = sanitizeHtml(userContent)
 *
 * Note: For production with rich content, consider using:
 * - sanitize-html (npm install sanitize-html)
 * - isomorphic-dompurify (npm install isomorphic-dompurify jsdom)
 */

// Tags that should be completely removed (including content)
const DANGEROUS_TAGS = [
  'script',
  'style',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'meta',
  'link',
  'base',
  'noscript',
  'template'
]

// Tags that are safe for rich text content
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
  'figure', 'figcaption',
  'sup', 'sub',
  'mark', 'small'
]

// Attributes that are safe
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  '*': ['class', 'id', 'title'],
  'a': ['href', 'target', 'rel'],
  'img': ['src', 'alt', 'width', 'height', 'loading'],
  'td': ['colspan', 'rowspan'],
  'th': ['colspan', 'rowspan', 'scope']
}

// Event handler pattern (on*)
const EVENT_HANDLER_REGEX = /\s+on\w+\s*=/gi

// JavaScript/data URL pattern
const DANGEROUS_URL_REGEX = /^\s*(javascript|data|vbscript):/i

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''

  let result = html

  // 1. Remove dangerous tags with their content
  for (const tag of DANGEROUS_TAGS) {
    // Remove opening and closing tags with content between them
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')
    result = result.replace(regex, '')
    // Remove self-closing versions
    const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, 'gi')
    result = result.replace(selfClosing, '')
  }

  // 2. Remove event handlers from all tags
  result = result.replace(EVENT_HANDLER_REGEX, ' ')

  // 3. Sanitize href and src attributes
  result = result.replace(
    /(href|src)\s*=\s*["']([^"']*)["']/gi,
    (match, attr, url) => {
      if (DANGEROUS_URL_REGEX.test(url)) {
        return `${attr}="#"` // Replace with safe URL
      }
      return match
    }
  )

  // 4. Remove expression() in style attributes (IE CSS expression attack)
  result = result.replace(
    /style\s*=\s*["'][^"']*expression\s*\([^"']*["']/gi,
    'style=""'
  )

  // 5. Remove data-* attributes that could contain encoded scripts
  result = result.replace(/\s+data-[a-z-]+\s*=\s*["'][^"']*["']/gi, '')

  // 6. Remove any remaining disallowed tags (but keep content)
  const allTags = result.match(/<\/?([a-z][a-z0-9]*)[^>]*>/gi) || []
  for (const tagMatch of allTags) {
    const tagName = tagMatch.match(/<\/?([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase()
    if (tagName && !ALLOWED_TAGS.includes(tagName)) {
      // Remove the tag but keep content
      result = result.replace(tagMatch, '')
    }
  }

  // 7. Clean up extra whitespace from removals
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n')

  return result.trim()
}

/**
 * Sanitize plain text (escapes HTML entities)
 * Use this for user-provided text that should NOT contain HTML
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Check if a string contains potentially dangerous HTML
 * Returns true if content should be sanitized
 */
export function containsUnsafeHtml(html: string): boolean {
  if (!html) return false

  // Check for dangerous tags
  for (const tag of DANGEROUS_TAGS) {
    if (new RegExp(`<${tag}[\\s>]`, 'i').test(html)) {
      return true
    }
  }

  // Check for event handlers
  if (EVENT_HANDLER_REGEX.test(html)) {
    return true
  }

  // Check for dangerous URLs
  if (DANGEROUS_URL_REGEX.test(html)) {
    return true
  }

  return false
}
