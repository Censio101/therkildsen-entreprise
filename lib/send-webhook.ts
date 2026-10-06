const DEFAULT_MAKE_WEBHOOK_URL =
  "https://hook.eu2.make.com/qdxa9tdklu89i0jfbh0133i2debk4ae4";

export async function sendLeadWebhook(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; status: number; body: string }> {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL ?? DEFAULT_MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("[Webhook] MAKE_WEBHOOK_URL not set — skipping Make.com webhook");
    return { ok: false, status: 0, body: "missing_url" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}
