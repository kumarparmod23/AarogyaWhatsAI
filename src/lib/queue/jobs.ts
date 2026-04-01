import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// ─── Queues ──────────────────────────────────────────────────

export const reminderQueue = new Queue("reminders", { connection });
export const followUpQueue = new Queue("follow-ups", { connection });
export const campaignQueue = new Queue("campaigns", { connection });

// ─── Schedule an appointment reminder ────────────────────────

export async function scheduleAppointmentReminder(
  appointmentId: string,
  patientPhone: string,
  patientName: string,
  appointmentDate: Date,
  clinicName: string
) {
  // Send reminder 24 hours before
  const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
  const delay = Math.max(0, reminderTime.getTime() - Date.now());

  await reminderQueue.add(
    "appointment-reminder",
    {
      appointmentId,
      patientPhone,
      patientName,
      appointmentDate: appointmentDate.toISOString(),
      clinicName,
    },
    {
      delay,
      jobId: `reminder-${appointmentId}`,
      attempts: 3,
      backoff: { type: "exponential", delay: 60000 },
    }
  );

  // Also send a 2-hour before reminder
  const shortDelay = Math.max(0, appointmentDate.getTime() - 2 * 60 * 60 * 1000 - Date.now());
  await reminderQueue.add(
    "appointment-reminder-short",
    {
      appointmentId,
      patientPhone,
      patientName,
      appointmentDate: appointmentDate.toISOString(),
      clinicName,
    },
    {
      delay: shortDelay,
      jobId: `reminder-short-${appointmentId}`,
      attempts: 3,
      backoff: { type: "exponential", delay: 60000 },
    }
  );
}

// ─── Schedule post-treatment follow-ups ──────────────────────

export async function schedulePostTreatmentFollowUps(
  patientId: string,
  patientPhone: string,
  patientName: string,
  treatmentDate: Date
) {
  const followUpDays = [
    { day: 1, type: "POST_TREATMENT_DAY1" },
    { day: 3, type: "POST_TREATMENT_DAY3" },
    { day: 7, type: "POST_TREATMENT_DAY7" },
    { day: 30, type: "POST_TREATMENT_DAY30" },
  ];

  for (const fu of followUpDays) {
    const scheduledAt = new Date(treatmentDate.getTime() + fu.day * 24 * 60 * 60 * 1000);
    // Set to 10 AM IST
    scheduledAt.setHours(10, 0, 0, 0);

    const delay = Math.max(0, scheduledAt.getTime() - Date.now());

    await followUpQueue.add(
      "post-treatment",
      {
        patientId,
        patientPhone,
        patientName,
        type: fu.type,
        day: fu.day,
      },
      {
        delay,
        jobId: `followup-${patientId}-day${fu.day}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
      }
    );
  }
}

// ─── Schedule a campaign broadcast ───────────────────────────

export async function scheduleCampaignBroadcast(
  campaignId: string,
  recipients: { phone: string; name: string }[],
  templateName: string,
  scheduledAt?: Date
) {
  const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0;

  await campaignQueue.add(
    "broadcast",
    { campaignId, recipients, templateName },
    {
      delay,
      jobId: `campaign-${campaignId}`,
      attempts: 1,
    }
  );
}
