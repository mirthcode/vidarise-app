import { createClient } from "@/lib/supabase/server";

export default async function DebugPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        <p className="text-red-400">No user authenticated</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: isAdmin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User from auth.getUser()</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile from database</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Admin record</h2>
        <pre className="bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify(isAdmin, null, 2)}
        </pre>
      </div>
    </div>
  );
}
