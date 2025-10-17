import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Get the user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, profile_completed")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // New OAuth user - redirect to a page that will handle profile creation
        // The client-side will read localStorage for pending_role and pending_program
        return NextResponse.redirect(new URL("/auth/callback/complete", origin));
      } else if (!profile.profile_completed) {
        // Profile exists but not completed - redirect to complete it
        return NextResponse.redirect(new URL(`/profile/create?role=${profile.role}`, origin));
      } else if (profile.role === "admin") {
        return NextResponse.redirect(new URL("/admin", origin));
      } else {
        return NextResponse.redirect(new URL("/dashboard", origin));
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth/login", origin));
}
