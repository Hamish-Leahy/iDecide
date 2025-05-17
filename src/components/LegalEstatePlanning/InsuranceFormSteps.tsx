import React from 'react';

interface Step {
  title: string;
  description?: string;
  component: React.ReactNode;
}

interface InsuranceFormStepsProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  loading?: boolean;
}

export function InsuranceFormSteps({
  steps,
  currentStep,
  onNext,
  onBack,
  onSave,
  loading = false
}: InsuranceFormStepsProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
          />
        </div>
      </div>

      {/* Step Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {steps[currentStep].title}
        </h2>
        {steps[currentStep].description && (
          <p className="mt-1 text-sm text-gray-500">
            {steps[currentStep].description}
          </p>
        )}
      </div>

      {/* Step Content */}
      <div className="mt-4">
        {steps[currentStep].component}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
            ${currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Back
        </button>
        <div className="space-x-2">
          {currentStep === steps.length - 1 ? (
            <button
              onClick={onSave}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Policy'}
            </button>
          ) : (
            <button
              onClick={onNext}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}