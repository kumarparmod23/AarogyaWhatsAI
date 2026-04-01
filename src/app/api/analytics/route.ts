import { NextResponse } from "next/server";
import { db, isDbConnected } from "@/lib/db";

const DEMO_DATA = {
  totalPatients: 247,
  newLeadsToday: 12,
  appointmentsToday: 8,
  activeConversations: 5,
  responseRate: 94,
  bookingRate: 67,
  avgNpsScore: 8.4,
  noShowRate: 7,
};

export async function GET() {
  try {
    const connected = await isDbConnected();
    if (!connected) {
      return NextResponse.json({ success: true, data: DEMO_DATA });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPatients,
      newLeadsToday,
      appointmentsToday,
      activeConversations,
      inboundMsgs7d,
      respondedConvos7d,
      totalAppointments30d,
      completedAppointments30d,
      npsAgg,
      noShowCount,
    ] = await Promise.all([
      db.patient.count(),
      db.patient.count({
        where: { createdAt: { gte: startOfDay }, leadStatus: "NEW" },
      }),
      db.appointment.count({
        where: {
          dateTime: {
            gte: startOfDay,
            lt: new Date(startOfDay.getTime() + 86400000),
          },
        },
      }),
      db.conversation.count({
        where: { status: { in: ["AI_HANDLING", "HUMAN_TAKEOVER"] } },
      }),
      db.message.count({
        where: { direction: "INBOUND", createdAt: { gte: sevenDaysAgo } },
      }),
      db.message.count({
        where: {
          direction: "INBOUND",
          createdAt: { gte: sevenDaysAgo },
          conversation: { messages: { some: { direction: "OUTBOUND" } } },
        },
      }),
      db.appointment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.appointment.count({
        where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
      }),
      db.feedback.aggregate({
        _avg: { npsScore: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.appointment.count({
        where: { status: "NO_SHOW", createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    const responseRate = inboundMsgs7d > 0
      ? Math.round((respondedConvos7d / inboundMsgs7d) * 100)
      : 0;
    const bookingRate = totalPatients > 0
      ? Math.round((totalAppointments30d / totalPatients) * 100)
      : 0;
    const avgNpsScore = npsAgg._avg.npsScore
      ? Math.round(npsAgg._avg.npsScore * 10) / 10
      : 0;
    const noShowRate = totalAppointments30d > 0
      ? Math.round((noShowCount / totalAppointments30d) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalPatients,
        newLeadsToday,
        appointmentsToday,
        activeConversations,
        responseRate: Math.min(responseRate, 100),
        bookingRate: Math.min(bookingRate, 100),
        avgNpsScore,
        noShowRate,
      },
    });
  } catch (error) {
    console.error("[Analytics] Error:", error);
    return NextResponse.json({ success: true, data: DEMO_DATA });
  }
}
