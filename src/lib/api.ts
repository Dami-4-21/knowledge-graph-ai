// ---------------------------------------------------------------
// Phase 0 API client: secret-link access token + server state sync
// ---------------------------------------------------------------
// All /api calls go through apiFetch, which attaches the access token
// (if any) as the `x-access-token` header. The token is captured once
// from a `?key=...` link and remembered in localStorage per device.
// ---------------------------------------------------------------

const TOKEN_KEY = 'kg_access_token';

/** Capture a `?key=...` from the URL into localStorage, then strip it. */
export function captureTokenFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    const key = url.searchParams.get('key');
    if (key) {
      localStorage.setItem(TOKEN_KEY, key);
      url.searchParams.delete('key');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  } catch {
    /* ignore */
  }
}

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export interface ApiError extends Error {
  status?: number;
}

/** Build an <img>-usable src for a /api/uploads/... path, attaching the access token. */
export function imageSrc(url: string): string {
  if (!url) return '';
  const token = getToken();
  if (!token) return url;
  return url + (url.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(token);
}

/** fetch() wrapper that injects the access-token header on every /api call. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('x-access-token', token);
  return fetch(path, { ...init, headers });
}

/** Load the persisted hub state from the server. Throws ApiError(401) when locked. */
export async function getState(): Promise<any> {
  const res = await apiFetch('/api/state');
  if (res.status === 401) {
    const e = new Error('unauthorized') as ApiError;
    e.status = 401;
    throw e;
  }
  if (!res.ok) throw new Error('Failed to load state');
  return res.json();
}

/** Persist the hub state to the server (full-document replace). */
export async function putState(state: any): Promise<void> {
  const res = await apiFetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error('Failed to save state');
}
