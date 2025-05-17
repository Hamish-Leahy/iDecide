import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  Edit, 
  Download, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  X 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface NDISPlan {
  id: string;
  ndis_number: string;
  plan_start_date: string;
  plan_end_date: string;
  plan_manager: string;
  support_coordinator?: string;
  funding_categories: Array<{
    category: string;
    amount: string;
    used: string;
  }>;
  notes?: string;
}

export function PlanDetails() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<NDISPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    ndis_number: '',
    plan_start_date: '',
    plan_end_date: '',
    plan_manager: 'agency',
    support_coordinator: '',
    notes: '',
    funding_categories: [
      { category: 'Core', amount: '', used: '' },
      { category: 'Capacity Building', amount: '', used: '' },
      { category: 'Capital', amount: '', used: '' }
    ]
  });

  useEffect(() => {
    const loadPlan = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load NDIS plan
        const { data, error } = await supabase
          .from('insurance_policies')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'ndis')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          const planData = {
            id: data.id,
            ndis_number: data.ndis_number || '',
            plan_start_date: data.plan_start_date || '',
            plan_end_date: data.plan_end_date || '',
            plan_manager: data.plan_manager || '',
            support_coordinator: data.support_coordinator,
            funding_categories: data.funding_categories || [],
            notes: data.notes
          };
          setPlan(planData);
          setFormData({
            ndis_number: planData.ndis_number,
            plan_start_date: planData.plan_start_date,
            plan_end_date: planData.plan_end_date,
            plan_manager: planData.plan_manager,
            support_coordinator: planData.support_coordinator || '',
            notes: planData.notes || '',
            funding_categories: planData.funding_categories
          });
        } else {
          setPlan(null);
          setFormData({
            ndis_number: '',
            plan_start_date: '',
            plan_end_date: '',
            plan_manager: 'agency',
            support_coordinator: '',
            notes: '',
            funding_categories: [
              { category: 'Core', amount: '', used: '' },
              { category: 'Capacity Building', amount: '', used: '' },
              { category: 'Capital', amount: '', used: '' }
            ]
          });
        }
      } catch (err) {
        console.error('Error loading NDIS plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to load NDIS plan');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlan();
  }, [user]);

  const handleSavePlan = async () => {
    if (!user) return;
    
    try {
      const planData = {
        user_id: user.id,
        type: 'ndis',
        provider: 'NDIS',
        policy_number: formData.ndis_number,
        status: 'active',
        coverage_amount: formData.funding_categories.reduce((sum, cat) => sum + parseFloat(cat.amount), 0).toString(),
        premium: '0', // NDIS plans don't have premiums
        payment_frequency: 'annually',
        start_date: formData.plan_start_date,
        renewal_date: formData.plan_end_date,
        ndis_number: formData.ndis_number,
        plan_start_date: formData.plan_start_date,
        plan_end_date: formData.plan_end_date,
        plan_manager: formData.plan_manager,
        support_coordinator: formData.support_coordinator,
        funding_categories: formData.funding_categories,
        notes: formData.notes
      };
      
      if (plan && plan.id !== 'mock-plan') {
        // Update existing plan
        const { error } = await supabase
          .from('insurance_policies')
          .update(planData)
          .eq('id', plan.id);
          
        if (error) throw error;
      } else {
        // Create new plan
        const { data, error } = await supabase
          .from('insurance_policies')
          .insert([planData])
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          setPlan({
            id: data.id,
            ndis_number: data.ndis_number,
            plan_start_date: data.plan_start_date,
            plan_end_date: data.plan_end_date,
            plan_manager: data.plan_manager,
            support_coordinator: data.support_coordinator,
            funding_categories: data.funding_categories,
            notes: data.notes
          });
        }
      }
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Error saving NDIS plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to save NDIS plan');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!plan) return 0;
    const endDate = new Date(plan.plan_end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalBudget = () => {
    if (!plan) return 0;
    return plan.funding_categories.reduce((sum, category) => {
      return sum + parseFloat(category.amount);
    }, 0);
  };

  const getTotalUsed = () => {
    if (!plan) return 0;
    return plan.funding_categories.reduce((sum, category) => {
      return sum + parseFloat(category.used);
    }, 0);
  };

  const getPercentageUsed = () => {
    const total = getTotalBudget();
    const used = getTotalUsed();
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const getPlanManagerLabel = (type: string) => {
    switch (type) {
      case 'agency':
        return 'NDIA Managed';
      case 'plan_managed':
        return 'Plan Managed';
      case 'self_managed':
        return 'Self Managed';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NDIS Plan Details</h1>
          <p className="text-gray-600 mt-1">View and manage your NDIS plan information</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowEditModal(true)}
          icon={<Edit size={20} />}
        >
          Edit Plan
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Plan Overview Card */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">NDIS Plan Overview</h2>
                <p className="text-gray-600 mt-1">NDIS Number: {plan?.ndis_number}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={16} />}
            >
              Download Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Plan Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan Start Date:</span>
                    <span className="font-medium">{plan ? formatDate(plan.plan_start_date) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan End Date:</span>
                    <span className="font-medium">{plan ? formatDate(plan.plan_end_date) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Remaining:</span>
                    <span className="font-medium">{getDaysRemaining()} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan Manager:</span>
                    <span className="font-medium">{plan ? getPlanManagerLabel(plan.plan_manager) : 'N/A'}</span>
                  </div>
                  {plan?.support_coordinator && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Support Coordinator:</span>
                      <span className="font-medium">{plan.support_coordinator}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Plan Timeline</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="relative pl-10 pb-6">
                      <div className="absolute left-0 w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                        <CheckCircle className="text-green-500" size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Plan Approved</p>
                        <p className="text-xs text-gray-500">{plan ? formatDate(plan.plan_start_date) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="relative pl-10 pb-6">
                      <div className="absolute left-0 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                        <Clock className="text-blue-500" size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Mid-Plan Review</p>
                        <p className="text-xs text-gray-500">
                          {plan ? formatDate(new Date(new Date(plan.plan_start_date).getTime() + (new Date(plan.plan_end_date).getTime() - new Date(plan.plan_start_date).getTime()) / 2).toISOString()) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative pl-10">
                      <div className="absolute left-0 w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                        <Calendar className="text-gray-500" size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Plan End Date</p>
                        <p className="text-xs text-gray-500">{plan ? formatDate(plan.plan_end_date) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Funding Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Total Plan Budget:</span>
                      <span className="font-medium">${getTotalBudget().toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentageUsed()}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">Used: ${getTotalUsed().toLocaleString()} ({getPercentageUsed()}%)</span>
                      <span className="text-xs text-gray-500">Remaining: ${(getTotalBudget() - getTotalUsed()).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {plan?.funding_categories.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">{category.category}:</span>
                          <div className="text-right">
                            <span className="font-medium">${parseFloat(category.amount).toLocaleString()}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              (${parseFloat(category.used).toLocaleString()} used)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              category.category === 'Core' ? 'bg-blue-500' :
                              category.category === 'Capacity Building' ? 'bg-purple-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${(parseFloat(category.used) / parseFloat(category.amount)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Plan Management</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="text-indigo-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Plan Management Type</p>
                      <p className="text-sm text-gray-600">{plan ? getPlanManagerLabel(plan.plan_manager) : 'N/A'}</p>
                    </div>
                  </div>
                  
                  {plan?.support_coordinator && (
                    <div className="flex items-center gap-3">
                      <Users className="text-green-600" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Support Coordinator</p>
                        <p className="text-sm text-gray-600">{plan.support_coordinator}</p>
                      </div>
                    </div>
                  )}
                  
                  {plan?.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Plan Notes</p>
                      <p className="text-xs text-blue-700">{plan.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit NDIS Plan"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NDIS Number
              </label>
              <input
                type="text"
                value={formData.ndis_number}
                onChange={(e) => setFormData({ ...formData, ndis_number: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Manager
              </label>
              <select
                value={formData.plan_manager}
                onChange={(e) => setFormData({ ...formData, plan_manager: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="agency">NDIA Managed</option>
                <option value="plan_managed">Plan Managed</option>
                <option value="self_managed">Self Managed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Start Date
              </label>
              <input
                type="date"
                value={formData.plan_start_date}
                onChange={(e) => setFormData({ ...formData, plan_start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan End Date
              </label>
              <input
                type="date"
                value={formData.plan_end_date}
                onChange={(e) => setFormData({ ...formData, plan_end_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Support Coordinator
            </label>
            <input
              type="text"
              value={formData.support_coordinator}
              onChange={(e) => setFormData({ ...formData, support_coordinator: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter support coordinator name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Categories
            </label>
            {formData.funding_categories.map((category, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{category.category}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Total Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="text"
                        value={category.amount}
                        onChange={(e) => {
                          const newCategories = [...formData.funding_categories];
                          newCategories[index].amount = e.target.value;
                          setFormData({ ...formData, funding_categories: newCategories });
                        }}
                        className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Amount Used
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="text"
                        value={category.used}
                        onChange={(e) => {
                          const newCategories = [...formData.funding_categories];
                          newCategories[index].used = e.target.value;
                          setFormData({ ...formData, funding_categories: newCategories });
                        }}
                        className="w-full p-2 pl-7 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes about the plan"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePlan}
            >
              Save Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}