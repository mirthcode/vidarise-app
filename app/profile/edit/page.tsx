"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MentorProfileFormWizard from "@/components/profile/MentorProfileFormWizard";
import StudentProfileFormWizard from "@/components/profile/StudentProfileFormWizard";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newReadyStatus = !profile.ready_for_matching;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ready_for_matching: newReadyStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile({ ...profile, ready_for_matching: newReadyStatus });
    } catch (err: any) {
      setError(err.message || "Failed to update matching status");
    }
  };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...data,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-cool-gray">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-brand-cool-gray mb-4">
            We couldn't find your profile. Please create one.
          </p>
          <button onClick={() => router.push("/profile/create")} className="btn-primary">
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Your Profile</h1>
            <p className="text-brand-cool-gray">Update your information anytime</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded text-red-200">
            {error}
          </div>
        )}

        {profile.profile_completed && (
          <div className="card mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Matching Status</h3>
                <p className="text-brand-cool-gray mb-4">
                  {profile.ready_for_matching
                    ? `You're currently marked as ready to be matched with ${profile.role === "mentor" ? "students" : "mentors"}. Admins can see your profile and create matches.`
                    : `When you're ready to be matched with ${profile.role === "mentor" ? "students" : "a mentor"}, toggle this setting. Make sure your profile is up to date first!`}
                </p>
                <button
                  onClick={handleToggleReady}
                  className={`px-6 py-3 rounded font-semibold transition-colors ${
                    profile.ready_for_matching
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {profile.ready_for_matching
                    ? "Mark as Not Ready for Matching"
                    : "Mark as Ready for Matching"}
                </button>
              </div>
              <div className="ml-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    profile.ready_for_matching
                      ? "bg-green-600/20 border-2 border-green-600"
                      : "bg-brand-slate-gray/20 border-2 border-brand-slate-gray"
                  }`}
                >
                  {profile.ready_for_matching ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-brand-cool-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {profile.role === "mentor" ? (
          <MentorProfileFormWizard initialData={profile} onSubmit={handleSubmit} loading={saving} />
        ) : (
          <StudentProfileFormWizard initialData={profile} onSubmit={handleSubmit} loading={saving} />
        )}
      </div>
    </div>
  );
}
