import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AgentProfileEditor from "@/components/AgentProfileEditor";
import BuyerProfileEditor from "@/components/BuyerProfileEditor";
import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit profile | Voks-Kalis Global",
  description: "Update your account and property preferences.",
};

export default async function ProfileSettingsPage() {
  const sessionToken = cookies().get(sessionCookie.name)?.value;
  const userId = sessionToken ? getSessionUserId(sessionToken) : null;
  if (!userId) redirect("/login");

  await connectDb();
  const user = await User.findById(userId).select("firstName lastName role").lean();
  if (!user) redirect("/login");

  const name = `${user.firstName} ${user.lastName}`.trim();
  if (user.role === "buyer") return <BuyerProfileEditor buyerName={name} />;
  if (user.role === "agent") return <AgentProfileEditor agentName={name} />;
  if (user.role === "admin") redirect("/admin/profile");
  redirect("/dashboard");
}
