export async function sendLeadWebhook(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; status: number; body: string }> {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    console.warn("[Webhook] MAKE_WEBHOOK_URL not set — skipping Make.com webhook");
    return { ok: true, status: 0, body: "skipped" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}
