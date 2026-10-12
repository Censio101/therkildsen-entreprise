/** Meta click ID cookie (_fbc) — see Meta Pixel / CAPI docs for fbclid handling. */
const FBC_MAX_AGE_SEC = 90 * 24 * 60 * 60;

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Set _fbc when fbclid is present in the landing URL (format: fb.1.{timestamp}.{fbclid}). */
export function syncFbcCookieFromFbclid(fbclid: string | undefined) {
  if (typeof document === "undefined" || !fbclid?.trim()) return;

  const clickId = fbclid.trim();
  const existing = getCookie("_fbc");
  if (existing?.endsWith(`.${clickId}`)) return;

  const value = `fb.1.${Date.now()}.${clickId}`;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `_fbc=${encodeURIComponent(value)}; path=/; max-age=${FBC_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function getMetaClickCookies(): { fbc?: string; fbp?: string } {
  const fbc = getCookie("_fbc");
  const fbp = getCookie("_fbp");
  return {
    ...(fbc ? { fbc } : {}),
    ...(fbp ? { fbp } : {}),
  };
}
