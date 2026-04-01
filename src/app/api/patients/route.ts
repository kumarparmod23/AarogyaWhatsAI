import { NextRequest, NextResponse } from "next/server";
import { db, isDbConnected } from "@/lib/db";
import { checkRateLimit } from "@/lib/utils";

const DEMO_PATIENTS = [
  { id: "demo-1", phone: "+919876543210", name: "Rajesh Kumar", age: 45, gender: "MALE", leadStatus: "QUALIFIED", city: "Delhi", language: "HINDI", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { conversations: 3 } },
  { id: "demo-2", phone: "+919876543211", name: "Priya Sharma", age: 32, gender: "FEMALE", leadStatus: "APPOINTMENT_BOOKED", city: "Mumbai", language: "HINDI", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { conversations: 5 } },
  { id: "demo-3", phone: "+919876543212", name: "Amit Patel", age: 28, gender: "MALE", leadStatus: "NEW", city: "Ahmedabad", language: "HINDI", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { conversations: 1 } },
  { id: "demo-4", phone: "+919876543213", name: "Sunita Devi", age: 55, gender: "FEMALE", leadStatus: "CONVERTED", city: "Jaipur", language: "HINDI", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { conversations: 8 } },
  { id: "demo-5", phone: "+919876543214", name: "Vikram Singh", age: 38, gender: "MALE", leadStatus: "FOLLOW_UP", city: "Lucknow", language: "HINDI", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _count: { conversations: 2 } },
];

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`patients-list-${ip}`)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const connected = await isDbConnected();
    if (!connected) {
      return NextResponse.json({ success: true, data: DEMO_PATIENTS });
    }

    const params = req.nextUrl.searchParams;
    const search = params.get("search") || "";
    const status = params.get("status");
    const take = parseInt(params.get("take") || "50");
    const skip = parseInt(params.get("skip") || "0");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    if (status) {
      where.leadStatus = status;
    }

    const patients = await db.patient.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { conversations: true } },
      },
    });

    return NextResponse.json({ success: true, data: patients });
  } catch (error) {
    console.error("[Patients] GET error:", error);
    return NextResponse.json({ success: true, data: DEMO_PATIENTS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const connected = await isDbConnected();
    if (!connected) {
      return NextResponse.json({ success: false, error: "Database not connected. Configure DATABASE_URL to add patients." }, { status: 503 });
    }

    const body = await req.json();
    const { phone, name, age, gender, email, city, language } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone is required" }, { status: 400 });
    }

    const existing = await db.patient.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Patient with this phone already exists" }, { status: 409 });
    }

    const patient = await db.patient.create({
      data: {
        phone,
        name: name || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        email: email || null,
        city: city || null,
        language: language || "HINDI",
        leadStatus: "NEW",
      },
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error) {
    console.error("[Patients] POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create patient" }, { status: 500 });
  }
}
