"use client";

interface Props {
  profiles: any[];
}

export default function ExportButton({ profiles }: Props) {
  const handleExport = () => {
    const csv = generateCSV(profiles);
    downloadCSV(csv, `vidarise-profiles-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <button
      onClick={handleExport}
      className="block w-full p-3 bg-brand-dark-navy hover:bg-brand-slate-gray border border-brand-slate-gray rounded text-center font-semibold transition-colors"
    >
      Export Profiles (CSV)
    </button>
  );
}

// Helper function to generate CSV
function generateCSV(profiles: any[]): string {
  const headers = [
    "Name",
    "Email",
    "Role",
    "Branch",
    "Rank",
    "Years of Service",
    "Location",
    "Current Role",
    "Company",
    "Profile Completed",
    "Joined Date",
  ];

  const rows = profiles.map((p) => [
    p.full_name || "",
    p.email || "",
    p.role || "",
    p.military_branch || "",
    p.military_rank || "",
    p.years_of_service || "",
    p.location || "",
    p.job_title || "",
    p.current_company || "",
    p.profile_completed ? "Yes" : "No",
    new Date(p.created_at).toLocaleDateString(),
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

// Helper function to download CSV
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
