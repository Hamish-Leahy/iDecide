import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScoreScreenProps {
  score: number;
  onComplete: () => void;
}

export function ScoreScreen({ score, onComplete }: ScoreScreenProps) {
  const navigate = useNavigate();
  const maxScore = 500;
  const percentage = (score / maxScore) * 100;
  const arcLength = (percentage / 100) * 360;
  const scoreDescription = getScoreDescription(score);

  function getScoreDescription(score: number): { title: string; description: string } {
    if (score < 100) {
      return {
        title: "You're getting started",
        description: "Every journey begins with a first step and you just took yours. Now it's time to pick up the pace and watch your score go up!"
      };
    } else if (score < 250) {
      return {
        title: "You're making progress",
        description: "You're on the right track! Keep going to ensure your important information is organized and accessible."
      };
    } else if (score < 400) {
      return {
        title: "You're doing great",
        description: "You've made significant progress in organizing your life. Keep going to achieve even more peace of mind."
      };
    } else {
      return {
        title: "You're a planning pro",
        description: "Outstanding work! You've taken control of your important information and made it accessible to those who need it."
      };
    }
  }

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        <h1 className="text-3xl font-bold text-center mb-8">Your iDecide Score</h1>
        
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Score Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E5EDEB"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#4CAF50"
              strokeWidth="10"
              strokeDasharray={`${(arcLength / 360) * 283} 283`}
            />
          </svg>
          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold text-[#1E1B4B]">{score}</span>
            <div className="flex justify-between w-full px-4 mt-2">
              <span className="text-sm text-gray-500">0</span>
              <span className="text-sm text-gray-500">{maxScore}</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">{scoreDescription.title}</h2>
          <p className="text-gray-600">{scoreDescription.description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h3 className="font-semibold mb-2">About the score</h3>
          <p className="text-gray-600 text-sm">
            Your Score is based on positive planning habits. The more things you organize and document, 
            the more points you get. Keep improving your score by completing more sections in iDecide.
          </p>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-[#1E1B4B] text-white py-3 rounded-lg flex items-center justify-center font-semibold hover:bg-[#1E1B4B]/90 transition-colors"
        >
          Complete Onboarding
          <ArrowRight className="ml-2" size={20} />
        </button>
      </div>
    </div>
  );
}