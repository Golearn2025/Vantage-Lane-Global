const INVITE_STORAGE_KEY = "vl_network_invite_token";

export function persistInviteToken(token: string | null | undefined) {
  if (typeof window === "undefined") return;
  const t = token?.trim();
  if (!t || t.length < 16) return;
  window.localStorage.setItem(INVITE_STORAGE_KEY, t);
}

export function readInviteToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(INVITE_STORAGE_KEY);
}

export function clearInviteToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(INVITE_STORAGE_KEY);
}
