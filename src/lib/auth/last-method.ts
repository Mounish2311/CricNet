// Per-device convenience only: remembers how the user last authenticated so the
// login screen can highlight that option. NOT a security control — anyone can
// clear it, and it never gates access.

export type AuthMethod = 'google' | 'email';

const KEY = 'cricnet:last-auth-method';

export function setLastMethod(method: AuthMethod) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, method);
  } catch {
    // private mode / storage disabled — the hint is optional, so swallow it
  }
}

export function getLastMethod(): AuthMethod | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'google' || v === 'email' ? v : null;
  } catch {
    return null;
  }
}
