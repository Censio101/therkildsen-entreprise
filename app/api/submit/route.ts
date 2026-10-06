import { NextResponse } from "next/server";
import type { LeadAttribution } from "@/lib/attribution";
import { notifyOwnerByEmail, type LeadFormData } from "@/lib/notify-owner";
import { isValidDanishPhone } from "@/lib/phone";
import { sendLeadWebhook } from "@/lib/send-webhook";
import { buildLeadWebhookPayload } from "@/lib/webhook-payload";

type SubmitBody = LeadFormData & { attribution?: LeadAttribution };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;
    const { attribution, ...data } = body;
    if (!data.name || !data.email || !data.phone || !data.service) {
      return NextResponse.json({ error: "Manglende felter" }, { status: 400 });
    }
    if (!isValidDanishPhone(data.phone)) {
      return NextResponse.json({ error: "Ugyldigt telefonnummer" }, { status: 400 });
    }
    const roofArea = data.roofArea?.trim() ?? "";
    if (!/^\d+$/.test(roofArea) || Number.parseInt(roofArea, 10) < 1) {
      return NextResponse.json({ error: "Angiv tagets størrelse i kvadratmeter" }, { status: 400 });
    }

    const webhookPayload = buildLeadWebhookPayload(data, attribution ?? {});
    const [webhook, emailed] = await Promise.all([
      sendLeadWebhook(webhookPayload),
      notifyOwnerByEmail(data),
    ]);

    if (!webhook.ok) {
      console.error("[Webhook] Submit failed:", webhook.status, webhook.body);
      return NextResponse.json(
        { error: "Kunne ikke sende henvendelsen. Prøv igen om lidt." },
        { status: 502 }
      );
    }

    if (!emailed) {
      return NextResponse.json(
        { error: "Kunne ikke sende henvendelsen. Prøv igen om lidt." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Submit]", error);
    return NextResponse.json(
      { error: "Kunne ikke sende henvendelsen. Prøv igen om lidt." },
      { status: 500 }
    );
  }
}
