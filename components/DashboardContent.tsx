"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardContentProps {
  initialProfile: any;
}

export default function DashboardContent({ initialProfile }: DashboardContentProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleToggleReady = async () => {
    // If marking as ready, show confirmation
    if (!profile.ready_for_matching) {
      const confirmed = window.confirm(
        "Are you sure you're ready for matching?\n\n" +
        "A complete profile helps us find your ideal match and sets the foundation for a meaningful connection. " +
        "Please review your profile to ensure it reflects your goals and experiences.\n\n" +
        "Once marked as ready, admins will be able to see your profile and create matches."
      );

      if (!confirmed) {
        return;
      }
    }

    setToggling(true);
    try {
      const newReadyStatus = !profile.ready_for_matching;

      const { error } = await supabase
        .from("profiles")
        .update({
          ready_for_matching: newReadyStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) {
        console.error("Database error:", error);
        alert(`Failed to update matching status: ${error.message || "Unknown error"}. You may need to run the database migration first.`);
        throw error;
      }

      setProfile({ ...profile, ready_for_matching: newReadyStatus });
      router.refresh();
    } catch (err: any) {
      console.error("Failed to update matching status:", err);
    } finally {
      setToggling(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const sections = profile.role === "student" ? [
      {
        name: "General",
        fields: [
          "first_name", "last_name", "phone", "primary_email", "school_email",
          "work_email", "personal_email", "linkedin_url", "current_city",
          "current_state", "hometown", "marital_status", "has_kids", "hobbies",
          "interesting_fact", "bio", "profile_picture_url", "resume_url"
        ]
      },
      {
        name: "Education",
        fields: [
          "undergrad_school", "undergrad_major", "undergrad_graduation_year",
          "masters_school", "masters_degree", "additional_degrees",
          "professional_certifications"
        ]
      },
      {
        name: "Military",
        fields: [
          "military_branch", "military_status", "military_rank", "mos",
          "mos_description", "ets_eas_date", "duty_stations", "units",
          "deployments"
        ]
      },
      {
        name: "Employment",
        fields: [
          "current_company", "job_title", "years_professional_experience"
        ]
      },
      {
        name: "Statement",
        fields: ["statement_of_purpose"]
      },
      {
        name: "Matching",
        fields: [
          "looking_to_change_careers", "desired_industries_ranked",
          "example_companies", "example_roles"
        ]
      }
    ] : [
      {
        name: "General",
        fields: [
          "first_name", "last_name", "phone", "primary_email", "school_email",
          "work_email", "personal_email", "linkedin_url", "current_city",
          "current_state", "hometown", "marital_status", "has_kids", "hobbies",
          "interesting_fact", "bio", "profile_picture_url", "resume_url"
        ]
      },
      {
        name: "Education",
        fields: [
          "undergrad_school", "undergrad_major", "undergrad_graduation_year",
          "masters_school", "masters_degree", "additional_degrees",
          "professional_certifications"
        ]
      },
      {
        name: "Military",
        fields: [
          "military_branch", "military_status", "military_rank", "mos",
          "mos_description", "ets_eas_date", "duty_stations", "units",
          "deployments"
        ]
      },
      {
        name: "Employment",
        fields: [
          "current_company", "job_title", "years_professional_experience"
        ]
      },
      {
        name: "Mentorship",
        fields: [
          "statement_of_purpose", "cities_with_experience", "industry_experience_ranked",
          "executive_roles", "companies_founded", "companies_acquired",
          "companies_sold", "has_side_consulting"
        ]
      },
      {
        name: "Matching",
        fields: [
          "mbv_cohort_i_mentor", "mbv_cohort_i_students_count",
          "mbv_cohort_ii_mentor", "mbv_cohort_ii_students_count"
        ]
      }
    ];

    const sectionCompletion = sections.map(section => {
      const filledFields = section.fields.filter(field => {
        const value = profile[field];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== undefined && value !== "";
      }).length;

      return {
        name: section.name,
        percentage: Math.round((filledFields / section.fields.length) * 100),
        filled: filledFields,
        total: section.fields.length
      };
    });

    const totalFields = sections.reduce((sum, section) => sum + section.fields.length, 0);
    const totalFilled = sectionCompletion.reduce((sum, section) => sum + section.filled, 0);
    const overallPercentage = Math.round((totalFilled / totalFields) * 100);

    return { sections: sectionCompletion, overall: overallPercentage };
  };

  const completion = calculateProfileCompletion();

  // Debug logging
  console.log('Profile data:', {
    profile_completed: profile.profile_completed,
    ready_for_matching: profile.ready_for_matching,
    role: profile.role
  });

  const isReadyForMatching = profile.ready_for_matching === true;
  // Show the ready button as long as they're not already marked as ready
  const showReadyButton = !isReadyForMatching;

  console.log('Button visibility:', {
    isReadyForMatching,
    showReadyButton,
    profile_completed: profile.profile_completed
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back{profile.first_name ? `, ${profile.first_name}` : ""}!
        </h1>
        <p className="text-brand-cool-gray">
          {profile.role === "mentor"
            ? "Your students are looking forward to connecting with you."
            : "Your journey to career growth starts here."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Profile Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-brand-cool-gray">Overall Completion</span>
              <span className="font-semibold text-lg">{completion.overall}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-brand-slate-gray rounded-full h-3">
              <div
                className="bg-brand-cobalt-blue h-3 rounded-full transition-all"
                style={{ width: `${completion.overall}%` }}
              />
            </div>

            {/* Section breakdown */}
            <div className="space-y-2 pt-2">
              {completion.sections.map((section, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-brand-cool-gray">{section.name}</span>
                  <span className={`font-medium ${section.percentage === 100 ? "text-green-400" : "text-yellow-400"}`}>
                    {section.percentage}%
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-slate-gray pt-3 mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-brand-cool-gray">Role</span>
                <span className="font-medium capitalize">{profile.role}</span>
              </div>
              {profile.military_branch && (
                <div className="flex justify-between">
                  <span className="text-brand-cool-gray">Branch</span>
                  <span className="font-medium">{profile.military_branch}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Actions</h3>
          <div className="space-y-3">
            <Link
              href="/profile/edit"
              className="block p-3 bg-brand-cobalt-blue hover:bg-blue-600 border border-brand-cobalt-blue rounded transition-colors text-center font-semibold"
            >
              Edit Your Profile
            </Link>

            {/* Mark as Ready Button */}
            {showReadyButton ? (
              <button
                onClick={handleToggleReady}
                disabled={toggling}
                className="block w-full p-3 bg-red-600 hover:bg-red-700 border border-red-600 rounded transition-colors text-center font-semibold disabled:opacity-50"
              >
                {toggling ? "Updating..." : "Mark Profile Ready"}
              </button>
            ) : isReadyForMatching ? (
              <button
                onClick={handleToggleReady}
                disabled={toggling}
                className="block w-full p-3 bg-green-600 hover:bg-green-700 border border-green-600 rounded transition-colors text-center font-semibold disabled:opacity-50"
              >
                {toggling ? "Updating..." : "Profile Ready ✓"}
              </button>
            ) : null}

            {profile.role === "student" && (
              profile.can_browse_mentors ? (
                <Link
                  href="/mentors"
                  className="block p-3 bg-brand-cobalt-blue hover:bg-blue-600 border border-brand-cobalt-blue rounded transition-colors text-center font-semibold"
                >
                  Browse Mentors
                </Link>
              ) : (
                <div className="block p-3 bg-gray-600 border border-gray-500 rounded text-center font-semibold cursor-not-allowed">
                  Browse Mentors
                  <p className="text-xs font-normal text-gray-400 mt-1">
                    Available after admin approval
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Ready for Matching Info Section - Only show if ready */}
      {isReadyForMatching && (
        <div className="card bg-green-900/20 border-green-600 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-2 text-green-400">Ready for Matching</h3>
              <p className="text-sm text-brand-cool-gray">
                You're all set! Admins can now see your profile and create matches. Your status is shown in the Actions panel above.
              </p>
            </div>
            <div className="ml-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-600/20 border-2 border-green-600">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {profile.role === "mentor" && (
        <div className="card mt-6">
          <h3 className="text-xl font-semibold mb-4">My Students</h3>
          <p className="text-brand-cool-gray">
            You don't have any students assigned yet. Check back soon!
          </p>
        </div>
      )}

      {profile.role === "student" && (
        <div className="card mt-6">
          <h3 className="text-xl font-semibold mb-4">My Mentors</h3>
          <p className="text-brand-cool-gray">
            You haven't been matched with a mentor yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
