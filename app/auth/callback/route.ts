import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

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
        // New OAuth user - create profile with pending role from localStorage
        // We'll handle this on the client side by redirecting to profile creation
        return NextResponse.redirect(new URL("/profile/create", requestUrl.origin));
      } else if (!profile.profile_completed) {
        // Profile exists but not completed - redirect to complete it
        return NextResponse.redirect(new URL(`/profile/create?role=${profile.role}`, requestUrl.origin));
      } else if (profile.role === "admin") {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin));
      } else {
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
