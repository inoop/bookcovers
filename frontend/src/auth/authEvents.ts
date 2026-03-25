const bus = new EventTarget();

export function emitSessionExpired(): void {
  bus.dispatchEvent(new Event('session-expired'));
}

export function onSessionExpired(handler: () => void): () => void {
  bus.addEventListener('session-expired', handler);
  return () => bus.removeEventListener('session-expired', handler);
}
