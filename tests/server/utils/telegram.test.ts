import { describe, it, expect } from 'vitest'
import { escapeHtml } from '../../../server/utils/telegram'

describe('escapeHtml', () => {
  it('should escape ampersand', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less than', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b')
  })

  it('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b')
  })

  it('should escape all HTML special characters together', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;')
  })

  it('should handle multiple occurrences', () => {
    expect(escapeHtml('a & b & c < d > e')).toBe('a &amp; b &amp; c &lt; d &gt; e')
  })

  it('should return empty string for empty input', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should not modify text without special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })

  it('should handle unicode characters', () => {
    expect(escapeHtml('Привет <мир> & 世界')).toBe('Привет &lt;мир&gt; &amp; 世界')
  })

  it('should preserve newlines', () => {
    expect(escapeHtml('Line 1\nLine 2')).toBe('Line 1\nLine 2')
  })

  it('should handle HTML-like injection attempts', () => {
    expect(escapeHtml('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;')
    expect(escapeHtml('<a href="http://evil.com">Click</a>')).toBe('&lt;a href="http://evil.com"&gt;Click&lt;/a&gt;')
  })
})

