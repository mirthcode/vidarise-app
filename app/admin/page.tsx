import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ExportButton from "@/components/admin/ExportButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const { data: isAdmin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Get all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Get stats
  const mentors = profiles?.filter((p) => p.role === "mentor") || [];
  const students = profiles?.filter((p) => p.role === "student") || [];
  const completedProfiles = profiles?.filter((p) => p.profile_completed) || [];
  const incompleteProfiles = profiles?.filter((p) => !p.profile_completed) || [];

  // Get matches count
  const { count: matchesCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true });

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
          <h1 className="text-2xl font-bold">VidaRise Admin</h1>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-brand-cobalt-blue">
              Dashboard
            </Link>
            <Link href="/admin/programs" className="text-brand-cool-gray hover:text-white">
              Programs
            </Link>
            <Link href="/admin/matches" className="text-brand-cool-gray hover:text-white">
              Matches
            </Link>
            <Link href="/dashboard" className="text-brand-cool-gray hover:text-white">
              My Profile
            </Link>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-brand-cool-gray">
            Manage your mentorship program and track progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-brand-cool-gray text-sm mb-1">Total Users</div>
            <div className="text-3xl font-bold">{profiles?.length || 0}</div>
          </div>
          <div className="card">
            <div className="text-brand-cool-gray text-sm mb-1">Mentors</div>
            <div className="text-3xl font-bold text-brand-cobalt-blue">{mentors.length}</div>
          </div>
          <div className="card">
            <div className="text-brand-cool-gray text-sm mb-1">Students</div>
            <div className="text-3xl font-bold text-brand-cobalt-blue">{students.length}</div>
          </div>
          <div className="card">
            <div className="text-brand-cool-gray text-sm mb-1">Matches</div>
            <div className="text-3xl font-bold text-green-400">{matchesCount || 0}</div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Profile Completion</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-brand-cool-gray">Completed</span>
                <span className="text-green-400 font-semibold">{completedProfiles.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-cool-gray">Incomplete</span>
                <span className="text-yellow-400 font-semibold">{incompleteProfiles.length}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-slate-gray">
                <div className="text-sm text-brand-cool-gray mb-2">Completion Rate</div>
                <div className="w-full bg-brand-slate-gray rounded-full h-3">
                  <div
                    className="bg-brand-cobalt-blue h-3 rounded-full"
                    style={{
                      width: `${
                        profiles?.length
                          ? (completedProfiles.length / profiles.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-sm text-brand-cool-gray mt-1">
                  {profiles?.length
                    ? Math.round((completedProfiles.length / profiles.length) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/programs"
                className="block p-3 bg-brand-cobalt-blue hover:bg-brand-deep-blue rounded text-center font-semibold transition-colors"
              >
                Manage Programs
              </Link>
              <Link
                href="/admin/matches/create"
                className="block p-3 bg-brand-slate-gray hover:bg-brand-slate-gray/70 rounded text-center font-semibold transition-colors"
              >
                Create Match
              </Link>
              <ExportButton profiles={profiles || []} />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">All Users</h3>
            <div className="flex gap-2">
              <select className="input-field py-2">
                <option value="all">All Roles</option>
                <option value="mentor">Mentors</option>
                <option value="student">Students</option>
              </select>
              <select className="input-field py-2">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-slate-gray">
                  <th className="text-left py-3 px-4 text-brand-cool-gray font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-brand-cool-gray font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-brand-cool-gray font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-brand-cool-gray font-medium">Branch</th>
                  <th className="text-left py-3 px-4 text-brand-cool-gray font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-brand-cool-gray font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((profile) => (
                  <tr
                    key={profile.id}
                    className="border-b border-brand-slate-gray hover:bg-brand-slate-gray/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/users/${profile.id}`}
                        className="hover:text-brand-cobalt-blue"
                      >
                        {profile.full_name || "No name"}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-brand-cool-gray">{profile.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          profile.role === "mentor"
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-purple-900/30 text-purple-300"
                        }`}
                      >
                        {profile.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-cool-gray">
                      {profile.military_branch || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          profile.profile_completed
                            ? "bg-green-900/30 text-green-300"
                            : "bg-yellow-900/30 text-yellow-300"
                        }`}
                      >
                        {profile.profile_completed ? "Complete" : "Incomplete"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-cool-gray text-sm">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!profiles || profiles.length === 0 && (
              <div className="text-center py-12 text-brand-cool-gray">
                No users yet. They'll appear here when people sign up.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
