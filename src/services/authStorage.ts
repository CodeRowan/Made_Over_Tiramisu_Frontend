/**
 * Auth Storage Service
 *
 * Centralised place for the admin JWT + user profile. Uses sessionStorage
 * instead of localStorage:
 *
 *   - The token survives page refreshes, so an admin stays logged in while
 *     working (same as localStorage)
 *   - It is wiped as soon as the tab/window closes, so a stolen token can't
 *     be replayed from a fresh browser session later, and nothing lingers on
 *     a shared computer
 *
 * Storing any token in browser storage is inherently readable by JavaScript
 * (XSS), so this is a mitigation, not a silver bullet — the bulletproof
 * option is an httpOnly cookie set by the backend.
 *
 * All access is wrapped in try/catch so the app keeps working even when
 * storage is blocked (private mode, strict browser policies).
 */

const TOKEN_KEY = 'adminToken';
const USER_KEY = 'adminUser';

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage unavailable — the in-memory session still works this page load.
  }
}

function safeRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore — nothing to clean up.
  }
}

export const authStorage = {
  getToken: (): string | null => safeGet(TOKEN_KEY),

  setToken: (token: string) => safeSet(TOKEN_KEY, token),

  /** Parses the stored admin user profile; returns null if absent or corrupt. */
  getUser: <T = Record<string, unknown>>(): T | null => {
    const raw = safeGet(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Corrupt value — drop it so it can't linger or crash anything later.
      safeRemove(USER_KEY);
      return null;
    }
  },

  setUser: (user: unknown) => safeSet(USER_KEY, JSON.stringify(user)),

  clear: () => {
    safeRemove(TOKEN_KEY);
    safeRemove(USER_KEY);
  },
};

export default authStorage;
