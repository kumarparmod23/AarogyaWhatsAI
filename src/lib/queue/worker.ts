import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { sendTemplateMessage, sendTextMessage } from "../whatsapp";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const db = new PrismaClient();

// ─── Reminder Worker ─────────────────────────────────────────

const reminderWorker = new Worker(
  "reminders",
  async (job) => {
    const { appointmentId, patientPhone, patientName, appointmentDate, clinicName } = job.data;

    console.log(`[Reminder] Sending reminder for appointment ${appointmentId}`);

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    // Skip if cancelled
    if (!appointment || appointment.status === "CANCELLED") {
      console.log(`[Reminder] Skipping — appointment cancelled or not found`);
      return;
    }

    const date = new Date(appointmentDate);
    const dateStr = date.toLocaleDateString("hi-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = date.toLocaleTimeString("hi-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    await sendTemplateMessage(patientPhone, "appointment_reminder", "hi", [
      patientName,
      dateStr,
      timeStr,
      clinicName,
    ]);

    await db.appointment.update({
      where: { id: appointmentId },
      data: { reminderSent: true },
    });

    console.log(`[Reminder] ✅ Sent to ${patientPhone}`);
  },
  { connection, concurrency: 5 }
);

// ─── Follow-up Worker ────────────────────────────────────────

const followUpWorker = new Worker(
  "follow-ups",
  async (job) => {
    const { patientId, patientPhone, patientName, type, day } = job.data;

    console.log(`[FollowUp] Day ${day} follow-up for patient ${patientId}`);

    const messages: Record<string, string> = {
      POST_TREATMENT_DAY1: `Namaste ${patientName}! 🙏\n\nKal aapka treatment hua tha. Aap kaisa/kaisi feel kar rahe hain?\n\n1️⃣ Accha feel ho raha hai ✅\n2️⃣ Thodi takleef hai 😐\n3️⃣ Bahut pareshani hai 🆘`,
      POST_TREATMENT_DAY3: `Namaste ${patientName}! 🙏\n\n3 din ho gaye treatment ke baad. Ab kaisa hai?\n\nKya medicines regular le rahe hain?`,
      POST_TREATMENT_DAY7: `Namaste ${patientName}! 🙏\n\nEk hafta ho gaya treatment ke baad. Umeed hai ab behtar feel ho raha hoga!\n\nKoi bhi problem ho to hume bataiye. 😊`,
      POST_TREATMENT_DAY30: `Namaste ${patientName}! 🙏\n\nEk mahina ho gaya aapke treatment ko. Hum jaanna chahenge ki aap kaisi/kaise hain.\n\nAgar follow-up visit ki zaroorat hai to humse appointment book kar sakte hain.\n\nAur haan — kya aap apna experience rate karna chahenge? (0-10) ⭐`,
    };

    const message = messages[type] || messages.POST_TREATMENT_DAY1;
    await sendTextMessage(patientPhone, message);

    // Update follow-up status
    await db.followUp.updateMany({
      where: { patientId, type: type as any, status: "PENDING" },
      data: { status: "SENT", completedAt: new Date() },
    });

    console.log(`[FollowUp] ✅ Day ${day} sent to ${patientPhone}`);
  },
  { connection, concurrency: 5 }
);

// ─── Campaign Worker ─────────────────────────────────────────

const campaignWorker = new Worker(
  "campaigns",
  async (job) => {
    const { campaignId, recipients, templateName } = job.data;

    console.log(`[Campaign] Starting broadcast ${campaignId} to ${recipients.length} recipients`);

    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "SENDING" },
    });

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await sendTemplateMessage(recipient.phone, templateName, "hi", [recipient.name]);
        sent++;

        // Rate limiting: 80 messages per second (WhatsApp limit)
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (err) {
        console.error(`[Campaign] Failed to send to ${recipient.phone}:`, err);
        failed++;
      }

      // Update progress every 10 messages
      if ((sent + failed) % 10 === 0) {
        await db.campaign.update({
          where: { id: campaignId },
          data: { sent, failed },
        });
      }
    }

    await db.campaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED", sent, failed },
    });

    console.log(`[Campaign] ✅ Done. Sent: ${sent}, Failed: ${failed}`);
  },
  { connection, concurrency: 1 }
);

// ─── Error handlers ──────────────────────────────────────────

for (const worker of [reminderWorker, followUpWorker, campaignWorker]) {
  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });
}

console.log("🚀 All workers started and listening for jobs...");
