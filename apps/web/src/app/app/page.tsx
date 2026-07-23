import { redirect } from "next/navigation";
import { getUserMemberships } from "@/lib/data/workspaces";

export default async function AppIndexPage() {
  const memberships = await getUserMemberships();

  if (memberships.length === 0) {
    redirect("/app/onboarding");
  }

  redirect(`/app/${memberships[0].workspace.slug}/dashboard`);
}
