import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a demo clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: "demo-clinic" },
    update: {},
    create: {
      id: "demo-clinic",
      name: "Dr. Sharma's Dental Clinic",
      phone: "+919876543210",
      address: "123, MG Road",
      city: "Delhi",
      state: "Delhi",
    },
  });

  // Create sample message templates
  const templates = [
    {
      id: "tpl-welcome",
      clinicId: clinic.id,
      name: "welcome_message",
      language: "hi",
      category: "UTILITY" as const,
      body: "नमस्ते {{1}}! 🙏\n\n{{2}} में आपका स्वागत है।\n\nहम आपकी कैसे मदद कर सकते हैं?\n\n1️⃣ अपॉइंटमेंट बुक करें\n2️⃣ डॉक्टर से बात करें\n3️⃣ क्लिनिक का पता जानें",
      footer: "AarogyaWhatsAI se powered",
      status: "APPROVED" as const,
    },
    {
      id: "tpl-appointment-reminder",
      clinicId: clinic.id,
      name: "appointment_reminder",
      language: "hi",
      category: "UTILITY" as const,
      body: "नमस्ते {{1}}! 🏥\n\nयह आपकी अपॉइंटमेंट की याद दिलाने के लिए है:\n\n📅 तारीख: {{2}}\n⏰ समय: {{3}}\n🏥 {{4}}\n\nक्या आप आ रहे हैं?\n\n1️⃣ हाँ, आ रहा/रही हूँ\n2️⃣ रिशेड्यूल करना है\n3️⃣ कैंसल करना है",
      status: "APPROVED" as const,
    },
    {
      id: "tpl-followup-day1",
      clinicId: clinic.id,
      name: "post_treatment_day1",
      language: "hi",
      category: "UTILITY" as const,
      body: "नमस्ते {{1}}! 🙏\n\nकल आपका इलाज हुआ था। आप कैसा/कैसी महसूस कर रहे/रही हैं?\n\nकृपया बताएं:\n1️⃣ अच्छा महसूस हो रहा है ✅\n2️⃣ थोड़ी तकलीफ़ है 😐\n3️⃣ बहुत परेशानी है 🆘\n\nहम आपकी मदद के लिए यहाँ हैं!",
      status: "APPROVED" as const,
    },
    {
      id: "tpl-feedback",
      clinicId: clinic.id,
      name: "feedback_request",
      language: "hi",
      category: "MARKETING" as const,
      body: "नमस्ते {{1}}! 🙏\n\n{{2}} में आपका अनुभव कैसा रहा?\n\n0 से 10 के बीच एक नंबर बताएं:\n(0 = बहुत खराब, 10 = बहुत अच्छा)\n\nआपकी राय हमारे लिए बहुत मायने रखती है! 🙏",
      status: "APPROVED" as const,
    },
  ];

  for (const tpl of templates) {
    await prisma.messageTemplate.upsert({
      where: { clinicId_name: { clinicId: tpl.clinicId, name: tpl.name } },
      update: {},
      create: tpl,
    });
  }

  console.log("✅ Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
