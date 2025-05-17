import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScoreScreen } from './ScoreScreen';
import { useNavigate } from 'react-router-dom';

interface Step {
  question: string;
  description?: string;
  type: 'single' | 'multiple';
  options: string[];
  maxSelections?: number;
  points?: Record<string, number>;
  dependsOn?: {
    question: number;
    answers: string[];
  };
}

const steps: Step[] = [
  {
    question: "Do you have a partner?",
    type: "single",
    options: ["Yes", "No"],
    points: {
      "Yes": 20,
      "No": 10
    }
  },
  {
    question: "Does your partner know where to find important documents?",
    type: "single",
    options: ["Yes, they know exactly where", "They have a general idea", "No, they don't know"],
    dependsOn: {
      question: 0,
      answers: ["Yes"]
    },
    points: {
      "Yes, they know exactly where": 50,
      "They have a general idea": 25,
      "No, they don't know": 0
    }
  },
  {
    question: "Do you have children? If so, what age groups?",
    type: "multiple",
    options: ["No children", "0-5 years", "6-12 years", "13-17 years", "18+ years"],
    maxSelections: 4,
    points: {
      "No children": 10,
      "0-5 years": 15,
      "6-12 years": 15,
      "13-17 years": 15,
      "18+ years": 15
    }
  },
  {
    question: "Do you have any dependents other than children?",
    type: "multiple",
    options: ["Elderly parents", "Disabled family member", "Other dependents", "No other dependents"],
    maxSelections: 3,
    points: {
      "Elderly parents": 20,
      "Disabled family member": 20,
      "Other dependents": 15,
      "No other dependents": 10
    }
  },
  {
    question: "What is your current housing situation?",
    type: "single",
    options: ["Own", "Rent", "Other"],
    points: {
      "Own": 30,
      "Rent": 20,
      "Other": 10
    }
  },
  {
    question: "How quickly can you access your property deed or rental agreement?",
    type: "single",
    options: ["Very fast - I know exactly where it is", "Takes some searching", "No idea where it is"],
    points: {
      "Very fast - I know exactly where it is": 40,
      "Takes some searching": 20,
      "No idea where it is": 0
    }
  },
  {
    question: "Which assets do you own?",
    type: "multiple",
    options: ["Car", "Other vehicle", "Small business", "Other real estate", "None of these"],
    maxSelections: 4,
    points: {
      "Car": 15,
      "Other vehicle": 15,
      "Small business": 25,
      "Other real estate": 25,
      "None of these": 5
    }
  },
  {
    question: "What types of insurance do you have?",
    type: "multiple",
    options: [
      "Health insurance",
      "Car insurance",
      "Property insurance",
      "Life insurance (through employer)",
      "Life insurance (standalone)",
      "Disability insurance",
      "Long-term care insurance",
      "None of these"
    ],
    maxSelections: 7,
    points: {
      "Health insurance": 15,
      "Car insurance": 15,
      "Property insurance": 15,
      "Life insurance (through employer)": 20,
      "Life insurance (standalone)": 25,
      "Disability insurance": 20,
      "Long-term care insurance": 20,
      "None of these": 0
    }
  },
  {
    question: "Does your family know about all your insurance policies?",
    type: "single",
    options: ["Yes, they know about all of them", "They know about some", "No, they don't know"],
    points: {
      "Yes, they know about all of them": 40,
      "They know about some": 20,
      "No, they don't know": 0
    }
  },
  {
    question: "Are you thinking about getting more insurance?",
    type: "single",
    options: ["Yes", "No", "Not sure"],
    points: {
      "Yes": 10,
      "No": 5,
      "Not sure": 5
    }
  },
  {
    question: "Which legal documents do you have?",
    type: "multiple",
    options: ["Will", "Power of Attorney", "Advance Directive", "Trust", "Other", "None of the above"],
    maxSelections: 5,
    points: {
      "Will": 30,
      "Power of Attorney": 30,
      "Advance Directive": 30,
      "Trust": 30,
      "Other": 15,
      "None of the above": 0
    }
  },
  {
    question: "Does someone you trust know where you keep the physical documents?",
    type: "single",
    options: ["All", "Some", "None"],
    points: {
      "All": 40,
      "Some": 20,
      "None": 0
    }
  },
  {
    question: "Are you thinking about obtaining legal documents you currently don't have?",
    type: "single",
    options: ["Yes", "No", "Not sure"],
    points: {
      "Yes": 10,
      "No": 5,
      "Not sure": 5
    }
  },
  {
    question: "What do you hope to get out of iDecide?",
    type: "multiple",
    options: [
      "Organize critical info, docs, and IDs",
      "Organize info of those in my care",
      "Make sure I have the right legal docs",
      "Make sure I have the right insurance policies",
      "Have a plan in case something happens to me",
      "A secure online vault with sharing capabilities",
      "Document my legacy and final wishes",
      "Unsure / Just exploring"
    ],
    maxSelections: 3,
    points: {
      "Organize critical info, docs, and IDs": 15,
      "Organize info of those in my care": 15,
      "Make sure I have the right legal docs": 15,
      "Make sure I have the right insurance policies": 15,
      "Have a plan in case something happens to me": 15,
      "A secure online vault with sharing capabilities": 15,
      "Document my legacy and final wishes": 15,
      "Unsure / Just exploring": 5
    }
  }
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showScore, setShowScore] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  const calculateScore = (allAnswers: Record<number, string | string[]>): number => {
    let totalScore = 0;
    Object.entries(allAnswers).forEach(([stepIndex, answer]) => {
      const step = steps[parseInt(stepIndex)];
      if (Array.isArray(answer)) {
        answer.forEach(option => {
          totalScore += step.points?.[option] || 0;
        });
      } else {
        totalScore += step.points?.[answer] || 0;
      }
    });
    return Math.min(totalScore, 500); // Cap at 500
  };

  const handleNext = async () => {
    const newAnswers = { ...answers, [currentStep]: currentQuestion.type === 'single' ? selectedOptions[0] : selectedOptions };
    setAnswers(newAnswers);

    if (currentStep === steps.length - 1) {
      const finalScore = calculateScore(newAnswers);
      setScore(finalScore);

      // Save answers and score to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email, // Add email to prevent not-null constraint violation
          has_partner: newAnswers[0] === 'Yes',
          partner_document_access: newAnswers[1] as string,
          children_age_groups: Array.isArray(newAnswers[2]) ? newAnswers[2] : [],
          dependents: Array.isArray(newAnswers[3]) ? newAnswers[3] : [],
          housing_status: newAnswers[4] as string,
          property_deed_access: newAnswers[5] as string,
          assets: Array.isArray(newAnswers[6]) ? newAnswers[6] : [],
          insurance_types: Array.isArray(newAnswers[7]) ? newAnswers[7] : [],
          family_policy_awareness: newAnswers[8] as string,
          wants_insurance: newAnswers[9] as string,
          legal_documents: Array.isArray(newAnswers[10]) ? newAnswers[10] : [],
          document_location_shared: newAnswers[11] as string,
          wants_legal_documents: newAnswers[12] as string,
          goals: Array.isArray(newAnswers[13]) ? newAnswers[13] : [],
          idecide_score: finalScore,
          last_score_update: new Date().toISOString(),
          onboarding_completed: true
        });

        if (error) {
          console.error('Error saving profile:', error);
        } else {
          // Sign out the user and redirect to login
          await supabase.auth.signOut();
          setShowCompletionMessage(true);
          setTimeout(() => {
            navigate('/');
          }, 5000);
        }
      }
      setShowScore(true);
    } else {
      // Find next applicable step
      let nextStep = currentStep + 1;
      while (nextStep < steps.length) {
        const step = steps[nextStep];
        if (!step.dependsOn || 
            (answers[step.dependsOn.question] && 
             step.dependsOn.answers.includes(answers[step.dependsOn.question] as string))) {
          break;
        }
        nextStep++;
      }
      setCurrentStep(nextStep);
      setSelectedOptions([]);
    }
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;
    while (prevStep >= 0) {
      const step = steps[prevStep];
      if (!step.dependsOn || 
          (answers[step.dependsOn.question] && 
           step.dependsOn.answers.includes(answers[step.dependsOn.question] as string))) {
        break;
      }
      prevStep--;
    }
    setCurrentStep(prevStep);
    setSelectedOptions(
      Array.isArray(answers[prevStep]) 
        ? answers[prevStep] as string[] 
        : answers[prevStep] 
          ? [answers[prevStep] as string]
          : []
    );
  };

  const currentQuestion = steps[currentStep];

  // Skip questions that don't apply based on previous answers
  if (currentQuestion.dependsOn) {
    const dependentAnswer = answers[currentQuestion.dependsOn.question];
    if (!currentQuestion.dependsOn.answers.includes(dependentAnswer as string)) {
      handleNext();
      return null;
    }
  }

  if (showCompletionMessage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your profile has been created successfully. Please log in with your credentials to access your dashboard.
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showScore) {
    return (
      <ScoreScreen 
        score={score} 
        onComplete={() => {
          // Sign out and redirect to login
          supabase.auth.signOut().then(() => {
            setShowCompletionMessage(true);
            setTimeout(() => {
              navigate('/');
            }, 5000);
          });
        }} 
      />
    );
  }

  const handleOptionClick = (option: string) => {
    if (currentQuestion.type === 'single') {
      setSelectedOptions([option]);
    } else {
      setSelectedOptions(prev => {
        if (prev.includes(option)) {
          return prev.filter(o => o !== option);
        } else {
          if (currentQuestion.maxSelections && prev.length >= currentQuestion.maxSelections) {
            return prev;
          }
          return [...prev, option];
        }
      });
    }
  };

  const isOptionSelected = (option: string) => selectedOptions.includes(option);
  const canContinue = selectedOptions.length > 0;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        <div className="mb-8">
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#1E1B4B] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500 text-center">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-4">
          {currentQuestion.question}
        </h2>

        {currentQuestion.description && (
          <p className="text-gray-600 text-center mb-6">
            {currentQuestion.description}
          </p>
        )}

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              disabled={currentQuestion.maxSelections && 
                selectedOptions.length >= currentQuestion.maxSelections && 
                !selectedOptions.includes(option)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200
                ${isOptionSelected(option)
                  ? 'border-[#1E1B4B] bg-[#1E1B4B] text-white shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 hover:border-[#1E1B4B] hover:shadow-sm'
                }
                ${currentQuestion.maxSelections && 
                  selectedOptions.length >= currentQuestion.maxSelections && 
                  !selectedOptions.includes(option)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-${currentQuestion.type === 'multiple' ? 'sm' : 'full'} border-2 mr-3 flex items-center justify-center
                  ${isOptionSelected(option)
                    ? 'border-white bg-white'
                    : 'border-gray-300 bg-white'
                  }`}
                >
                  {isOptionSelected(option) && (
                    <div className={`w-3 h-3 ${currentQuestion.type === 'multiple' ? 'bg-[#1E1B4B]' : 'rounded-full bg-[#1E1B4B]'}`} />
                  )}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>

        {currentQuestion.maxSelections && (
          <p className="text-sm text-gray-500 text-center mb-4">
            Selected {selectedOptions.length} of {currentQuestion.maxSelections} maximum
          </p>
        )}

        <div className="flex justify-between items-center">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-20" />
          )}

          <button
            onClick={handleNext}
            disabled={!canContinue}
            className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200
              ${canContinue
                ? 'bg-[#1E1B4B] text-white hover:bg-[#1E1B4B]/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <span>{currentStep === steps.length - 1 ? 'Finish' : 'Continue'}</span>
            <ChevronRight size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}