import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user metadata for name
  const userName = user.user_metadata?.name as string | undefined;

  return (
    <DashboardShell
      user={{
        id: user.id,
        email: user.email,
        name: userName,
      }}
    >
      {children}
    </DashboardShell>
  );
}
