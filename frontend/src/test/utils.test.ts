import { describe, it, expect } from 'vitest'
import { resolveMediaUrl } from '../utils/media'

describe('resolveMediaUrl', () => {
  it('returns null for null/undefined input', () => {
    expect(resolveMediaUrl(null)).toBeNull()
    expect(resolveMediaUrl(undefined)).toBeNull()
    expect(resolveMediaUrl('')).toBeNull()
  })

  it('passes through absolute URLs unchanged', () => {
    expect(resolveMediaUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg')
    expect(resolveMediaUrl('http://localhost:8000/img.jpg')).toBe('http://localhost:8000/img.jpg')
    expect(resolveMediaUrl('blob:http://localhost/abc')).toBe('blob:http://localhost/abc')
    expect(resolveMediaUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
  })

  it('prepends API base to relative paths', () => {
    const result = resolveMediaUrl('/uploads/file.jpg')
    expect(result).toMatch(/\/uploads\/file\.jpg$/)
    expect(result).toMatch(/^http/)
  })
})
