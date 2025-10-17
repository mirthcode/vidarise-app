"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Program {
  id: string;
  name: string;
  description: string | null;
  organization: string | null;
  cohort_number: string | null;
  is_active: boolean;
  auto_approve_members: boolean;
  program_password: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  created_by: string;
}

export default function ManageProgramPage() {
  const params = useParams();
  const programId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [cohortNumber, setCohortNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [autoApproveMembers, setAutoApproveMembers] = useState(true);
  const [programPassword, setProgramPassword] = useState("");
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (error) throw error;

      if (data) {
        setProgram(data);
        setName(data.name);
        setDescription(data.description || "");
        setOrganization(data.organization || "");
        setCohortNumber(data.cohort_number || "");
        setStartDate(data.start_date || "");
        setEndDate(data.end_date || "");
        setAutoApproveMembers(data.auto_approve_members);
        setProgramPassword(data.program_password || "");
        setPasswordEnabled(!!data.program_password);
        setIsActive(data.is_active);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("programs")
        .update({
          name,
          description: description || null,
          organization: organization || null,
          cohort_number: cohortNumber || null,
          start_date: startDate || null,
          end_date: endDate || null,
          auto_approve_members: autoApproveMembers,
          program_password: passwordEnabled ? (programPassword || null) : null,
          is_active: isActive,
        })
        .eq("id", programId);

      if (updateError) throw updateError;

      setSuccess("Program updated successfully!");
      fetchProgram(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to update program");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program? This action cannot be undone and will remove all associated memberships.")) {
      return;
    }

    setError("");
    setSaving(true);

    try {
      const { error: deleteError } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (deleteError) throw deleteError;

      router.push("/admin/programs");
    } catch (err: any) {
      setError(err.message || "Failed to delete program");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12 text-brand-cool-gray">Loading...</div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="card text-center">
            <h1 className="text-2xl font-bold mb-4">Program Not Found</h1>
            <Link href="/admin/programs" className="btn-primary">
              Back to Programs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Program</h1>
            <p className="text-brand-cool-gray">Edit program details and settings</p>
          </div>
          <Link href="/admin/programs" className="btn-secondary">
            Back to Programs
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded text-green-200">
            {success}
          </div>
        )}

        {/* Program Details Form */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-6">Program Details</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="e.g., MBV Cohort II"
                  required
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2">
                  Organization
                </label>
                <input
                  id="organization"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Emory MBV"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Brief description of the program..."
              />
            </div>

            <div>
              <label htmlFor="cohortNumber" className="block text-sm font-medium mb-2">
                Cohort Number
              </label>
              <input
                id="cohortNumber"
                type="text"
                value={cohortNumber}
                onChange={(e) => setCohortNumber(e.target.value)}
                className="input-field"
                placeholder="e.g., Cohort II, 2025"
              />
            </div>

            {/* Password Protection Section */}
            <div className="border border-brand-slate-gray rounded-lg p-4">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={passwordEnabled}
                  onChange={(e) => setPasswordEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Password protect this program</span>
              </label>

              {passwordEnabled && (
                <div>
                  <label htmlFor="programPassword" className="block text-sm font-medium mb-2">
                    Program Password
                  </label>
                  <input
                    id="programPassword"
                    type="text"
                    value={programPassword}
                    onChange={(e) => setProgramPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter password"
                  />
                  <p className="text-xs text-brand-cool-gray mt-1">
                    Users must enter this password to join the program. The password is stored and can be toggled on/off without losing it.
                  </p>
                </div>
              )}

              {!passwordEnabled && programPassword && (
                <p className="text-xs text-yellow-400">
                  Password protection is currently disabled. Your saved password is preserved and can be re-enabled by checking the box above.
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoApproveMembers}
                  onChange={(e) => setAutoApproveMembers(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Auto-approve new members</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Program is active</span>
                <span className="text-xs text-brand-cool-gray ml-2">
                  (Inactive programs won't appear in signup)
                </span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/programs")}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-900/50">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Danger Zone</h2>
          <p className="text-brand-cool-gray mb-4">
            Deleting this program will remove all associated memberships and cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-300 px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Program
          </button>
        </div>

        {/* Program Info */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold mb-3">Program Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-cool-gray">Program ID:</span>
              <span className="font-mono">{program.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-cool-gray">Created:</span>
              <span>{new Date(program.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
