import { Queue } from "bullmq";
import IORedis from "ioredis";

// ─── Lazy Redis connection (only connects when actually needed) ─

let _connection: IORedis | null = null;

function getConnection(): IORedis {
  if (!_connection) {
    _connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 200, 2000);
      },
    });
    _connection.on("error", (err) => {
      console.warn("[Queue] Redis connection error:", err.message);
    });
  }
  return _connection;
}

// ─── Lazy Queues ────────────────────────────────────────────────

let _reminderQueue: Queue | null = null;
let _followUpQueue: Queue | null = null;
let _campaignQueue: Queue | null = null;

function getQueue(name: string): Queue {
  const connection = getConnection();
  switch (name) {
    case "reminders":
      if (!_reminderQueue) _reminderQueue = new Queue("reminders", { connection });
      return _reminderQueue;
    case "follow-ups":
      if (!_followUpQueue) _followUpQueue = new Queue("follow-ups", { connection });
      return _followUpQueue;
    case "campaigns":
      if (!_campaignQueue) _campaignQueue = new Queue("campaigns", { connection });
      return _campaignQueue;
    default:
      throw new Error(`Unknown queue: ${name}`);
  }
}

// Export getters for workers that need direct access
export const getReminderQueue = () => getQueue("reminders");
export const getFollowUpQueue = () => getQueue("follow-ups");
export const getCampaignQueue = () => getQueue("campaigns");
export { getConnection };

// ─── Schedule an appointment reminder ────────────────────────

export async function scheduleAppointmentReminder(
  appointmentId: string,
  patientPhone: string,
  patientName: string,
  appointmentDate: Date,
  clinicName: string
) {
  try {
    const queue = getQueue("reminders");

    // Send reminder 24 hours before
    const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    const delay = Math.max(0, reminderTime.getTime() - Date.now());

    await queue.add(
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
    await queue.add(
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
  } catch (err) {
    console.error("[Queue] Failed to schedule appointment reminder:", err);
  }
}

// ─── Schedule post-treatment follow-ups ──────────────────────

export async function schedulePostTreatmentFollowUps(
  patientId: string,
  patientPhone: string,
  patientName: string,
  treatmentDate: Date
) {
  try {
    const queue = getQueue("follow-ups");

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

      await queue.add(
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
  } catch (err) {
    console.error("[Queue] Failed to schedule follow-ups:", err);
  }
}

// ─── Schedule a campaign broadcast ───────────────────────────

export async function scheduleCampaignBroadcast(
  campaignId: string,
  recipients: { phone: string; name: string }[],
  templateName: string,
  scheduledAt?: Date
) {
  try {
    const queue = getQueue("campaigns");
    const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0;

    await queue.add(
      "broadcast",
      { campaignId, recipients, templateName },
      {
        delay,
        jobId: `campaign-${campaignId}`,
        attempts: 1,
      }
    );
  } catch (err) {
    console.error("[Queue] Failed to schedule campaign:", err);
  }
}
