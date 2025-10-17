"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserRole = "mentor" | "student" | "admin";

interface Program {
  id: string;
  name: string;
  description: string | null;
  organization: string | null;
  program_password: string | null;
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programPassword, setProgramPassword] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Fetch available programs when role is selected (mentor or student only)
  useEffect(() => {
    if (role === "mentor" || role === "student") {
      fetchPrograms();
    }
  }, [role]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("id, name, description, organization, program_password")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!role) {
      setError("Please select a role");
      return;
    }

    if ((role === "mentor" || role === "student") && !selectedProgram) {
      setError("Please select a program to join");
      return;
    }

    // Validate program password if the selected program requires one
    if ((role === "mentor" || role === "student") && selectedProgram) {
      const selectedProgramData = programs.find(p => p.id === selectedProgram);
      if (selectedProgramData?.program_password) {
        if (!programPassword) {
          setError("This program requires a password");
          return;
        }
        if (programPassword !== selectedProgramData.program_password) {
          setError("Incorrect program password");
          return;
        }
      }
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          role: role,
          profile_completed: false,
        });

        if (profileError) throw profileError;

        // If admin, create entry in admins table
        if (role === "admin") {
          const { error: adminError } = await supabase.from("admins").insert({
            user_id: data.user.id,
          });

          if (adminError) throw adminError;
        }

        // If mentor or student, create program membership request
        if (role === "mentor" || role === "student") {
          const { error: membershipError } = await supabase
            .from("program_memberships")
            .insert({
              program_id: selectedProgram,
              user_id: data.user.id,
              status: "pending",
            });

          if (membershipError) throw membershipError;
        }

        // Show confirmation screen instead of redirecting
        setShowConfirmation(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!role) {
      setError("Please select a role first");
      return;
    }

    if ((role === "mentor" || role === "student") && !selectedProgram) {
      setError("Please select a program to join");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Store role and program in localStorage to use after OAuth callback
      localStorage.setItem("pending_role", role);
      if (selectedProgram) {
        localStorage.setItem("pending_program", selectedProgram);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google");
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-brand-cobalt-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
            <p className="text-brand-cool-gray mb-2">
              We've sent a confirmation email to:
            </p>
            <p className="text-brand-white font-semibold mb-6">{email}</p>
            <p className="text-brand-cool-gray mb-6">
              Please click the confirmation link in the email to activate your account and complete your profile.
            </p>
            <div className="p-4 bg-brand-slate-gray/20 rounded-lg text-sm text-brand-cool-gray">
              <p className="mb-2">
                <strong>Didn't receive the email?</strong>
              </p>
              <p>Check your spam folder or contact support for assistance.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Join VidaRise</h1>
          <p className="text-brand-cool-gray">Create your account and start your journey</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === "student"
                      ? "border-brand-cobalt-blue bg-brand-cobalt-blue/10"
                      : "border-brand-slate-gray hover:border-brand-cobalt-blue/50"
                  }`}
                >
                  <div className="text-lg font-semibold">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === "mentor"
                      ? "border-brand-cobalt-blue bg-brand-cobalt-blue/10"
                      : "border-brand-slate-gray hover:border-brand-cobalt-blue/50"
                  }`}
                >
                  <div className="text-lg font-semibold">Mentor</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === "admin"
                      ? "border-brand-cobalt-blue bg-brand-cobalt-blue/10"
                      : "border-brand-slate-gray hover:border-brand-cobalt-blue/50"
                  }`}
                >
                  <div className="text-lg font-semibold">Admin</div>
                </button>
              </div>
            </div>

            {/* Program Selection (only for mentors and students) */}
            {(role === "mentor" || role === "student") && (
              <>
                <div>
                  <label htmlFor="program" className="block text-sm font-medium mb-2">
                    Select Program
                  </label>
                  <select
                    id="program"
                    value={selectedProgram}
                    onChange={(e) => {
                      setSelectedProgram(e.target.value);
                      setProgramPassword(""); // Reset password when changing programs
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a program...</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                        {program.organization && ` - ${program.organization}`}
                      </option>
                    ))}
                  </select>
                  {programs.length === 0 && (
                    <p className="text-xs text-brand-cool-gray mt-1">
                      No active programs available. Please contact an administrator.
                    </p>
                  )}
                </div>

                {/* Program Password (only if selected program requires one) */}
                {selectedProgram && programs.find(p => p.id === selectedProgram)?.program_password && (
                  <div>
                    <label htmlFor="programPassword" className="block text-sm font-medium mb-2">
                      Program Password
                    </label>
                    <input
                      id="programPassword"
                      type="password"
                      value={programPassword}
                      onChange={(e) => setProgramPassword(e.target.value)}
                      className="input-field"
                      placeholder="Enter program password"
                      required
                    />
                    <p className="text-xs text-brand-cool-gray mt-1">
                      This program is password-protected. Contact your administrator for the password.
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !role}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-slate-gray"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-brand-dark-navy text-brand-cool-gray">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading || !role}
            className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </span>
          </button>

          <div className="mt-6 text-center text-sm">
            <span className="text-brand-cool-gray">Already have an account? </span>
            <Link href="/auth/login" className="text-brand-cobalt-blue hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
