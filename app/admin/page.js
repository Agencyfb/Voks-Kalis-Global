import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin dashboard | Haven",
  description: "Manage Haven property listings and sales.",
};

export default async function AdminPage() {
  const sessionToken = cookies().get(sessionCookie.name)?.value;
  const userId = sessionToken ? getSessionUserId(sessionToken) : null;

  if (!userId) redirect("/login");

  await connectDb();
  const user = await User.findById(userId).select("firstName lastName role").lean();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return <AdminDashboard adminName={`${user.firstName} ${user.lastName}`.trim()} />;
}