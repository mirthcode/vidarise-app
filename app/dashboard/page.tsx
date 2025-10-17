import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardContent from "@/components/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile/create");
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-brand-slate-gray">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">VidaRise</h1>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-brand-cool-gray hover:text-white">
              Dashboard
            </Link>
            <Link href="/profile/edit" className="text-brand-cool-gray hover:text-white">
              My Profile
            </Link>
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="text-brand-cobalt-blue hover:text-white"
              >
                Admin
              </Link>
            )}
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-brand-cool-gray hover:text-white"
              >
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <DashboardContent initialProfile={profile} />
      </main>
    </div>
  );
}
