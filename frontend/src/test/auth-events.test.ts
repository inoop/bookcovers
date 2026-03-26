import { describe, it, expect, vi } from 'vitest'
import { emitSessionExpired, onSessionExpired } from '../auth/authEvents'

describe('authEvents', () => {
  it('calls a registered handler when session expires', () => {
    const handler = vi.fn()
    const unsubscribe = onSessionExpired(handler)

    emitSessionExpired()

    expect(handler).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('calls all registered handlers', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    const u1 = onSessionExpired(h1)
    const u2 = onSessionExpired(h2)

    emitSessionExpired()

    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledTimes(1)
    u1()
    u2()
  })

  it('stops calling handler after unsubscribe', () => {
    const handler = vi.fn()
    const unsubscribe = onSessionExpired(handler)

    unsubscribe()
    emitSessionExpired()

    expect(handler).not.toHaveBeenCalled()
  })

  it('calls handler multiple times for multiple emits', () => {
    const handler = vi.fn()
    const unsubscribe = onSessionExpired(handler)

    emitSessionExpired()
    emitSessionExpired()
    emitSessionExpired()

    expect(handler).toHaveBeenCalledTimes(3)
    unsubscribe()
  })
})
