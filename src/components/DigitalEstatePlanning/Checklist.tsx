import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  suggested_action?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const defaultChecklist: Omit<ChecklistItem, 'id'>[] = [
  {
    title: 'Create Password Manager',
    description: 'Set up a secure password manager to store all your digital credentials.',
    completed: false,
    category: 'security'
  },
  {
    title: 'Document Email Accounts',
    description: 'List all your email accounts and their recovery information.',
    completed: false,
    category: 'accounts'
  },
  {
    title: 'Social Media Inventory',
    description: 'Create an inventory of all your social media accounts.',
    completed: false,
    category: 'accounts'
  },
  {
    title: 'Financial Accounts List',
    description: 'Document all online banking and investment accounts.',
    completed: false,
    category: 'financial'
  },
  {
    title: 'Digital Storage Review',
    description: 'Review and organize cloud storage accounts and important files.',
    completed: false,
    category: 'storage'
  },
  {
    title: 'Subscription Audit',
    description: 'List all digital subscriptions and recurring payments.',
    completed: false,
    category: 'financial'
  },
  {
    title: 'Device Backup Plan',
    description: 'Create a backup plan for all your important devices.',
    completed: false,
    category: 'security'
  },
  {
    title: 'Digital Assets Inventory',
    description: 'Document cryptocurrency, domain names, and other digital assets.',
    completed: false,
    category: 'assets'
  },
  {
    title: 'Legacy Contact Setup',
    description: 'Designate legacy contacts for your important accounts.',
    completed: false,
    category: 'planning'
  },
  {
    title: 'Digital Will Creation',
    description: 'Create instructions for handling your digital assets.',
    completed: false,
    category: 'planning'
  }
];

export function Checklist() {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('checklist_categories')
        .select('*')
        .order('priority');
        
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Then load checklist items
      const { data: checklistData, error: checklistError } = await supabase
        .from('digital_checklist')
        .select('*')
        .eq('user_id', user?.id);

      if (checklistError) throw checklistError;

      if (!checklistData || checklistData.length === 0) {
        // Initialize with default checklist
        const { data: newData, error: insertError } = await supabase
          .from('digital_checklist')
          .insert(
            defaultChecklist.map(item => ({
              ...item,
              user_id: user?.id
            }))
          )
          .select();

        if (insertError) throw insertError;
        setChecklist(newData || []);
      } else {
        setChecklist(checklistData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(id: string) {
    try {
      const item = checklist.find(i => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('digital_checklist')
        .update({ completed: !item.completed })
        .eq('id', id);

      if (error) throw error;

      setChecklist(prev =>
        prev.map(i =>
          i.id === id ? { ...i, completed: !i.completed } : i
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  }

  // Group checklist items by category
  const checklistByCategory = checklist.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const progress = Math.round(
    (checklist.filter(item => item.completed).length / checklist.length) * 100
  ) || 0;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Digital Estate Checklist</h2>
        <p className="text-gray-600 mt-1">Track your progress in organizing your digital estate</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(category => {
          const categoryItems = checklistByCategory[category.name.toLowerCase()] || [];
          if (categoryItems.length === 0) return null;
          
          return (
            <div key={category.id} className="space-y-4">
              <h3 className="text-lg font-medium">{category.name}</h3>
              <div className="grid gap-4">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`
                      bg-white rounded-lg border p-4 transition-all duration-200
                      ${item.completed ? 'border-green-200 bg-green-50' : 'hover:border-gray-300'}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`
                          mt-1 w-5 h-5 rounded flex items-center justify-center border
                          ${item.completed
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 hover:border-[#1E1B4B]'
                          }
                        `}
                      >
                        {item.completed && <Check size={12} />}
                      </button>
                      <div>
                        <h4 className={`font-medium ${item.completed ? 'text-green-800' : 'text-gray-900'}`}>
                          {item.title}
                        </h4>
                        <p className={`text-sm mt-1 ${item.completed ? 'text-green-600' : 'text-gray-600'}`}>
                          {item.description}
                        </p>
                        {item.suggested_action && !item.completed && (
                          <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                            {item.suggested_action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}