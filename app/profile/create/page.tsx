"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import MentorProfileFormWizard from "@/components/profile/MentorProfileFormWizard";
import StudentProfileFormWizard from "@/components/profile/StudentProfileFormWizard";
import ProgramExpectationsModal from "@/components/ProgramExpectationsModal";

function CreateProfileContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"mentor" | "student" | null>(null);
  const [checking, setChecking] = useState(true);
  const [showExpectations, setShowExpectations] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const initializeRole = async () => {
      // Clear any pending role in localStorage first
      localStorage.removeItem("pending_role");

      // Check if user already has a profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, profile_completed")
          .eq("id", user.id)
          .single();

        // If admin without complete profile, treat as mentor
        if (profile?.role === "admin" && !profile.profile_completed) {
          setRole("mentor");
          setChecking(false);
          const acknowledged = localStorage.getItem("program_expectations_acknowledged");
          if (!acknowledged) {
            setShowExpectations(true);
          } else {
            setHasAcknowledged(true);
          }
          return;
        }

        // If admin with complete profile, redirect to admin dashboard
        if (profile?.role === "admin" && profile.profile_completed) {
          router.replace("/admin");
          return;
        }

        // If profile is complete, redirect to dashboard
        if (profile?.profile_completed) {
          router.replace("/dashboard");
          return;
        }

        // If profile exists but incomplete, set the role
        if (profile?.role && profile.role !== "admin") {
          setRole(profile.role as "mentor" | "student");
          setChecking(false);
          // Show expectations modal if not acknowledged yet
          const acknowledged = localStorage.getItem("program_expectations_acknowledged");
          if (!acknowledged) {
            setShowExpectations(true);
          } else {
            setHasAcknowledged(true);
          }
          return;
        }
      }

      // Check if role is in URL params
      const roleParam = searchParams.get("role") as "mentor" | "student" | null;
      if (roleParam) {
        setRole(roleParam);
        setChecking(false);
        // Show expectations modal if not acknowledged yet
        const acknowledged = localStorage.getItem("program_expectations_acknowledged");
        if (!acknowledged) {
          setShowExpectations(true);
        } else {
          setHasAcknowledged(true);
        }
        return;
      }

      setChecking(false);
    };

    initializeRole();
  }, [searchParams, supabase, router]);

  const handleExpectationsAccept = () => {
    localStorage.setItem("program_expectations_acknowledged", "true");
    setHasAcknowledged(true);
    setShowExpectations(false);
  };

  const handleMentorSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Clean up data
      const cleanedData: any = { ...data };

      // Log BEFORE cleanup
      console.log('=== MENTOR SUBMIT - BEFORE CLEANUP ===');
      console.log('Data keys:', Object.keys(cleanedData));
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key];
        console.log(`${key}: ${JSON.stringify(value)} (type: ${typeof value}, is empty string: ${value === ""})`);
      });

      // AGGRESSIVE CLEANUP - Convert EVERYTHING that could be problematic
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key];

        // Handle arrays FIRST - filter out empty strings and nulls, delete if empty
        if (Array.isArray(value)) {
          const filtered = value.filter(item => item !== null && item !== undefined && item !== '' && (typeof item !== 'string' || item.trim() !== ''));
          if (filtered.length === 0) {
            delete cleanedData[key];
          } else {
            cleanedData[key] = filtered;
          }
        }
        // Handle empty strings - convert ALL to null
        else if (value === "" || (typeof value === 'string' && value.trim() === "")) {
          delete cleanedData[key];
        }
        // Remove undefined and null values completely
        else if (value === undefined || value === null) {
          delete cleanedData[key];
        }
      });

      // Map field names to match database schema
      if (cleanedData.mbv_cohort_i_students !== undefined) {
        cleanedData.mbv_cohort_i_students_count = cleanedData.mbv_cohort_i_students;
        delete cleanedData.mbv_cohort_i_students;
      }
      if (cleanedData.mbv_cohort_ii_students !== undefined) {
        cleanedData.mbv_cohort_ii_students_count = cleanedData.mbv_cohort_ii_students;
        delete cleanedData.mbv_cohort_ii_students;
      }

      // Log AFTER cleanup
      console.log('=== MENTOR SUBMIT - AFTER CLEANUP ===');
      console.log('Cleaned data keys:', Object.keys(cleanedData));
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key];
        console.log(`${key}: ${JSON.stringify(value)} (type: ${typeof value})`);
      });

      const finalPayload = {
        id: user.id,
        email: user.email,
        role: "mentor",
        ...cleanedData,
        profile_completed: true,
      };

      console.log('=== FINAL PAYLOAD TO DATABASE ===');
      console.log(JSON.stringify(finalPayload, null, 2));

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(finalPayload);

      if (updateError) {
        console.error('=== DATABASE ERROR ===');
        console.error('Error:', updateError);
        console.error('Error code:', updateError.code);
        console.error('Error message:', updateError.message);
        throw updateError;
      }

      // Handle program enrollments based on mentor selections
      const { data: programs } = await supabase
        .from("programs")
        .select("id, name")
        .in("name", ["MBV Cohort I", "MBV Cohort II"]);

      if (programs) {
        const enrollments = [];

        // Enroll in Cohort I if selected
        if (data.mbv_cohort_i_mentor) {
          const cohortI = programs.find(p => p.name === "MBV Cohort I");
          if (cohortI) {
            enrollments.push({
              user_id: user.id,
              program_id: cohortI.id,
              status: "profile_complete",
            });
          }
        }

        // Enroll in Cohort II if selected
        if (data.mbv_cohort_ii_mentor) {
          const cohortII = programs.find(p => p.name === "MBV Cohort II");
          if (cohortII) {
            enrollments.push({
              user_id: user.id,
              program_id: cohortII.id,
              status: "profile_complete",
            });
          }
        }

        if (enrollments.length > 0) {
          await supabase.from("program_enrollments").upsert(enrollments);
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Clean up data
      const cleanedData: any = { ...data };

      // Log BEFORE cleanup
      console.log('=== STUDENT SUBMIT - BEFORE CLEANUP ===');
      console.log('Data keys:', Object.keys(cleanedData));
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key];
        console.log(`${key}: ${JSON.stringify(value)} (type: ${typeof value}, is empty string: ${value === ""})`);
      });

      // AGGRESSIVE CLEANUP - Convert EVERYTHING that could be problematic
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key];

        // Handle arrays FIRST - filter out empty strings and nulls, delete if empty
        if (Array.isArray(value)) {
          const filtered = value.filter(item => item !== null && item !== undefined && item !== '' && (typeof item !== 'string' || item.trim() !== ''));
          if (filtered.length === 0) {
            delete cleanedData[key];
          } else {
            cleanedData[key] = filtered;
          }
        }
        // Handle empty strings - convert ALL to null
        else if (value === "" || (typeof value === 'string' && value.trim() === "")) {
          delete cleanedData[key];
        }
        // Remove undefined and null values completely
        else if (value === undefined || value === null) {
          delete cleanedData[key];
        }
      });

      // Log AFTER cleanup
      console.log('=== STUDENT SUBMIT - AFTER CLEANUP ===');
      console.log('Cleaned data keys:', Object.keys(cleanedData));
      Object.keys(cleanedData).forEach(key => {
        const value = cleanedData[key];
        console.log(`${key}: ${JSON.stringify(value)} (type: ${typeof value})`);
      });

      const finalPayload = {
        id: user.id,
        email: user.email,
        role: "student",
        ...cleanedData,
        profile_completed: true,
      };

      console.log('=== FINAL PAYLOAD TO DATABASE ===');
      console.log(JSON.stringify(finalPayload, null, 2));

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(finalPayload);

      if (updateError) {
        console.error('=== DATABASE ERROR ===');
        console.error('Error:', updateError);
        console.error('Error code:', updateError.code);
        console.error('Error message:', updateError.message);
        throw updateError;
      }

      // Get MBV Cohort II program ID
      const { data: program } = await supabase
        .from("programs")
        .select("id")
        .eq("name", "MBV Cohort II")
        .single();

      if (program) {
        // Enroll student in MBV Cohort II
        await supabase
          .from("program_enrollments")
          .upsert({
            user_id: user.id,
            program_id: program.id,
            status: "profile_complete",
          });
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-brand-cool-gray">Loading...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Choose Your Role</h1>
          <p className="text-brand-cool-gray mb-6">
            Are you here to mentor others or to receive mentorship?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setRole("student");
                setShowExpectations(true);
              }}
              className="p-6 rounded-lg border-2 border-brand-slate-gray hover:border-brand-cobalt-blue transition-all"
            >
              <div className="text-xl font-semibold mb-2">Student</div>
              <div className="text-sm text-brand-cool-gray">Seeking guidance</div>
            </button>
            <button
              onClick={() => {
                setRole("mentor");
                setShowExpectations(true);
              }}
              className="p-6 rounded-lg border-2 border-brand-slate-gray hover:border-brand-cobalt-blue transition-all"
            >
              <div className="text-xl font-semibold mb-2">Mentor</div>
              <div className="text-sm text-brand-cool-gray">Offering guidance</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgramExpectationsModal
        isOpen={showExpectations}
        onClose={() => {
          setShowExpectations(false);
          setRole(null);
        }}
        onAccept={handleExpectationsAccept}
        userRole={role}
      />

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {hasAcknowledged ? "Create Your Profile" : "Create Your Profile"}
            </h1>
            <p className="text-brand-cool-gray">
              {role === "mentor"
                ? "Share your experience and expertise to help guide others"
                : "Tell us about yourself and your career aspirations"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded text-red-200">
              {error}
            </div>
          )}

          {hasAcknowledged && (
            <>
              {role === "mentor" ? (
                <MentorProfileFormWizard onSubmit={handleMentorSubmit} loading={loading} />
              ) : (
                <StudentProfileFormWizard onSubmit={handleStudentSubmit} loading={loading} />
              )}
            </>
          )}

          {!hasAcknowledged && !showExpectations && (
            <div className="card text-center">
              <p className="text-brand-cool-gray mb-4">
                Please review and acknowledge the program expectations to continue.
              </p>
              <button
                onClick={() => setShowExpectations(true)}
                className="btn-primary"
              >
                Review Program Expectations
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function CreateProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-cool-gray">Loading...</div>
      </div>
    }>
      <CreateProfileContent />
    </Suspense>
  );
}
