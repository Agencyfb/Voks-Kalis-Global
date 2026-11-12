import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminProfileEditor from "@/components/AdminProfileEditor";
import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit admin profile | Voks-Kalis Global",
  description: "Update your administrator profile, workspace details and notifications.",
};

export default async function AdminProfilePage() {
  const sessionToken = cookies().get(sessionCookie.name)?.value;
  const userId = sessionToken ? await getSessionUserId(sessionToken) : null;
  if (!userId) redirect("/login");

  await connectDb();
  const user = await User.findById(userId).select("firstName lastName role").lean();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return <AdminProfileEditor adminName={`${user.firstName} ${user.lastName}`.trim()} />;
}
