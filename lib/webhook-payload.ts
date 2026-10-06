import type { LeadAttribution } from "./attribution";
import type { LeadFormData } from "./notify-owner";

/** Keys used in Make.com → Google Sheets mapping (do not rename without updating the scenario). */
export const MAKE_WEBHOOK_FIELD_NAMES = [
  "source",
  "submittedAt",
  "name",
  "phone",
  "email",
  "address",
  "city",
  "postcode",
  "customerType",
  "company",
  "service",
  "comment",
  "Platform",
  "Ads name",
  "Adset name",
  "Meta tracking ID",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbadid",
  "platform",
  "fbclid",
] as const;

function formatPhone(phone?: string) {
  const digits = (phone ?? "").replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export function buildLeadWebhookPayload(data: LeadFormData, attribution: LeadAttribution = {}) {
  const platform = attribution.platform;
  const adsName = attribution.utmContent;
  const adsetName = attribution.utmTerm;
  const metaTrackingId = attribution.fbadid;

  return {
    source: "therkildsen-entreprise",
    submittedAt: new Date().toISOString(),
    name: data.name,
    phone: formatPhone(data.phone),
    email: data.email,
    address: data.address,
    city: data.city,
    postcode: data.postcode,
    customerType: data.customerType,
    company: data.company || undefined,
    service: data.service,
    comment: data.comment || undefined,
    Platform: platform,
    "Ads name": adsName,
    "Adset name": adsetName,
    "Meta tracking ID": metaTrackingId,
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
    utm_term: attribution.utmTerm,
    utm_content: attribution.utmContent,
    fbadid: attribution.fbadid,
    platform,
    fbclid: attribution.fbclid,
  };
}
