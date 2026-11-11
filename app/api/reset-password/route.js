import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import { hashPassword, sessionCookie } from "@/lib/auth";
import { getPasswordResetSecret, hashResetValue } from "@/lib/passwordReset";
import PasswordReset from "@/models/PasswordReset";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)
    || typeof body.resetToken !== "string"
    || typeof body.newPassword !== "string"
    || typeof body.confirmPassword !== "string") {
    return NextResponse.json({ error: "Complete all password reset fields." }, { status: 400 });
  }
  if (body.newPassword.length < 8 || !/[A-Z]/.test(body.newPassword) || !/[0-9]/.test(body.newPassword)) {
    return NextResponse.json(
      { error: "Use at least 8 characters, including one uppercase letter and one number." },
      { status: 400 },
    );
  }
  if (body.newPassword !== body.confirmPassword) {
    return NextResponse.json({ error: "The passwords do not match." }, { status: 400 });
  }

  try {
    const secret = getPasswordResetSecret();
    await connectDb();
    const now = new Date();
    const resetTokenHash = hashResetValue(body.resetToken, secret);
    const validChallenge = await PasswordReset.findOne({
      resetTokenHash,
      verifiedAt: { $ne: null },
      expiresAt: { $gt: now },
    }).select("userId").lean();

    if (!validChallenge) {
      return NextResponse.json(
        { error: "This password reset has expired. Request a new code." },
        { status: 400 },
      );
    }

    const { hash, salt } = hashPassword(body.newPassword);
    const challenge = await PasswordReset.findOneAndUpdate(
      {
        _id: validChallenge._id,
        resetTokenHash,
        verifiedAt: { $ne: null },
        expiresAt: { $gt: now },
      },
      { $unset: { resetTokenHash: "", verifiedAt: "" } },
      { new: false },
    ).select("userId").lean();

    if (!challenge) {
      return NextResponse.json(
        { error: "This password reset has expired. Request a new code." },
        { status: 400 },
      );
    }

    const userUpdate = await User.updateOne(
      { _id: challenge.userId },
      {
        $set: {
          passwordHash: hash,
          passwordSalt: salt,
          loginFailedAttempts: 0,
          loginLockUntil: null,
        },
      },
    );
    if (userUpdate.matchedCount !== 1) {
      throw new Error("The password reset account no longer exists.");
    }

    await PasswordReset.deleteOne({ userId: challenge.userId });
    const response = NextResponse.json(
      { message: "Password updated. Sign in with your new password." },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
    return response;
  } catch (error) {
    if (error.code === "PASSWORD_RESET_CONFIG_MISSING") {
      console.error("Password reset configuration error:", error.message);
    } else {
      console.error("Password reset failed:", error);
    }
    return NextResponse.json(
      { error: "Unable to reset your password right now. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
