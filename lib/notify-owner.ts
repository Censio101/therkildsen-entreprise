import { formatPhoneDisplay } from "./phone";

export type LeadFormData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  customerType: string;
  company: string;
  service: string;
  roofArea: string;
};

const MAILGUN_FROM = "kontakt@censio.dk";
const MAILGUN_DOMAIN = "censio.dk";
const MAILGUN_API_BASE = "https://api.eu.mailgun.net";
const DEFAULT_TO = "kontakt@therkildsen-ent.dk";

const EMAIL_INTRO = "Du har modtaget et nyt marketing lead:";
const EMAIL_OUTRO = "Mvh\nCensio lead system";

function fieldLine(label: string, value?: string) {
  return `${label}: ${value ?? ""}`;
}

function formatAdresse(adresse?: string, postnummer?: string, by?: string) {
  const parts = [adresse, postnummer, by].filter(Boolean);
  return parts.length ? parts.join(", ") : "";
}

function formatKundetype(customerType?: string, company?: string) {
  if (!customerType) return "";
  if (customerType === "Erhverv" && company) return `${customerType} (${company})`;
  return customerType;
}

export function buildLeadFieldBlock(data: LeadFormData) {
  return [
    fieldLine("Navn", data.name),
    fieldLine("Telefon", formatPhoneDisplay(data.phone)),
    fieldLine("Email", data.email),
    fieldLine("Adresse", formatAdresse(data.address, data.postcode, data.city)),
    fieldLine("Kundetype", formatKundetype(data.customerType, data.company)),
    fieldLine("Service", data.service),
    fieldLine("Kvadratmeter", data.roofArea ? `${data.roofArea} m²` : ""),
  ].join("\n");
}

function wrapOwnerEmailBody(body: string) {
  return `${EMAIL_INTRO}\n\n${body}\n\n${EMAIL_OUTRO}`;
}

function formatReplyTo(email?: string, name?: string): string | undefined {
  const trimmed = email?.trim();
  if (!trimmed || !trimmed.includes("@")) return undefined;
  const displayName = name?.trim();
  if (displayName && displayName.length >= 2) return `${displayName} <${trimmed}>`;
  return trimmed;
}

export function buildOwnerNotification(data: LeadFormData) {
  return {
    title: `Nyt entreprise-lead: ${data.name}`,
    content: wrapOwnerEmailBody(buildLeadFieldBlock(data)),
  };
}

async function sendMailgunEmail(subject: string, text: string, replyTo?: string): Promise<boolean> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const to = process.env.OWNER_NOTIFICATION_EMAIL || DEFAULT_TO;

  if (!apiKey) {
    console.warn("[Notification] Mailgun skipped — set MAILGUN_API_KEY in Vercel");
    return false;
  }

  const body = new URLSearchParams({
    from: `Therkildsen Funnel Page <${MAILGUN_FROM}>`,
    to,
    subject,
    text,
  });

  if (replyTo) body.set("h:Reply-To", replyTo);

  try {
    const response = await fetch(`${MAILGUN_API_BASE}/v3/${MAILGUN_DOMAIN}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[Notification] Mailgun failed (${response.status}): ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Mailgun error:", error);
    return false;
  }
}

export async function notifyOwnerByEmail(data: LeadFormData): Promise<boolean> {
  const { title, content } = buildOwnerNotification(data);
  return sendMailgunEmail(title, content, formatReplyTo(data.email, data.name));
}
