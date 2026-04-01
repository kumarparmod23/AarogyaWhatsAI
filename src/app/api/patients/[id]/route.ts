import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        conversations: {
          orderBy: { updatedAt: "desc" },
          take: 20,
          include: {
            _count: { select: { messages: true } },
          },
        },
        appointments: {
          orderBy: { dateTime: "desc" },
          take: 10,
        },
        feedbacks: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patient });
  } catch (error) {
    console.error("[Patient] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch patient" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const allowed = ["name", "age", "gender", "email", "city", "language", "leadStatus", "tags", "medicalNotes"];
    const data: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    const patient = await db.patient.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: patient });
  } catch (error) {
    console.error("[Patient] PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update patient" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.patient.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Patient deleted" });
  } catch (error) {
    console.error("[Patient] DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete patient" }, { status: 500 });
  }
}
