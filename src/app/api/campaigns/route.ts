import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scheduleCampaignBroadcast } from "@/lib/queue/jobs";

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error("[Campaigns] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, templateName, targetStatus, scheduledAt } = body;

    if (!name || !templateName) {
      return NextResponse.json(
        { success: false, error: "Name and template are required" },
        { status: 400 }
      );
    }

    // Find target patients
    const patientWhere: any = {};
    if (targetStatus && targetStatus !== "ALL") {
      patientWhere.leadStatus = targetStatus;
    }
    // Only message patients who gave consent
    patientWhere.consentGiven = true;

    const patients = await db.patient.findMany({
      where: patientWhere,
      select: { phone: true, name: true },
    });

    if (patients.length === 0) {
      return NextResponse.json(
        { success: false, error: "No matching patients found" },
        { status: 400 }
      );
    }

    // Create campaign — use first clinic or default
    const campaign = await db.campaign.create({
      data: {
        name,
        clinicId: "demo-clinic",
        templateName,
        targetFilter: { leadStatus: targetStatus },
        status: scheduledAt ? "SCHEDULED" : "SENDING",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        totalTargets: patients.length,
      },
    });

    // Schedule the broadcast job
    const recipients = patients.map((p) => ({
      phone: p.phone,
      name: p.name || "Patient",
    }));

    await scheduleCampaignBroadcast(
      campaign.id,
      recipients,
      templateName,
      scheduledAt ? new Date(scheduledAt) : undefined
    );

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    console.error("[Campaigns] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create campaign" }, { status: 500 });
  }
}
