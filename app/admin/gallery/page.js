import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminGalleryManager from "@/components/AdminGalleryManager";
import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import { NO_INDEX_ROBOTS } from "@/lib/seo";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage gallery",
  description: "Manage client and completed project gallery images.",
  robots: NO_INDEX_ROBOTS,
};

export default async function AdminGalleryPage() {
  const sessionToken = cookies().get(sessionCookie.name)?.value;
  const userId = sessionToken ? await getSessionUserId(sessionToken) : null;
  if (!userId) redirect("/login");

  await connectDb();
  const user = await User.findById(userId).select("role").lean();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return <AdminGalleryManager />;
}
