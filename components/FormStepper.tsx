"use client";

interface Step {
  number: number;
  title: string;
  completed: boolean;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function FormStepper({ steps, currentStep }: FormStepperProps) {
  return (
    <div className="mb-8">
      <div className="relative flex justify-between items-center">
        {/* Connector line background */}
        <div className="absolute left-0 right-0 top-5 h-1 bg-brand-slate-gray" style={{ transform: 'translateY(-50%)' }} />

        {steps.map((step) => (
          <div key={step.number} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step.number === currentStep
                  ? "bg-brand-cobalt-blue text-white"
                  : step.completed
                  ? "bg-green-600 text-white"
                  : "bg-brand-slate-gray text-brand-cool-gray"
              }`}
            >
              {step.completed ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <div className="mt-2 text-xs text-center hidden md:block whitespace-nowrap">
              <div className={`font-medium ${step.number === currentStep ? "text-brand-cobalt-blue" : "text-brand-cool-gray"}`}>
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center md:hidden">
        <div className="text-sm font-medium text-brand-cobalt-blue">
          {steps.find(s => s.number === currentStep)?.title}
        </div>
      </div>
    </div>
  );
}
