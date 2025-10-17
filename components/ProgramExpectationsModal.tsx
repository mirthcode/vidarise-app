"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  userRole: "student" | "mentor";
}

export default function ProgramExpectationsModal({ isOpen, onClose, onAccept, userRole }: Props) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-brand-dark-navy border border-brand-slate-gray rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b border-brand-slate-gray">
          <h2 className="text-2xl font-bold text-brand-cobalt-blue">MBV Cohort II Mentorship Program</h2>
          <p className="text-sm text-brand-cool-gray mt-1">Please review and acknowledge the program expectations</p>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold mb-2">Program Overview</h3>
            <p className="text-sm text-brand-cool-gray">
              The MBV Mentorship Program connects veterans and transitioning service members with experienced
              professionals who offer perspective, guidance, and encouragement as they navigate the next phase
              of their careers.
            </p>
            <p className="text-sm text-brand-cool-gray mt-2">
              Each mentor will be paired with one or more MBV students in <strong>Fall 2025</strong>, with the
              mentoring relationship continuing through <strong>graduation in May 2026</strong>.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Program Philosophy</h3>
            <p className="text-sm text-brand-cool-gray">
              The purpose of the MBV Mentorship Program is to help veterans pursue <em>meaningful</em> career
              paths that align with their values, strengths, and aspirations. Mentors play a vital role in
              helping students reflect deeply on what matters most and make informed choices that support
              long-term success and fulfillment.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              {userRole === "mentor" ? "Mentor Commitment" : "Meeting Expectations"}
            </h3>
            <p className="text-sm text-brand-cool-gray">
              Mentors and students should plan to meet regularly throughout the academic year, either in person
              or virtually, for conversations lasting 30 to 60 minutes. The frequency of meetings may vary based
              on schedules and mutual availability – ideally bi-weekly to monthly. These interactions are intended
              to foster learning, reflection, and professional growth through shared experience and dialogue.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Examples of Mentorship Topics</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-brand-cool-gray">
              <li>Clarifying personal and professional goals after military service</li>
              <li>Exploring career paths and industries aligned with individual strengths</li>
              <li>Building professional confidence and communication skills</li>
              <li>Strengthening networking approaches and personal branding</li>
              <li>Navigating organizational culture and civilian workplace dynamics</li>
              <li>Discussing leadership, growth, and long-term purpose</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded p-4">
            <h3 className="text-lg font-semibold mb-2 text-yellow-200">What the Program Is Not</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-100">
              <li>Mentors are not responsible for securing jobs, internships, or interviews for students</li>
              <li>Mentors are not expected or required to open their professional networks or make introductions</li>
              <li>The program is not a transactional exchange or placement service</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Program Expectations</h3>
            <p className="text-sm text-brand-cool-gray">
              {userRole === "mentor" ? (
                <>
                  All mentors participate on a volunteer basis. The most valuable mentoring relationships are
                  built on trust, consistency, and genuine interest in supporting student development.
                </>
              ) : (
                <>
                  Students are expected to approach each interaction with professionalism, preparation, and
                  respect for the mentor's time. The most valuable mentoring relationships are built on trust,
                  consistency, and genuine curiosity.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-brand-slate-gray">
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 mt-0.5"
            />
            <span className="text-sm">
              I have read and understand the MBV Cohort II Mentorship Program expectations. I acknowledge
              that this program focuses on mentorship and professional development, not job placement or
              networking introductions. I commit to participating in good faith and with respect for all
              program participants.
            </span>
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAccept}
              disabled={!agreed}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
