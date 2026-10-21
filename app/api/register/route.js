import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import User from "@/models/User";
import { createSession, hashPassword, sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const requiredFields = ["firstName", "lastName", "email", "phone", "password"];
  if (requiredFields.some((field) => typeof body[field] !== "string" || !body[field].trim())) {
    return NextResponse.json({ error: "First name, last name, email, phone and password are required." }, { status: 400 });
  }

  if (!/^\S+@\S+\.\S+$/.test(body.email) || body.password.length < 8 || !/[A-Z]/.test(body.password) || !/[0-9]/.test(body.password)) {
    return NextResponse.json({ error: "Use a valid email and a password with 8+ characters, one uppercase letter and one number." }, { status: 400 });
  }

  const allowedRoles = ["buyer", "agent", "landlord"];
  if (body.role !== undefined && !allowedRoles.includes(body.role)) {
    return NextResponse.json({ error: "Choose a valid account type." }, { status: 400 });
  }

  try {
    await connectDb();

    const email = body.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const { hash, salt } = hashPassword(body.password);
    const user = await User.create({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email,
      phone: body.phone.trim(),
      passwordHash: hash,
      passwordSalt: salt,
      role: body.role || "buyer",
    });

    const safeUser = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    const response = NextResponse.json({ user: safeUser }, { status: 201 });
    response.cookies.set(sessionCookie.name, createSession(safeUser.id), sessionCookie.options);
    return response;
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    console.error("Account registration failed:", error);
    return NextResponse.json({ error: "Unable to save your account. Please try again later." }, { status: 500 });
  }
}