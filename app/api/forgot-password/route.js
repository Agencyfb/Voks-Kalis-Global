import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  createResetCode,
  getPasswordResetSecret,
  hashResetValue,
  MAX_RESET_REQUESTS_PER_WINDOW,
  RESET_CODE_TTL_MS,
  RESET_REQUEST_WINDOW_MS,
} from "@/lib/passwordReset";
import PasswordReset from "@/models/PasswordReset";
import User from "@/models/User";

export const runtime = "nodejs";

const GENERIC_RESPONSE = {
  message: "If an account exists for that email, a verification code will be sent shortly.",
};

function response() {
  return NextResponse.json(GENERIC_RESPONSE, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)
    || typeof body.email !== "string" || body.email.length > 254
    || !/^\S+@\S+\.\S+$/.test(body.email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const secret = getPasswordResetSecret();
    await connectDb();

    const user = await User.findOne({ email: body.email.trim().toLowerCase() }).select("_id email firstName");
    if (!user) return response();

    const now = new Date();
    const windowStart = new Date(now.getTime() - RESET_REQUEST_WINDOW_MS);
    const code = createResetCode();
    const codeHash = hashResetValue(code, secret);
    const expiresAt = new Date(now.getTime() + RESET_CODE_TTL_MS);

    try {
      const challenge = await PasswordReset.findOneAndUpdate(
        {
          userId: user._id,
          $or: [
            { requestWindowStartedAt: { $exists: false } },
            { requestWindowStartedAt: null },
            { requestWindowStartedAt: { $lte: windowStart } },
            { requestCount: { $lt: MAX_RESET_REQUESTS_PER_WINDOW } },
          ],
        },
        [{
          $set: {
            userId: user._id,
            requestCount: {
              $cond: [
                { $gt: ["$requestWindowStartedAt", windowStart] },
                { $add: [{ $ifNull: ["$requestCount", 0] }, 1] },
                1,
              ],
            },
            requestWindowStartedAt: {
              $cond: [
                { $gt: ["$requestWindowStartedAt", windowStart] },
                "$requestWindowStartedAt",
                now,
              ],
            },
            codeHash,
            attempts: 0,
            verifiedAt: null,
            resetTokenHash: null,
            expiresAt,
            updatedAt: now,
            createdAt: { $ifNull: ["$createdAt", now] },
          },
        }],
        { upsert: true, new: true, setDefaultsOnInsert: false },
      );

      if (!challenge) return response();
    } catch (error) {
      if (error.code === 11000) return response();
      throw error;
    }

    try {
      await sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        code,
      });
    } catch (error) {
      try {
        await PasswordReset.updateOne({ userId: user._id, codeHash }, { $set: { codeHash: null } });
      } catch (cleanupError) {
        console.error("Undelivered password reset challenge cleanup failed:", cleanupError);
      }
      console.error("Password reset email delivery failed:", error);
      return NextResponse.json(
        { error: "We couldn't send the reset code. Please try again later or contact support." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return response();
  } catch (error) {
    if (error.code === "RESEND_CONFIG_MISSING" || error.code === "PASSWORD_RESET_CONFIG_MISSING") {
      console.error("Password reset configuration error:", error.message);
      return NextResponse.json(
        { error: "Password reset email is not configured yet. Please contact support." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    } else {
      console.error("Password reset request failed:", error);
    }
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
