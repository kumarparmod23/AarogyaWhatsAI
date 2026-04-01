import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scheduleAppointmentReminder } from "@/lib/queue/jobs";

export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (date) {
      const start = new Date(date);
      const end = new Date(start.getTime() + 86400000);
      where.dateTime = { gte: start, lt: end };
    }

    const appointments = await db.appointment.findMany({
      where,
      orderBy: { dateTime: "asc" },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    console.error("[Appointments] GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, dateTime, duration, type, notes } = body;

    if (!patientId || !dateTime) {
      return NextResponse.json(
        { success: false, error: "patientId and dateTime are required" },
        { status: 400 }
      );
    }

    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    const appointment = await db.appointment.create({
      data: {
        patientId,
        dateTime: new Date(dateTime),
        duration: duration || 30,
        type: type || null,
        notes: notes || null,
        status: "SCHEDULED",
      },
    });

    // Update patient lead status
    await db.patient.update({
      where: { id: patientId },
      data: { leadStatus: "APPOINTMENT_BOOKED" },
    });

    // Schedule reminders via BullMQ
    await scheduleAppointmentReminder(
      appointment.id,
      patient.phone,
      patient.name || "Patient",
      new Date(dateTime),
      "Our Clinic"
    );

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    console.error("[Appointments] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
  }
}
