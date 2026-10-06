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

const STORAGE_KEY = "therkildsen_lead_attribution";

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
  return Object.values(data).some(Boolean);
}

/** Persist first-touch attribution from the landing URL for the session. */
export function captureAttributionFromWindow(): LeadAttribution {
  if (typeof window === "undefined") return {};

  const fromUrl = readAttributionFromSearch(window.location.search);
  if (hasAnyAttribution(fromUrl)) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as LeadAttribution;
  } catch {
    /* ignore */
  }
  return {};
}

export function getStoredAttribution(): LeadAttribution {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as LeadAttribution;
  } catch {
    /* ignore */
  }
  return {};
}
