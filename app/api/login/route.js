import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import User from "@/models/User";
import { createSession, passwordsMatch, sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.email !== "string" || typeof body.password !== "string" || !body.email.trim() || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    await connectDb();
    const user = await User.findOne({ email: body.email.trim().toLowerCase() });

    if (!user || !passwordsMatch(body.password, { hash: user.passwordHash, salt: user.passwordSalt })) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const safeUser = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    const response = NextResponse.json({ user: safeUser });
    response.cookies.set(sessionCookie.name, createSession(safeUser.id), sessionCookie.options);
    return response;
  } catch (error) {
    console.error("Account sign in failed:", error);
    return NextResponse.json({ error: "Unable to sign in right now. Please try again later." }, { status: 500 });
  }
}