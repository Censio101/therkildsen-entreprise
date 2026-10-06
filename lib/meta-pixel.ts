export const META_PIXEL_ID = "1598150944492089";

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function trackLead(data: {
  name: string;
  email: string;
  phone: string;
  city: string;
  postcode: string;
  customerType: string;
  service: string;
}) {
  if (typeof window === "undefined" || !window.fbq) return;

  const phone = data.phone.replace(/\D/g, "").replace(/^45/, "");
  const [firstName, ...rest] = data.name.trim().split(/\s+/);
  const lastName = rest.join(" ");
  const [em, ph, fn, ln, ct, zp, co] = await Promise.all([
    sha256(data.email),
    sha256(phone),
    sha256(firstName ?? ""),
    sha256(lastName),
    sha256(data.city.toLowerCase()),
    sha256(data.postcode),
    sha256("dk"),
  ]);

  window.fbq(
    "track",
    "Lead",
    {
      content_name: data.service || "Entreprise Funnel",
      content_category: data.customerType === "Erhverv" ? "Erhverv" : "Privat",
      value: 1,
      currency: "DKK",
    },
    {
      eventID: `lead_${Date.now()}`,
      em,
      ph,
      fn,
      ln,
      ct,
      zp,
      country: co,
    }
  );
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
