import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import {
  createResetToken,
  getPasswordResetSecret,
  hashResetValue,
  MAX_RESET_CODE_ATTEMPTS,
  RESET_TOKEN_TTL_MS,
} from "@/lib/passwordReset";
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
    || typeof body.email !== "string" || body.email.length > 254
    || typeof body.code !== "string" || !/^\d{6}$/.test(body.code)) {
    return NextResponse.json({ error: "Enter the email address and six-digit code." }, { status: 400 });
  }

  try {
    const secret = getPasswordResetSecret();
    await connectDb();
    const user = await User.findOne({ email: body.email.trim().toLowerCase() }).select("_id");
    const now = new Date();
    const resetToken = createResetToken();

    const challenge = user && await PasswordReset.findOneAndUpdate(
      {
        userId: user._id,
        codeHash: hashResetValue(body.code, secret),
        expiresAt: { $gt: now },
        attempts: { $lt: MAX_RESET_CODE_ATTEMPTS },
        verifiedAt: null,
      },
      {
        $set: {
          verifiedAt: now,
          resetTokenHash: hashResetValue(resetToken, secret),
          expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MS),
        },
        $unset: { codeHash: "" },
      },
      { new: true },
    ).lean();

    if (challenge) {
      return NextResponse.json({ resetToken }, { headers: { "Cache-Control": "no-store" } });
    }

    if (user) {
      await PasswordReset.updateOne(
        {
          userId: user._id,
          expiresAt: { $gt: now },
          attempts: { $lt: MAX_RESET_CODE_ATTEMPTS },
          verifiedAt: null,
        },
        { $inc: { attempts: 1 } },
      );
    }

    return NextResponse.json(
      { error: "That code is invalid or expired. Request a new code and try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error.code === "PASSWORD_RESET_CONFIG_MISSING") {
      console.error("Password reset configuration error:", error.message);
    } else {
      console.error("Password reset code verification failed:", error);
    }
    return NextResponse.json(
      { error: "Unable to verify the code right now. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
