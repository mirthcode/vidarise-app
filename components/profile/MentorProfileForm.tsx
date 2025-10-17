"use client";

import { useState } from "react";

interface MentorProfileData {
  full_name: string;
  phone: string;
  location: string;
  bio: string;
  military_branch: string;
  military_rank: string;
  years_of_service: number | "";
  military_specialty: string;
  current_company: string;
  job_title: string;
  current_industry: string;
  previous_locations: string[];
  years_of_experience: number | "";
  expertise_areas: string[];
  can_mentor_in: string[];
  mentoring_capacity: number;
}

interface Props {
  initialData?: Partial<MentorProfileData>;
  onSubmit: (data: MentorProfileData) => Promise<void>;
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

const EXPERTISE_AREAS = [
  "Product Management",
  "Engineering",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Human Resources",
  "Strategy",
  "Entrepreneurship",
  "Career Transitions",
  "Leadership",
  "Networking",
  "Interview Preparation",
  "Other",
];

export default function MentorProfileForm({ initialData, onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<MentorProfileData>({
    full_name: initialData?.full_name || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    bio: initialData?.bio || "",
    military_branch: initialData?.military_branch || "",
    military_rank: initialData?.military_rank || "",
    years_of_service: initialData?.years_of_service || "",
    military_specialty: initialData?.military_specialty || "",
    current_company: initialData?.current_company || "",
    job_title: initialData?.job_title || "",
    current_industry: initialData?.current_industry || "",
    previous_locations: initialData?.previous_locations || [],
    years_of_experience: initialData?.years_of_experience || "",
    expertise_areas: initialData?.expertise_areas || [],
    can_mentor_in: initialData?.can_mentor_in || [],
    mentoring_capacity: initialData?.mentoring_capacity || 3,
  });

  const [locationInput, setLocationInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addLocation = () => {
    if (locationInput.trim()) {
      setFormData({
        ...formData,
        previous_locations: [...formData.previous_locations, locationInput.trim()],
      });
      setLocationInput("");
    }
  };

  const removeLocation = (index: number) => {
    setFormData({
      ...formData,
      previous_locations: formData.previous_locations.filter((_, i) => i !== index),
    });
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
              placeholder="Tell us about your professional background and what makes you a great mentor..."
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

      {/* Professional Experience */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Professional Experience</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current_company" className="block text-sm font-medium mb-2">
                Current Company
              </label>
              <input
                id="current_company"
                type="text"
                value={formData.current_company}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="job_title" className="block text-sm font-medium mb-2">
                Current Role *
              </label>
              <input
                id="job_title"
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current_industry" className="block text-sm font-medium mb-2">
                Current Industry
              </label>
              <select
                id="current_industry"
                value={formData.current_industry}
                onChange={(e) => setFormData({ ...formData, current_industry: e.target.value })}
                className="input-field"
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="years_of_experience" className="block text-sm font-medium mb-2">
                Years of Professional Experience
              </label>
              <input
                id="years_of_experience"
                type="number"
                value={formData.years_of_experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    years_of_experience: e.target.value ? parseInt(e.target.value) : "",
                  })
                }
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Previous Work Locations (Cities/Regions)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                className="input-field flex-1"
                placeholder="e.g., Atlanta, GA"
              />
              <button
                type="button"
                onClick={addLocation}
                className="btn-secondary px-4"
              >
                Add
              </button>
            </div>
            {formData.previous_locations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.previous_locations.map((loc, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cobalt-blue/20 border border-brand-cobalt-blue rounded-full text-sm"
                  >
                    {loc}
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
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

      {/* Mentoring */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Mentoring Expertise</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Expertise Areas * (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EXPERTISE_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.expertise_areas.includes(area)}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        expertise_areas: toggleArrayItem(formData.expertise_areas, area),
                      })
                    }
                    className="w-4 h-4 text-brand-cobalt-blue bg-brand-dark-navy border-brand-slate-gray rounded focus:ring-brand-cobalt-blue"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Topics I Can Mentor In (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EXPERTISE_AREAS.map((topic) => (
                <label key={topic} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.can_mentor_in.includes(topic)}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        can_mentor_in: toggleArrayItem(formData.can_mentor_in, topic),
                      })
                    }
                    className="w-4 h-4 text-brand-cobalt-blue bg-brand-dark-navy border-brand-slate-gray rounded focus:ring-brand-cobalt-blue"
                  />
                  <span className="text-sm">{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="mentoring_capacity" className="block text-sm font-medium mb-2">
              How many students can you support?
            </label>
            <input
              id="mentoring_capacity"
              type="number"
              value={formData.mentoring_capacity}
              onChange={(e) =>
                setFormData({ ...formData, mentoring_capacity: parseInt(e.target.value) || 1 })
              }
              className="input-field"
              min="1"
              max="10"
            />
            <p className="text-xs text-brand-cool-gray mt-1">Typically 2-4 students per term</p>
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
