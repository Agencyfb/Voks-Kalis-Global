import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminBlogManager from "@/components/AdminBlogManager";
import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import { NO_INDEX_ROBOTS } from "@/lib/seo";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage blog",
  description: "Create and manage articles in the Voks-Kalis Global journal.",
  robots: NO_INDEX_ROBOTS,
};

export default async function AdminBlogPage() {
  const sessionToken = cookies().get(sessionCookie.name)?.value;
  const userId = sessionToken ? await getSessionUserId(sessionToken) : null;
  if (!userId) redirect("/login");

  await connectDb();
  const user = await User.findById(userId).select("role").lean();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return <AdminBlogManager />;
}
