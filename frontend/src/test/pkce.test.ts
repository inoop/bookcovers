import { describe, it, expect } from 'vitest'
import { generateCodeVerifier, generateCodeChallenge } from '../auth/pkce'

const BASE64URL_RE = /^[A-Za-z0-9\-_]+$/

describe('generateCodeVerifier', () => {
  it('returns a base64url-safe string (no +, /, or =)', () => {
    const verifier = generateCodeVerifier()
    expect(verifier).toMatch(BASE64URL_RE)
  })

  it('returns 43 characters for 32 random bytes', () => {
    // 32 bytes → 43 base64url chars (ceil(32 * 4/3), no padding)
    const verifier = generateCodeVerifier()
    expect(verifier.length).toBe(43)
  })

  it('generates a different value on each call', () => {
    const a = generateCodeVerifier()
    const b = generateCodeVerifier()
    expect(a).not.toBe(b)
  })
})

describe('generateCodeChallenge', () => {
  it('returns a base64url-safe string', async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    expect(challenge).toMatch(BASE64URL_RE)
  })

  it('is deterministic for the same verifier', async () => {
    const verifier = generateCodeVerifier()
    const c1 = await generateCodeChallenge(verifier)
    const c2 = await generateCodeChallenge(verifier)
    expect(c1).toBe(c2)
  })

  it('produces a different challenge for different verifiers', async () => {
    const c1 = await generateCodeChallenge('verifier-one')
    const c2 = await generateCodeChallenge('verifier-two')
    expect(c1).not.toBe(c2)
  })

  it('matches expected SHA-256 output for a known input', async () => {
    // PKCE test vector: verifier → SHA-256 → base64url
    // Verified independently: echo -n "abc" | openssl dgst -sha256 -binary | base64 | tr '+/' '-_' | tr -d '='
    const challenge = await generateCodeChallenge('abc')
    expect(challenge).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0')
  })
})
