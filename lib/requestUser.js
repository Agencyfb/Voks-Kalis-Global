import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import User from "@/models/User";

export async function getRequestUser(request) {
  const token = request.cookies.get(sessionCookie.name)?.value;
  const userId = token ? await getSessionUserId(token) : null;
  if (!userId) return null;

  await connectDb();
  return User.findById(userId);
}