"use client";

import { useState } from "react";

interface StudentProfileData {
  full_name: string;
  phone: string;
  location: string;
  bio: string;
  military_branch: string;
  military_rank: string;
  years_of_service: number | "";
  military_specialty: string;
  career_goals: string;
  interested_industries: string[];
  interested_functions: string[];
  what_i_want_from_mentoring: string;
}

interface Props {
  initialData?: Partial<StudentProfileData>;
  onSubmit: (data: StudentProfileData) => Promise<void>;
  loading?: boolean;
}

const MILITARY_BRANCHES = [
  "Army",
  "Navy",
  "Air Force",
  "Marines",
  "Coast Guard",
  "Space Force",
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Education",
  "Non-Profit",
  "Government",
  "Other",
];

const FUNCTIONS = [
  "Product Management",
  "Engineering",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Human Resources",
  "Strategy",
  "Entrepreneurship",
  "Other",
];

export default function StudentProfileForm({ initialData, onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<StudentProfileData>({
    full_name: initialData?.full_name || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    bio: initialData?.bio || "",
    military_branch: initialData?.military_branch || "",
    military_rank: initialData?.military_rank || "",
    years_of_service: initialData?.years_of_service || "",
    military_specialty: initialData?.military_specialty || "",
    career_goals: initialData?.career_goals || "",
    interested_industries: initialData?.interested_industries || [],
    interested_functions: initialData?.interested_functions || [],
    what_i_want_from_mentoring: initialData?.what_i_want_from_mentoring || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item);
    }
    return [...array, item];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Current Location
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Military Background */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Military Background</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="military_branch" className="block text-sm font-medium mb-2">
                Military Branch *
              </label>
              <select
                id="military_branch"
                value={formData.military_branch}
                onChange={(e) => setFormData({ ...formData, military_branch: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select...</option>
                {MILITARY_BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="military_rank" className="block text-sm font-medium mb-2">
                Highest Rank
              </label>
              <input
                id="military_rank"
                type="text"
                value={formData.military_rank}
                onChange={(e) => setFormData({ ...formData, military_rank: e.target.value })}
                className="input-field"
                placeholder="e.g., E-5, O-3, Captain"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="years_of_service" className="block text-sm font-medium mb-2">
                Years of Service
              </label>
              <input
                id="years_of_service"
                type="number"
                value={formData.years_of_service}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    years_of_service: e.target.value ? parseInt(e.target.value) : "",
                  })
                }
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="military_specialty" className="block text-sm font-medium mb-2">
                Military Specialty (MOS/AFSC)
              </label>
              <input
                id="military_specialty"
                type="text"
                value={formData.military_specialty}
                onChange={(e) => setFormData({ ...formData, military_specialty: e.target.value })}
                className="input-field"
                placeholder="e.g., Infantry, Logistics"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Career Aspirations */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Career Aspirations</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="career_goals" className="block text-sm font-medium mb-2">
              Career Goals *
            </label>
            <textarea
              id="career_goals"
              value={formData.career_goals}
              onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="What are your career aspirations? What kind of role or industry are you targeting?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Industries of Interest (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INDUSTRIES.map((industry) => (
                <label key={industry} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.interested_industries.includes(industry)}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        interested_industries: toggleArrayItem(
                          formData.interested_industries,
                          industry
                        ),
                      })
                    }
                    className="w-4 h-4 text-brand-cobalt-blue bg-brand-dark-navy border-brand-slate-gray rounded focus:ring-brand-cobalt-blue"
                  />
                  <span className="text-sm">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Functions of Interest (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {FUNCTIONS.map((func) => (
                <label key={func} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.interested_functions.includes(func)}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        interested_functions: toggleArrayItem(formData.interested_functions, func),
                      })
                    }
                    className="w-4 h-4 text-brand-cobalt-blue bg-brand-dark-navy border-brand-slate-gray rounded focus:ring-brand-cobalt-blue"
                  />
                  <span className="text-sm">{func}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="what_i_want_from_mentoring" className="block text-sm font-medium mb-2">
              What I Want from Mentoring
            </label>
            <textarea
              id="what_i_want_from_mentoring"
              value={formData.what_i_want_from_mentoring}
              onChange={(e) =>
                setFormData({ ...formData, what_i_want_from_mentoring: e.target.value })
              }
              className="input-field"
              rows={4}
              placeholder="What specific guidance or support are you hoping to get from a mentor?"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
