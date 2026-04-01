import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`patients-list-${ip}`)) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
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
    return NextResponse.json({ success: false, error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
