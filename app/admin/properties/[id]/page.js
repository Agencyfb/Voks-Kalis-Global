import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminPropertyReview from "@/components/AdminPropertyReview";
import connectDb from "@/connectDb/connect";
import { getSessionUserId, sessionCookie } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Review property | Voks-Kalis Global",
  description: "Preview and review a property listing before it is published.",
};

export default async function AdminPropertyReviewPage({ params }) {
  const sessionToken = cookies().get(sessionCookie.name)?.value;
  const userId = sessionToken ? getSessionUserId(sessionToken) : null;
  if (!userId) redirect("/login");

  await connectDb();
  const user = await User.findById(userId).select("firstName lastName role").lean();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return (
    <AdminPropertyReview
      propertyId={params.id}
      adminName={`${user.firstName} ${user.lastName}`.trim()}
    />
  );
}
