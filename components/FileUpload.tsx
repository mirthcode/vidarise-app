"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FileUploadProps {
  bucket: "profile-pictures" | "resumes";
  accept?: string;
  maxSizeMB?: number;
  currentFileUrl?: string;
  onUploadComplete: (url: string) => void;
  label: string;
  required?: boolean;
}

export default function FileUpload({
  bucket,
  accept,
  maxSizeMB = 5,
  currentFileUrl,
  onUploadComplete,
  label,
  required = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError("");
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create file path: userId/filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      let publicUrl: string;
      if (bucket === "profile-pictures") {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      } else {
        // For private buckets, store the path
        publicUrl = fileName;
      }

      onUploadComplete(publicUrl);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label} {required && "*"}
      </label>

      {currentFileUrl && bucket === "profile-pictures" && (
        <div className="mb-3">
          <img
            src={currentFileUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-brand-slate-gray"
          />
        </div>
      )}

      {currentFileUrl && bucket === "resumes" && (
        <div className="mb-3 p-3 bg-brand-slate-gray/30 rounded border border-brand-slate-gray">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-brand-cobalt-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-brand-cool-gray">Resume uploaded</span>
          </div>
        </div>
      )}

      <input
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        disabled={uploading}
        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-cobalt-blue file:text-white hover:file:bg-brand-deep-blue disabled:opacity-50"
      />

      {uploading && (
        <p className="mt-2 text-sm text-brand-cobalt-blue">Uploading...</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      <p className="mt-1 text-xs text-brand-cool-gray">
        Max file size: {maxSizeMB}MB
      </p>
    </div>
  );
}
