"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CompleteOAuthSignup() {
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const completeSignup = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Get pending role and program from localStorage
        const pendingRole = localStorage.getItem("pending_role");
        const pendingProgram = localStorage.getItem("pending_program");

        if (!pendingRole) {
          // No pending role - redirect to login with error
          setError("No role information found. Please sign up again.");
          setTimeout(() => router.push("/auth/signup"), 2000);
          return;
        }

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          role: pendingRole,
          profile_completed: false,
        });

        if (profileError) throw profileError;

        // If admin, create entry in admins table
        if (pendingRole === "admin") {
          const { error: adminError } = await supabase.from("admins").insert({
            user_id: user.id,
          });

          if (adminError) throw adminError;
        }

        // If mentor or student with a program, create program membership
        if ((pendingRole === "mentor" || pendingRole === "student") && pendingProgram) {
          const { error: membershipError } = await supabase
            .from("program_memberships")
            .insert({
              program_id: pendingProgram,
              user_id: user.id,
              status: "pending",
            });

          if (membershipError) throw membershipError;
        }

        // Clear localStorage
        localStorage.removeItem("pending_role");
        localStorage.removeItem("pending_program");

        // Redirect based on role
        if (pendingRole === "admin") {
          router.push("/profile/create");
        } else {
          router.push(`/profile/create?role=${pendingRole}`);
        }
      } catch (err: any) {
        console.error("Error completing OAuth signup:", err);
        setError(err.message || "Failed to complete signup");
        setTimeout(() => router.push("/auth/signup"), 3000);
      }
    };

    completeSignup();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        {error ? (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
            <p className="text-brand-cool-gray mb-4">{error}</p>
            <p className="text-sm text-brand-cool-gray">Redirecting to signup...</p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 border-4 border-brand-cobalt-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Completing Sign Up</h1>
            <p className="text-brand-cool-gray">Setting up your account...</p>
          </>
        )}
      </div>
    </div>
  );
}
