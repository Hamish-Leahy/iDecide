import React, { useState, useEffect } from 'react';
import { Award, ArrowUp, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface IDecideScoreWidgetProps {
  className?: string;
}

export function IDecideScoreWidget({ className = '' }: IDecideScoreWidgetProps) {
  const { user, profile } = useAuth();
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  useEffect(() => {
    const loadScoreData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get current score from profile
        if (profile?.idecide_score) {
          setScore(profile.idecide_score);
          // Mock previous score for demonstration
          setPreviousScore(profile.idecide_score - Math.floor(Math.random() * 20));
        }
        
        // Load recommendations based on user's data
        const [passwordsResponse, documentsResponse, contactsResponse] = await Promise.all([
          supabase.from('digital_assets').select('count').eq('user_id', user.id).eq('type', 'password'),
          supabase.from('legal_documents').select('count').eq('user_id', user.id),
          supabase.from('contacts').select('count').eq('user_id', user.id).eq('is_deputy', true)
        ]);
        
        const passwordCount = passwordsResponse.count || 0;
        const documentCount = documentsResponse.count || 0;
        const deputyCount = contactsResponse.count || 0;
        
        // Generate recommendations based on counts
        const newRecommendations: string[] = [];
        
        if (passwordCount < 5) {
          newRecommendations.push('Add more passwords to your vault');
        }
        
        if (documentCount < 3) {
          newRecommendations.push('Create essential legal documents');
        }
        
        if (deputyCount < 1) {
          newRecommendations.push('Designate at least one trusted deputy');
        }
        
        // Always include some general recommendations
        if (newRecommendations.length < 3) {
          const generalRecs = [
            'Complete your digital estate checklist',
            'Review your emergency contacts',
            'Update your medical information',
            'Check your financial accounts',
            'Review your digital asset inventory'
          ];
          
          while (newRecommendations.length < 3) {
            const randomRec = generalRecs[Math.floor(Math.random() * generalRecs.length)];
            if (!newRecommendations.includes(randomRec)) {
              newRecommendations.push(randomRec);
            }
          }
        }
        
        setRecommendations(newRecommendations);
      } catch (error) {
        console.error('Error loading iDecide score data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadScoreData();
  }, [user, profile]);
  
  const getScoreColor = () => {
    if (score >= 400) return 'text-green-600';
    if (score >= 250) return 'text-blue-600';
    if (score >= 100) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getScoreLabel = () => {
    if (score >= 400) return 'Planning Pro';
    if (score >= 250) return 'Well Prepared';
    if (score >= 100) return 'Making Progress';
    return 'Getting Started';
  };
  
  const getScoreDescription = () => {
    if (score >= 400) {
      return "You've taken excellent steps to prepare your digital estate!";
    }
    if (score >= 250) {
      return "You're well on your way to having a complete plan.";
    }
    if (score >= 100) {
      return "You've made a good start on your preparedness journey.";
    }
    return "Let's start building your preparedness plan.";
  };
  
  const scoreChange = score - previousScore;
  const scorePercentage = (score / 500) * 100;

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award size={18} className="text-[#1E1B4B]" />
            iDecide Score
          </h3>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <div className="h-24 bg-gray-100 rounded-lg"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
                  <span className="text-sm text-gray-500">/ 500</span>
                  {scoreChange > 0 && (
                    <span className="flex items-center text-xs text-green-600">
                      <ArrowUp size={12} />
                      +{scoreChange}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  score >= 400 ? 'bg-green-100 text-green-800' :
                  score >= 250 ? 'bg-blue-100 text-blue-800' :
                  score >= 100 ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getScoreLabel()}
                </span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    score >= 400 ? 'bg-green-600' :
                    score >= 250 ? 'bg-blue-600' :
                    score >= 100 ? 'bg-amber-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                {getScoreDescription()}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Improve Your Score</h4>
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-[#F5F8F7]">
                  <Info size={16} className="text-[#1E1B4B] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <a 
                href="/dashboard/digital/checklist" 
                className="text-xs text-[#1E1B4B] hover:text-[#2D2A6A] flex items-center gap-1"
              >
                <CheckCircle size={12} />
                <span>Complete more tasks to improve your score</span>
              </a>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}