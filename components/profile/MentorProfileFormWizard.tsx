"use client";

import { useState } from "react";
import FormStepper from "@/components/FormStepper";
import FileUpload from "@/components/FileUpload";
import { createClient } from "@/lib/supabase/client";

interface MentorProfileData {
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
  current_city: string;
  current_state: string;
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
  undergrad_graduation_year: number | "";
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

  // Mentorship Interest
  mbv_cohort_i_mentor: boolean;
  mbv_cohort_i_students: number | "";
  mbv_cohort_ii_mentor: boolean;
  mbv_cohort_ii_students: number | "";

  // Outcomes
  statement_of_purpose: string;

  // Matching Data
  cities_with_experience: string[];
  industry_experience_ranked: string[];
  executive_roles: string[];
  companies_founded: number | "";
  companies_acquired: number | "";
  companies_sold: number | "";
  side_consulting: boolean;
}

interface Props {
  initialData?: Partial<MentorProfileData>;
  onSubmit: (data: MentorProfileData) => Promise<void>;
  loading?: boolean;
}

const MILITARY_BRANCHES = ["Army", "Navy", "Air Force", "Marines", "Coast Guard", "Space Force"];
const MILITARY_STATUSES = ["Active Duty", "Active Guard", "Active Reserve", "Retired", "Veteran"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];
const INDUSTRIES = ["Consulting", "Technology", "Finance", "Operations", "Logistics", "Healthcare", "Defense", "Real Estate", "Entrepreneurship", "Non-Profit"];
const EXECUTIVE_ROLES = ["CEO", "CFO", "COO", "EVP", "SVP", "Other"];

export default function MentorProfileFormWizard({ initialData, onSubmit, loading }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState<MentorProfileData>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    profile_picture_url: initialData?.profile_picture_url || "",
    school_email: initialData?.school_email || "",
    work_email: initialData?.work_email || "",
    personal_email: initialData?.personal_email || "",
    primary_email: initialData?.primary_email || "school_email",
    phone: initialData?.phone || "",
    linkedin_url: initialData?.linkedin_url || "",
    current_city: initialData?.current_city || "",
    current_state: initialData?.current_state || "",
    hometown: initialData?.hometown || "",
    marital_status: initialData?.marital_status || "",
    has_kids: initialData?.has_kids ?? null,
    hobbies: initialData?.hobbies || "",
    interesting_fact: initialData?.interesting_fact || "",
    bio: initialData?.bio || "",
    resume_url: initialData?.resume_url || "",
    undergrad_school: initialData?.undergrad_school || "",
    undergrad_major: initialData?.undergrad_major || "",
    undergrad_graduation_year: initialData?.undergrad_graduation_year || "",
    masters_school: initialData?.masters_school || "",
    masters_degree: initialData?.masters_degree || "",
    additional_degrees: initialData?.additional_degrees || [],
    professional_certifications: initialData?.professional_certifications || [],
    military_branch: initialData?.military_branch || "",
    military_status: initialData?.military_status || "",
    mos: initialData?.mos || "",
    mos_description: initialData?.mos_description || "",
    military_rank: initialData?.military_rank || "O3",
    years_of_service: initialData?.years_of_service || "",
    ets_eas_date: initialData?.ets_eas_date || "",
    duty_stations: initialData?.duty_stations || [],
    units: initialData?.units || [],
    deployments: initialData?.deployments || [],
    current_company: initialData?.current_company || "",
    job_title: initialData?.job_title || "",
    years_professional_experience: initialData?.years_professional_experience || "",
    mbv_cohort_i_mentor: initialData?.mbv_cohort_i_mentor || false,
    mbv_cohort_i_students: initialData?.mbv_cohort_i_students || "",
    mbv_cohort_ii_mentor: initialData?.mbv_cohort_ii_mentor || false,
    mbv_cohort_ii_students: initialData?.mbv_cohort_ii_students || "",
    statement_of_purpose: initialData?.statement_of_purpose || "",
    cities_with_experience: initialData?.cities_with_experience || [],
    industry_experience_ranked: initialData?.industry_experience_ranked || [],
    executive_roles: initialData?.executive_roles || [],
    companies_founded: initialData?.companies_founded || "",
    companies_acquired: initialData?.companies_acquired || "",
    companies_sold: initialData?.companies_sold || "",
    side_consulting: initialData?.side_consulting || false,
  });

  // Input states for array fields
  const [certInput, setCertInput] = useState("");
  const [dutyStationInput, setDutyStationInput] = useState("");
  const [unitInput, setUnitInput] = useState("");
  const [deploymentInput, setDeploymentInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const steps = [
    { number: 1, title: "General", completed: currentStep > 1 },
    { number: 2, title: "Education", completed: currentStep > 2 },
    { number: 3, title: "Military", completed: currentStep > 3 },
    { number: 4, title: "Employment", completed: currentStep > 4 },
    { number: 5, title: "Mentorship", completed: currentStep > 5 },
    { number: 6, title: "Matching", completed: currentStep > 6 },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    if (step === 1) {
      if (!formData.first_name) newErrors.push("First name is required");
      if (!formData.last_name) newErrors.push("Last name is required");
      if (!formData.school_email && !formData.work_email && !formData.personal_email) {
        newErrors.push("At least one email address is required");
      }
      if (!formData.phone) newErrors.push("Phone number is required");
      if (!formData.current_city) newErrors.push("Current city is required");
      if (!formData.current_state) newErrors.push("Current state is required");
      const bioWordCount = formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (bioWordCount < 100) newErrors.push("Bio must be at least 100 words");
      if (bioWordCount > 500) newErrors.push("Bio must not exceed 500 words");
    }

    if (step === 2) {
      if (!formData.undergrad_school) newErrors.push("Undergraduate university is required");
      if (!formData.undergrad_major) newErrors.push("Undergraduate major is required");
      if (!formData.undergrad_graduation_year) newErrors.push("Graduation year is required");
    }

    if (step === 3) {
      if (!formData.military_branch) newErrors.push("Military branch is required");
      if (!formData.military_status) newErrors.push("Military status is required");
      if (!formData.military_rank) newErrors.push("Highest/Current rank is required");
      if (!formData.ets_eas_date) newErrors.push("ETS/EAS date is required");
    }

    if (step === 4) {
      if (!formData.current_company) newErrors.push("Current employer is required");
      if (!formData.job_title) newErrors.push("Current role is required");
    }

    if (step === 6) {
      const purposeWordCount = formData.statement_of_purpose.trim().split(/\s+/).filter(w => w.length > 0).length;
      if (purposeWordCount < 100) newErrors.push("Statement of purpose must be at least 100 words");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clean up data - convert ALL empty strings to null
      const cleanedData: any = { ...formData };

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

      // Save current progress to database (without marking profile as complete)
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          role: "mentor",
          ...cleanedData,
          profile_completed: false, // Don't mark as complete until final submission
        });
    } catch (error) {
      console.error("Error saving progress:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      await saveProgress();
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      await onSubmit(formData);
    }
  };

  const addToArray = (field: keyof MentorProfileData, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), value.trim()],
      });
      setValue("");
    }
  };

  const removeFromArray = (field: keyof MentorProfileData, index: number) => {
    setFormData({
      ...formData,
      [field]: (formData[field] as string[]).filter((_, i) => i !== index),
    });
  };

  const toggleIndustry = (industry: string) => {
    const current = formData.industry_experience_ranked;
    if (current.includes(industry)) {
      setFormData({
        ...formData,
        industry_experience_ranked: current.filter(i => i !== industry),
      });
    } else {
      setFormData({
        ...formData,
        industry_experience_ranked: [...current, industry],
      });
    }
  };

  const moveIndustry = (index: number, direction: "up" | "down") => {
    const newIndustries = [...formData.industry_experience_ranked];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex >= 0 && swapIndex < newIndustries.length) {
      [newIndustries[index], newIndustries[swapIndex]] = [newIndustries[swapIndex], newIndustries[index]];
      setFormData({ ...formData, industry_experience_ranked: newIndustries });
    }
  };

  const toggleExecutiveRole = (role: string) => {
    const current = formData.executive_roles;
    if (current.includes(role)) {
      setFormData({
        ...formData,
        executive_roles: current.filter(r => r !== role),
      });
    } else {
      setFormData({
        ...formData,
        executive_roles: [...current, role],
      });
    }
  };

  const updateStatementOfPurpose = (value: string) => {
    setFormData({ ...formData, statement_of_purpose: value });
    const words = value.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);

    // Format as (555) 123-4567
    if (limited.length >= 6) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}-${limited.substring(6)}`;
    } else if (limited.length >= 3) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3)}`;
    } else if (limited.length > 0) {
      return `(${limited}`;
    }
    return '';
  };

  const formatETSDate = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    // Limit to 8 digits (MMDDYYYY)
    const limited = cleaned.substring(0, 8);

    // Format as MM/DD/YYYY
    if (limited.length >= 4) {
      return `${limited.substring(0, 2)}/${limited.substring(2, 4)}/${limited.substring(4)}`;
    } else if (limited.length >= 2) {
      return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    }
    return limited;
  };

  const calculateTimeFromETS = (etsDate: string): string => {
    if (!etsDate) return "";

    // Parse MM/DD/YYYY format
    const parts = etsDate.split('/');
    if (parts.length !== 3) return "";

    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(month) || isNaN(day) || isNaN(year)) return "";

    const ets = new Date(year, month - 1, day);
    const now = new Date();
    const diffTime = ets.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const years = Math.floor(diffDays / 365);
      const remainingAfterYears = diffDays % 365;
      const months = Math.floor(remainingAfterYears / 30);
      const days = remainingAfterYears % 30;

      const parts = [];
      if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
      if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
      if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

      return parts.join(', ') + ' until separation';
    } else {
      const absDays = Math.abs(diffDays);
      const years = Math.floor(absDays / 365);
      const remainingAfterYears = absDays % 365;
      const months = Math.floor(remainingAfterYears / 30);
      const days = remainingAfterYears % 30;

      const parts = [];
      if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
      if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
      if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

      return parts.join(', ') + ' since separation';
    }
  };

  const bioWordCount = formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormStepper steps={steps} currentStep={currentStep} />

      {errors.length > 0 && (
        <div className="card bg-red-900/20 border-red-500">
          <h3 className="font-semibold mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-200">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: General Information */}
      {currentStep === 1 && (
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
              <label className="block text-sm font-medium">Email Addresses (at least one required) *</label>
              <p className="text-xs text-brand-cool-gray mb-2">Select your primary email with the radio button</p>
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
                    placeholder="School Email"
                    value={formData.school_email}
                    onChange={(e) => setFormData({ ...formData, school_email: e.target.value })}
                    className="input-field flex-1"
                  />
                  {formData.primary_email === "school_email" && (
                    <span className="text-xs text-brand-cobalt-blue font-medium whitespace-nowrap">Primary</span>
                  )}
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
                  {formData.primary_email === "work_email" && (
                    <span className="text-xs text-brand-cobalt-blue font-medium whitespace-nowrap">Primary</span>
                  )}
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
                  {formData.primary_email === "personal_email" && (
                    <span className="text-xs text-brand-cobalt-blue font-medium whitespace-nowrap">Primary</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  className="input-field"
                  placeholder="(555) 123-4567"
                  required
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
                <label className="block text-sm font-medium mb-2">Current City *</label>
                <input
                  type="text"
                  value={formData.current_city}
                  onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                  className="input-field"
                  placeholder="Atlanta"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current State *</label>
                <input
                  type="text"
                  value={formData.current_state}
                  onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                  className="input-field"
                  placeholder="GA"
                  required
                />
              </div>
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
                Brief Bio (minimum 100 words, max 500 words) *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                rows={6}
                placeholder="Share your background, professional journey, leadership philosophy, and what you enjoy about mentoring. This helps students understand your experience and approach."
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
              label="Resume Upload (optional)"
            />
          </div>
        </div>
      )}

      {/* Step 2: Education */}
      {currentStep === 2 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Undergraduate University *</label>
                <input
                  type="text"
                  value={formData.undergrad_school}
                  onChange={(e) => setFormData({ ...formData, undergrad_school: e.target.value })}
                  className="input-field"
                  placeholder="University Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Undergraduate Major *</label>
                <input
                  type="text"
                  value={formData.undergrad_major}
                  onChange={(e) => setFormData({ ...formData, undergrad_major: e.target.value })}
                  className="input-field"
                  placeholder="Major/Field of Study"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Graduation Year *</label>
                <input
                  type="number"
                  value={formData.undergrad_graduation_year || ""}
                  onChange={(e) => setFormData({ ...formData, undergrad_graduation_year: e.target.value ? parseInt(e.target.value) : "" })}
                  className="input-field"
                  placeholder="YYYY"
                  min="1950"
                  max="2050"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Professional Certifications</label>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("professional_certifications", certInput, setCertInput))}
                  className="input-field col-span-11"
                  placeholder="e.g., PMP, CPA, etc."
                />
                <button
                  type="button"
                  onClick={() => addToArray("professional_certifications", certInput, setCertInput)}
                  className="btn-secondary col-span-1 flex items-center justify-center"
                >
                  Add
                </button>
              </div>
              {formData.professional_certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.professional_certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cobalt-blue/20 border border-brand-cobalt-blue rounded-full text-sm"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeFromArray("professional_certifications", index)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Military Service */}
      {currentStep === 3 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Military Service</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Military Branch *</label>
                <select
                  value={formData.military_branch}
                  onChange={(e) => setFormData({ ...formData, military_branch: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select...</option>
                  {MILITARY_BRANCHES.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Military Status *</label>
                <select
                  value={formData.military_status}
                  onChange={(e) => setFormData({ ...formData, military_status: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select...</option>
                  {MILITARY_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">MOS</label>
                <input
                  type="text"
                  value={formData.mos}
                  onChange={(e) => setFormData({ ...formData, mos: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 11B, 0311"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">MOS Description</label>
                <input
                  type="text"
                  value={formData.mos_description}
                  onChange={(e) => setFormData({ ...formData, mos_description: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Infantry, Rifleman"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Highest/Current Rank *</label>
                <select
                  value={formData.military_rank}
                  onChange={(e) => setFormData({ ...formData, military_rank: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select...</option>
                  <option value="E1">E1</option>
                  <option value="E2">E2</option>
                  <option value="E3">E3</option>
                  <option value="E4">E4</option>
                  <option value="E5">E5</option>
                  <option value="E6">E6</option>
                  <option value="E7">E7</option>
                  <option value="E8">E8</option>
                  <option value="E9">E9</option>
                  <option value="W1">W1</option>
                  <option value="CW2">CW2</option>
                  <option value="CW3">CW3</option>
                  <option value="CW4">CW4</option>
                  <option value="CW5">CW5</option>
                  <option value="O1">O1</option>
                  <option value="O2">O2</option>
                  <option value="O3">O3</option>
                  <option value="O4">O4</option>
                  <option value="O5">O5</option>
                  <option value="O6">O6</option>
                  <option value="O7">O7</option>
                  <option value="O8">O8</option>
                  <option value="O9">O9</option>
                  <option value="O10">O10</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time in Service (years)</label>
                <input
                  type="number"
                  value={formData.years_of_service}
                  onChange={(e) => setFormData({ ...formData, years_of_service: e.target.value ? parseInt(e.target.value) : "" })}
                  className="input-field"
                  placeholder="e.g., 4, 8, 20"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ETS/EAS Date (MM/DD/YYYY) *</label>
              <input
                type="text"
                value={formData.ets_eas_date}
                onChange={(e) => setFormData({ ...formData, ets_eas_date: formatETSDate(e.target.value) })}
                className="input-field"
                placeholder="MM/DD/YYYY"
                maxLength={10}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {formData.ets_eas_date && (
                  <p className="text-xs text-brand-cobalt-blue">
                    {calculateTimeFromETS(formData.ets_eas_date)}
                  </p>
                )}
                <p className="text-xs text-brand-cool-gray ml-auto">
                  Providing this information allows us to know where you are in your military transition
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duty Stations</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={dutyStationInput}
                  onChange={(e) => setDutyStationInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("duty_stations", dutyStationInput, setDutyStationInput))}
                  className="input-field flex-1"
                  placeholder="e.g., Fort Bragg, Camp Pendleton"
                />
                <button
                  type="button"
                  onClick={() => addToArray("duty_stations", dutyStationInput, setDutyStationInput)}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>
              {formData.duty_stations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.duty_stations.map((station, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cobalt-blue/20 border border-brand-cobalt-blue rounded-full text-sm"
                    >
                      {station}
                      <button
                        type="button"
                        onClick={() => removeFromArray("duty_stations", index)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Units</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={unitInput}
                  onChange={(e) => setUnitInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("units", unitInput, setUnitInput))}
                  className="input-field flex-1"
                  placeholder="e.g., 3rd Battalion 75th Ranger Regiment"
                />
                <button
                  type="button"
                  onClick={() => addToArray("units", unitInput, setUnitInput)}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>
              {formData.units.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.units.map((unit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cobalt-blue/20 border border-brand-cobalt-blue rounded-full text-sm"
                    >
                      {unit}
                      <button
                        type="button"
                        onClick={() => removeFromArray("units", index)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deployments</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={deploymentInput}
                  onChange={(e) => setDeploymentInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("deployments", deploymentInput, setDeploymentInput))}
                  className="input-field flex-1"
                  placeholder="e.g., Iraq 2010-2011, Afghanistan 2013"
                />
                <button
                  type="button"
                  onClick={() => addToArray("deployments", deploymentInput, setDeploymentInput)}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>
              {formData.deployments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.deployments.map((deployment, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cobalt-blue/20 border border-brand-cobalt-blue rounded-full text-sm"
                    >
                      {deployment}
                      <button
                        type="button"
                        onClick={() => removeFromArray("deployments", index)}
                        className="ml-1 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Current Employment */}
      {currentStep === 4 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Current Employment</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Employer *</label>
                <input
                  type="text"
                  value={formData.current_company}
                  onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                  className="input-field"
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Role *</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="input-field"
                  placeholder="Job title"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Professional Experience (Non-Military)</label>
              <input
                type="number"
                value={formData.years_professional_experience}
                onChange={(e) => setFormData({ ...formData, years_professional_experience: e.target.value ? parseInt(e.target.value) : "" })}
                className="input-field"
                placeholder="e.g., 5, 10, 15"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Mentorship Interest */}
      {currentStep === 5 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Mentorship Interest</h2>
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mbv_cohort_i_mentor}
                  onChange={(e) => setFormData({ ...formData, mbv_cohort_i_mentor: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">MBV Cohort I Mentor</span>
              </label>
              {formData.mbv_cohort_i_mentor && (
                <div className="mt-2 ml-6">
                  <label className="block text-sm font-medium mb-2">Number of MBV Cohort I Students</label>
                  <input
                    type="number"
                    value={formData.mbv_cohort_i_students}
                    onChange={(e) => setFormData({ ...formData, mbv_cohort_i_students: e.target.value ? parseInt(e.target.value) : "" })}
                    className="input-field"
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mbv_cohort_ii_mentor}
                  onChange={(e) => setFormData({ ...formData, mbv_cohort_ii_mentor: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">MBV Cohort II Mentor</span>
              </label>
              {formData.mbv_cohort_ii_mentor && (
                <div className="mt-2 ml-6">
                  <label className="block text-sm font-medium mb-2">Number of MBV Cohort II Students</label>
                  <input
                    type="number"
                    value={formData.mbv_cohort_ii_students}
                    onChange={(e) => setFormData({ ...formData, mbv_cohort_ii_students: e.target.value ? parseInt(e.target.value) : "" })}
                    className="input-field"
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Statement & Matching */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Statement of Purpose</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Why do you want to serve as a mentor? (minimum 100 words) *
                </label>
                <p className="text-sm text-brand-cool-gray mb-2">
                  Please share why you want to serve as a mentor in the MBV Mentorship Program and how you hope to contribute to the development of our veteran students. Note this will be shared with your mentoring match.
                </p>
                <div className="mb-2 p-3 bg-brand-slate-gray/30 rounded border border-brand-slate-gray">
                  <p className="text-xs font-medium mb-1">Prompting Questions:</p>
                  <ul className="text-xs text-brand-cool-gray space-y-1 list-disc list-inside">
                    <li>How mentorship aligns with your personal or professional goals</li>
                    <li>What kind of mentoring relationship you aim to build (guidance, accountability, industry insight, personal growth, etc.)</li>
                    <li>How you plan to approach this opportunity and create value for your mentee</li>
                  </ul>
                </div>
                <textarea
                  value={formData.statement_of_purpose}
                  onChange={(e) => updateStatementOfPurpose(e.target.value)}
                  className="input-field"
                  rows={8}
                  placeholder="Share your motivation for mentorship..."
                />
                <p className="text-xs text-brand-cool-gray mt-1">
                  Word count: {wordCount} {wordCount < 100 && "(minimum 100)"}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Matching Data</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cities/Metro Areas with Professional Experience</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("cities_with_experience", cityInput, setCityInput))}
                    className="input-field flex-1"
                    placeholder="e.g., Atlanta, GA"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray("cities_with_experience", cityInput, setCityInput)}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                {formData.cities_with_experience.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.cities_with_experience.map((city, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cobalt-blue/20 border border-brand-cobalt-blue rounded-full text-sm"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => removeFromArray("cities_with_experience", index)}
                          className="ml-1 hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Industry Experience (Rank industries with most experience at the top)
                </label>
                <p className="text-xs text-brand-cool-gray mb-2">Select industries and use arrows to rank them</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {INDUSTRIES.map(industry => (
                    <label key={industry} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.industry_experience_ranked.includes(industry)}
                        onChange={() => toggleIndustry(industry)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{industry}</span>
                    </label>
                  ))}
                </div>
                {formData.industry_experience_ranked.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Ranked Industries (most experience first):</p>
                    {formData.industry_experience_ranked.map((industry, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-brand-slate-gray/30 rounded">
                        <span className="text-sm font-medium text-brand-cobalt-blue">#{index + 1}</span>
                        <span className="flex-1 text-sm">{industry}</span>
                        <button
                          type="button"
                          onClick={() => moveIndustry(index, "up")}
                          disabled={index === 0}
                          className="btn-secondary px-2 py-1 text-xs disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveIndustry(index, "down")}
                          disabled={index === formData.industry_experience_ranked.length - 1}
                          className="btn-secondary px-2 py-1 text-xs disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Executive Level Roles (select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EXECUTIVE_ROLES.map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.executive_roles.includes(role)}
                        onChange={() => toggleExecutiveRole(role)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-brand-slate-gray pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-3">Entrepreneurial Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Companies Founded</label>
                    <input
                      type="number"
                      value={formData.companies_founded}
                      onChange={(e) => setFormData({ ...formData, companies_founded: e.target.value ? parseInt(e.target.value) : "" })}
                      className="input-field"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Companies Acquired</label>
                    <input
                      type="number"
                      value={formData.companies_acquired}
                      onChange={(e) => setFormData({ ...formData, companies_acquired: e.target.value ? parseInt(e.target.value) : "" })}
                      className="input-field"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Companies Sold</label>
                    <input
                      type="number"
                      value={formData.companies_sold}
                      onChange={(e) => setFormData({ ...formData, companies_sold: e.target.value ? parseInt(e.target.value) : "" })}
                      className="input-field"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.side_consulting}
                        onChange={(e) => setFormData({ ...formData, side_consulting: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Side Consulting Work</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="btn-secondary"
          >
            Previous
          </button>
        )}
        {currentStep < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary ml-auto disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Next"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="btn-primary ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        )}
      </div>
    </form>
  );
}
