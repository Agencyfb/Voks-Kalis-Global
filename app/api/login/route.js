import { NextResponse } from "next/server";
import connectDb from "@/connectDb/connect";
import User from "@/models/User";
import { createSession, passwordsMatch, sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FAILED_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

function tooManyAttemptsResponse(lockUntil) {
  const retryAfter = Math.max(1, Math.ceil((lockUntil.getTime() - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many failed sign-in attempts. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
  );
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)
    || typeof body.email !== "string" || typeof body.password !== "string" || !body.email.trim() || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    await connectDb();
    const user = await User.findOne({ email: body.email.trim().toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const now = new Date();
    if (user.loginLockUntil && user.loginLockUntil > now) {
      return tooManyAttemptsResponse(user.loginLockUntil);
    }

    if (!passwordsMatch(body.password, { hash: user.passwordHash, salt: user.passwordSalt })) {
      const lockUntil = new Date(Date.now() + LOGIN_LOCKOUT_MS);
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: user._id,
          $or: [
            { loginLockUntil: { $exists: false } },
            { loginLockUntil: null },
            { loginLockUntil: { $lte: now } },
          ],
        },
        [
          {
            $set: {
              loginFailedAttempts: {
                $add: [
                  {
                    $cond: [
                      {
                        $and: [
                          { $ne: [{ $ifNull: ["$loginLockUntil", null] }, null] },
                          { $lte: ["$loginLockUntil", now] },
                        ],
                      },
                      0,
                      { $ifNull: ["$loginFailedAttempts", 0] },
                    ],
                  },
                  1,
                ],
              },
            },
          },
          {
            $set: {
              loginLockUntil: {
                $cond: [
                  { $gte: ["$loginFailedAttempts", MAX_FAILED_LOGIN_ATTEMPTS] },
                  lockUntil,
                  null,
                ],
              },
            },
          },
        ],
        { new: true, projection: { loginFailedAttempts: 1, loginLockUntil: 1 } },
      ).lean();

      if (!updatedUser) {
        const lockedUser = await User.findById(user._id).select("loginLockUntil").lean();
        if (lockedUser?.loginLockUntil && lockedUser.loginLockUntil > new Date()) {
          return tooManyAttemptsResponse(lockedUser.loginLockUntil);
        }
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      if (updatedUser.loginLockUntil) {
        return tooManyAttemptsResponse(updatedUser.loginLockUntil);
      }
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const resetResult = await User.updateOne(
      {
        _id: user._id,
        $or: [
          { loginLockUntil: { $exists: false } },
          { loginLockUntil: null },
          { loginLockUntil: { $lte: now } },
        ],
      },
      { $set: { loginFailedAttempts: 0, loginLockUntil: null } },
    );
    if (resetResult.matchedCount === 0) {
      const lockedUser = await User.findById(user._id).select("loginLockUntil").lean();
      if (lockedUser?.loginLockUntil && lockedUser.loginLockUntil > new Date()) {
        return tooManyAttemptsResponse(lockedUser.loginLockUntil);
      }
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
    response.cookies.set(sessionCookie.name, await createSession(safeUser.id), sessionCookie.options);
    return response;
  } catch (error) {
    console.error("Account sign in failed:", error);
    return NextResponse.json({ error: "Unable to sign in right now. Please try again later." }, { status: 500 });
  }
}