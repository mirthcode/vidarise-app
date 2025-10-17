"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Program {
  id: string;
  name: string;
  description: string | null;
  organization: string | null;
  cohort_number: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const supabase = createClient();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (err: any) {
      console.error("Error fetching programs:", err);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create program
      const { error: createError } = await supabase.from("programs").insert({
        name,
        description: description || null,
        organization: organization || null,
        cohort_number: cohortNumber || null,
        start_date: startDate || null,
        end_date: endDate || null,
        auto_approve_members: autoApproveMembers,
        program_password: passwordEnabled ? (programPassword || null) : null,
        is_active: true,
        created_by: user.id,
      });

      if (createError) throw createError;

      setSuccess("Program created successfully!");

      // Reset form
      setName("");
      setDescription("");
      setOrganization("");
      setCohortNumber("");
      setStartDate("");
      setEndDate("");
      setAutoApproveMembers(true);
      setProgramPassword("");
      setPasswordEnabled(false);
      setShowForm(false);

      // Refresh programs list
      fetchPrograms();
    } catch (err: any) {
      setError(err.message || "Failed to create program");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Program Management</h1>
            <p className="text-brand-cool-gray">Create and manage mentorship programs</p>
          </div>
          <Link href="/admin" className="btn-secondary">
            Back to Admin
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

        {/* Create Program Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mb-8"
          >
            + Create New Program
          </button>
        )}

        {/* Create Program Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Create New Program</h2>
            <form onSubmit={handleCreateProgram} className="space-y-4">
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
                      Users must enter this password to join the program
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoApproveMembers}
                    onChange={(e) => setAutoApproveMembers(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Auto-approve new members</span>
                </label>
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

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Program"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Programs List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Existing Programs</h2>
          {programs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-brand-cool-gray">No programs created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{program.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            program.is_active
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {program.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {program.organization && (
                        <p className="text-sm text-brand-cool-gray mb-1">
                          <strong>Organization:</strong> {program.organization}
                        </p>
                      )}

                      {program.cohort_number && (
                        <p className="text-sm text-brand-cool-gray mb-1">
                          <strong>Cohort:</strong> {program.cohort_number}
                        </p>
                      )}

                      {program.description && (
                        <p className="text-sm text-brand-cool-gray mt-2">
                          {program.description}
                        </p>
                      )}

                      {(program.start_date || program.end_date) && (
                        <p className="text-sm text-brand-cool-gray mt-2">
                          <strong>Duration:</strong>{" "}
                          {program.start_date
                            ? new Date(program.start_date).toLocaleDateString()
                            : "TBD"}{" "}
                          -{" "}
                          {program.end_date
                            ? new Date(program.end_date).toLocaleDateString()
                            : "TBD"}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/admin/programs/${program.id}`}
                      className="btn-secondary text-sm"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
