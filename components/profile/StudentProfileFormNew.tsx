"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

interface StudentProfileData {
  // General Info
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  school_email: string;
  work_email: string;
  personal_email: string;
  primary_email: string;
  phone: string;
  linkedin_url: string;
  location: string;
  hometown: string;
  marital_status: string;
  has_kids: boolean | null;
  hobbies: string;
  interesting_fact: string;
  bio: string;
  resume_url: string;

  // Education
  undergrad_school: string;
  undergrad_major: string;
  masters_school: string;
  masters_degree: string;
  additional_degrees: any[];
  professional_certifications: string[];

  // Military Service
  military_branch: string;
  military_status: string;
  mos: string;
  mos_description: string;
  military_rank: string;
  years_of_service: number | "";
  ets_eas_date: string;
  duty_stations: string[];
  units: string[];
  deployments: string[];

  // Current Employment
  current_company: string;
  job_title: string;
  years_professional_experience: number | "";

  // Outcomes
  statement_of_purpose: string;

  // Matching Data
  looking_to_change_careers: string;
  desired_industries_ranked: string[];
  example_companies: string[];
  example_roles: string[];
}

interface Props {
  initialData?: Partial<StudentProfileData>;
  onSubmit: (data: StudentProfileData) => Promise<void>;
  loading?: boolean;
}

const MILITARY_BRANCHES = ["Army", "Navy", "Air Force", "Marines", "Coast Guard", "Space Force", "National Guard"];
const MILITARY_STATUSES = ["Active Duty", "Active Guard", "Active Reserve", "Retired", "Veteran"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];
const INDUSTRIES = ["Consulting", "Technology", "Finance", "Operations", "Logistics", "Healthcare", "Defense", "Real Estate", "Entrepreneurship", "Non-Profit"];

export default function StudentProfileForm({ initialData, onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<StudentProfileData>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    profile_picture_url: initialData?.profile_picture_url || "",
    school_email: initialData?.school_email || "",
    work_email: initialData?.work_email || "",
    personal_email: initialData?.personal_email || "",
    primary_email: initialData?.primary_email || "school_email",
    phone: initialData?.phone || "",
    linkedin_url: initialData?.linkedin_url || "",
    location: initialData?.location || "",
    hometown: initialData?.hometown || "",
    marital_status: initialData?.marital_status || "",
    has_kids: initialData?.has_kids ?? null,
    hobbies: initialData?.hobbies || "",
    interesting_fact: initialData?.interesting_fact || "",
    bio: initialData?.bio || "",
    resume_url: initialData?.resume_url || "",
    undergrad_school: initialData?.undergrad_school || "",
    undergrad_major: initialData?.undergrad_major || "",
    masters_school: initialData?.masters_school || "",
    masters_degree: initialData?.masters_degree || "",
    additional_degrees: initialData?.additional_degrees || [],
    professional_certifications: initialData?.professional_certifications || [],
    military_branch: initialData?.military_branch || "",
    military_status: initialData?.military_status || "",
    mos: initialData?.mos || "",
    mos_description: initialData?.mos_description || "",
    military_rank: initialData?.military_rank || "",
    years_of_service: initialData?.years_of_service || "",
    ets_eas_date: initialData?.ets_eas_date || "",
    duty_stations: initialData?.duty_stations || [],
    units: initialData?.units || [],
    deployments: initialData?.deployments || [],
    current_company: initialData?.current_company || "",
    job_title: initialData?.job_title || "",
    years_professional_experience: initialData?.years_professional_experience || "",
    statement_of_purpose: initialData?.statement_of_purpose || "",
    looking_to_change_careers: initialData?.looking_to_change_careers || "",
    desired_industries_ranked: initialData?.desired_industries_ranked || [],
    example_companies: initialData?.example_companies || ["", "", ""],
    example_roles: initialData?.example_roles || ["", "", ""],
  });

  const [certInput, setCertInput] = useState("");
  const [dutyStationInput, setDutyStationInput] = useState("");
  const [unitInput, setUnitInput] = useState("");
  const [deploymentInput, setDeploymentInput] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addToArray = (field: keyof StudentProfileData, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), value.trim()],
      });
      setValue("");
    }
  };

  const removeFromArray = (field: keyof StudentProfileData, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData[field] as string[]).filter((_, i) => i !== index),
    });
  };

  const updateCompanyRank = (index: number, value: string) => {
    const newCompanies = [...formData.example_companies];
    newCompanies[index] = value;
    setFormData({ ...formData, example_companies: newCompanies });
  };

  const updateRoleRank = (index: number, value: string) => {
    const newRoles = [...formData.example_roles];
    newRoles[index] = value;
    setFormData({ ...formData, example_roles: newRoles });
  };

  const moveIndustry = (index: number, direction: "up" | "down") => {
    const newIndustries = [...formData.desired_industries_ranked];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex >= 0 && swapIndex < newIndustries.length) {
      [newIndustries[index], newIndustries[swapIndex]] = [newIndustries[swapIndex], newIndustries[index]];
      setFormData({ ...formData, desired_industries_ranked: newIndustries });
    }
  };

  const updateStatementOfPurpose = (value: string) => {
    setFormData({ ...formData, statement_of_purpose: value });
    const words = value.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  const bioWordCount = formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Information */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">General Information</h2>
        <div className="space-y-4">
          <FileUpload
            bucket="profile-pictures"
            accept="image/*"
            currentFileUrl={formData.profile_picture_url}
            onUploadComplete={(url) => setFormData({ ...formData, profile_picture_url: url })}
            label="Profile Picture"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Email Addresses</label>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="primary_email"
                  value="school_email"
                  checked={formData.primary_email === "school_email"}
                  onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                  className="w-4 h-4"
                />
                <input
                  type="email"
                  placeholder="School Email *"
                  value={formData.school_email}
                  onChange={(e) => setFormData({ ...formData, school_email: e.target.value })}
                  className="input-field flex-1"
                  required
                />
                <span className="text-xs text-brand-cool-gray whitespace-nowrap">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="primary_email"
                  value="work_email"
                  checked={formData.primary_email === "work_email"}
                  onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                  className="w-4 h-4"
                />
                <input
                  type="email"
                  placeholder="Work Email"
                  value={formData.work_email}
                  onChange={(e) => setFormData({ ...formData, work_email: e.target.value })}
                  className="input-field flex-1"
                />
                <span className="text-xs text-brand-cool-gray whitespace-nowrap">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="primary_email"
                  value="personal_email"
                  checked={formData.primary_email === "personal_email"}
                  onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                  className="w-4 h-4"
                />
                <input
                  type="email"
                  placeholder="Personal Email"
                  value={formData.personal_email}
                  onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                  className="input-field flex-1"
                />
                <span className="text-xs text-brand-cool-gray whitespace-nowrap">Primary</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="input-field"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current City, State</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder="Atlanta, GA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hometown</label>
              <input
                type="text"
                value={formData.hometown}
                onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                className="input-field"
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marital Status (optional)</label>
              <select
                value={formData.marital_status}
                onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                className="input-field"
              >
                <option value="">Select...</option>
                {MARITAL_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kids (optional)</label>
              <select
                value={formData.has_kids === null ? "" : formData.has_kids ? "yes" : "no"}
                onChange={(e) => setFormData({ ...formData, has_kids: e.target.value === "" ? null : e.target.value === "yes" })}
                className="input-field"
              >
                <option value="">Prefer not to say</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hobbies</label>
            <input
              type="text"
              value={formData.hobbies}
              onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
              className="input-field"
              placeholder="Reading, hiking, photography..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Interesting Fact</label>
            <input
              type="text"
              value={formData.interesting_fact}
              onChange={(e) => setFormData({ ...formData, interesting_fact: e.target.value })}
              className="input-field"
              placeholder="Something unique about you..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Brief Bio (minimum 100 words, max 500 words)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field"
              rows={6}
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-brand-cool-gray mt-1">
              Word count: {bioWordCount} / 500 {bioWordCount < 100 && "(minimum 100)"}
            </p>
          </div>

          <FileUpload
            bucket="resumes"
            accept=".pdf,.doc,.docx"
            currentFileUrl={formData.resume_url}
            onUploadComplete={(url) => setFormData({ ...formData, resume_url: url })}
            label="Resume Upload"
          />
        </div>
      </div>

      {/* Education Info - Continued in next message due to length... */}
    </form>
  );
}
