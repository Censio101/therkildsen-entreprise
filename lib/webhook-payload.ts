import { enrichAttribution, type LeadAttribution } from "./attribution";
import type { LeadFormData } from "./notify-owner";
import { formatPhoneDisplay } from "./phone";

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
  "squareMeters",
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
  "fbclid",
] as const;

export function buildLeadWebhookPayload(data: LeadFormData, attribution: LeadAttribution = {}) {
  const a = enrichAttribution(attribution);
  const platform = a.platform;
  const adsName = a.utmContent;
  const adsetName = a.utmTerm;
  const metaTrackingId = a.fbadid;

  return {
    source: "therkildsen-entreprise",
    submittedAt: new Date().toISOString(),
    name: data.name,
    phone: formatPhoneDisplay(data.phone),
    email: data.email,
    address: data.address,
    city: data.city,
    postcode: data.postcode,
    customerType: data.customerType,
    company: data.company || undefined,
    service: data.service,
    squareMeters: data.roofArea || undefined,
    Platform: platform,
    "Ads name": adsName,
    "Adset name": adsetName,
    "Meta tracking ID": metaTrackingId,
    utm_source: a.utmSource,
    utm_medium: a.utmMedium,
    utm_campaign: a.utmCampaign,
    utm_term: a.utmTerm,
    utm_content: a.utmContent,
    fbadid: a.fbadid,
    fbclid: a.fbclid,
  };
}
