import { NextResponse } from "next/server";
import { notifyOwnerByEmail, type LeadFormData } from "@/lib/notify-owner";

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as LeadFormData;
    if (!data.name || !data.email || !data.phone || !data.service) {
      return NextResponse.json({ error: "Manglende felter" }, { status: 400 });
    }

    const emailed = await notifyOwnerByEmail(data);
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
