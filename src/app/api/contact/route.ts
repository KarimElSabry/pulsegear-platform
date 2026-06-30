import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_m5sS_5s9Us1vNA1MMeSobyMwg2NnJEJNcUCGa6Vlc-zOtdWeFXGCaCw1GgBDpEhDpg/exec";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const contactData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
      formType: "contact",
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    const result = await response.json();
    return NextResponse.json({ status: "success", result });

  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Something went wrong" },
      { status: 500 }
    );
  }
}