import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AgentPropertyStatus from "@/components/AgentPropertyStatus";
import BuyerDashboard from "@/components/BuyerDashboard";
import ProfileDashboard from "@/components/ProfileDashboard";
import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Buyer dashboard | Voks-Kalis Global",
  description: "Discover approved homes, save your shortlist and manage your property search.",
};

export default async function DashboardPage() {
  const sessionToken = cookies().get(sessionCookie.name)?.value;
  const userId = sessionToken ? await getSessionUserId(sessionToken) : null;
  if (!userId) redirect("/login");

  await connectDb();
  const user = await User.findById(userId).select("firstName lastName role").lean();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  if (user.role === "buyer") return <BuyerDashboard />;
  if (user.role === "agent") return <AgentPropertyStatus agentName={`${user.firstName} ${user.lastName}`.trim()} />;
  return <ProfileDashboard />;
}