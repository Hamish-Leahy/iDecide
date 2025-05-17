import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Laptop,
  DollarSign,
  FileText,
  Smartphone,
  Heart,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Tip {
  id: string;
  category: string;
  title: string;
  content: string;
  priority: number;
  action_url: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: number;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  priority: number;
  suggested_action?: string;
}

const iconMap: Record<string, LucideIcon> = {
  laptop: Laptop,
  'dollar-sign': DollarSign,
  'file-text': FileText,
  smartphone: Smartphone,
  heart: Heart,
  shield: Shield
};

export function Dashboard() {
  const { user, profile } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [tipsData, categoriesData, checklistData] = await Promise.all([
        supabase.from('digital_tips').select('*').order('priority'),
        supabase.from('checklist_categories').select('*').order('priority'),
        supabase.from('digital_checklist').select('*').eq('user_id', user?.id)
      ]);

      if (tipsData.error) throw tipsData.error;
      if (categoriesData.error) throw categoriesData.error;
      if (checklistData.error) throw checklistData.error;

      setTips(tipsData.data || []);
      setCategories(categoriesData.data || []);
      setChecklist(checklistData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100">
        <h1 className="text-2xl font-semibold mb-2">Digital Estate Dashboard</h1>
        <p className="text-gray-600">
          Track and manage your digital legacy. Complete the checklist to ensure nothing is overlooked.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const Icon = iconMap[category.icon] || Shield;
          const categoryItems = checklist.filter(item => item.category === category.name);
          const completedItems = categoryItems.filter(item => item.completed);
          const progress = categoryItems.length ? 
            Math.round((completedItems.length / categoryItems.length) * 100) : 0;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="text-gray-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{progress}%</span>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {completedItems.length} of {categoryItems.length} completed
                </span>
                {progress < 100 && (
                  <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Continue <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Tips & Recommendations</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {tip.priority === 1 ? (
                  <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
                ) : (
                  <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.content}</p>
                  {tip.action_url && (
                    <a 
                      href={tip.action_url}
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Take action <ChevronRight size={16} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
    </div>
  );
}