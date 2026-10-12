import { syncFbcCookieFromFbclid } from "./meta-cookies";

export type LeadAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbadid?: string;
  platform?: string;
  fbclid?: string;
};

const STORAGE_KEY = "therkildsen_lead_attribution_v2";
const LEGACY_SESSION_KEY = "therkildsen_lead_attribution";
/** Keep attribution ~90 days (typical ad attribution window). */
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

type StoredEnvelope = {
  savedAt: number;
  data: LeadAttribution;
};

const ATTRIBUTION_KEYS: (keyof LeadAttribution)[] = [
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
  "fbadid",
  "platform",
  "fbclid",
];

function pickParam(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value || undefined;
}

/** Read Meta / UTM params from a query string (e.g. window.location.search). */
export function readAttributionFromSearch(search: string): LeadAttribution {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return {
    utmSource: pickParam(params, "utm_source"),
    utmMedium: pickParam(params, "utm_medium"),
    utmCampaign: pickParam(params, "utm_campaign"),
    utmTerm: pickParam(params, "utm_term"),
    utmContent: pickParam(params, "utm_content"),
    fbadid: pickParam(params, "fbadid"),
    platform: pickParam(params, "platform"),
    fbclid: pickParam(params, "fbclid"),
  };
}

function hasAnyAttribution(data: LeadAttribution): boolean {
  return ATTRIBUTION_KEYS.some((key) => Boolean(data[key]));
}

/** First-touch for UTMs (fill missing fields); always refresh fbclid on a new Meta click. */
function mergeAttribution(stored: LeadAttribution, fromUrl: LeadAttribution): LeadAttribution {
  const merged: LeadAttribution = { ...stored };

  for (const key of ATTRIBUTION_KEYS) {
    const urlValue = fromUrl[key];
    if (!urlValue) continue;

    if (key === "fbclid") {
      merged.fbclid = urlValue;
      continue;
    }

    if (!merged[key]) merged[key] = urlValue;
  }

  return merged;
}

function readEnvelope(): StoredEnvelope | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacyStorage();
    const parsed = JSON.parse(raw) as StoredEnvelope;
    if (!parsed?.savedAt || !parsed.data) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function migrateLegacyStorage(): StoredEnvelope | null {
  if (typeof window === "undefined") return null;

  try {
    const fromSession = sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (fromSession) {
      const data = JSON.parse(fromSession) as LeadAttribution;
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
      if (hasAnyAttribution(data)) {
        writeEnvelope(data);
        return { savedAt: Date.now(), data };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeEnvelope(data: LeadAttribution) {
  if (typeof window === "undefined" || !hasAnyAttribution(data)) return;
  const envelope: StoredEnvelope = { savedAt: Date.now(), data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

/** Infer Platform / fill common gaps before webhook or pixel. */
export function enrichAttribution(data: LeadAttribution = {}): LeadAttribution {
  const out: LeadAttribution = { ...data };
  const source = out.utmSource?.toLowerCase() ?? "";

  if (!out.platform) {
    if (out.fbclid) out.platform = "Meta";
    else if (source.includes("facebook") || source.includes("instagram") || source.includes("meta")) {
      out.platform = "Meta";
    }
  }

  return out;
}

/**
 * Persist attribution from the landing URL (localStorage + Meta _fbc cookie).
 * Call on load and again right before submit.
 */
export function captureAttributionFromWindow(): LeadAttribution {
  if (typeof window === "undefined") return {};

  const fromUrl = readAttributionFromSearch(window.location.search);
  const stored = readEnvelope()?.data ?? {};
  const merged = hasAnyAttribution(fromUrl) ? mergeAttribution(stored, fromUrl) : stored;
  const enriched = enrichAttribution(merged);

  if (fromUrl.fbclid) syncFbcCookieFromFbclid(fromUrl.fbclid);
  else if (enriched.fbclid) syncFbcCookieFromFbclid(enriched.fbclid);

  if (hasAnyAttribution(enriched)) writeEnvelope(enriched);

  return enriched;
}

export function getStoredAttribution(): LeadAttribution {
  const captured = captureAttributionFromWindow();
  if (hasAnyAttribution(captured)) return captured;

  const stored = readEnvelope()?.data ?? {};
  return enrichAttribution(stored);
}
