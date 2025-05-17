import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LifeBuoy, 
  FileText, 
  DollarSign, 
  Users, 
  Calendar, 
  BarChart4, 
  AlertCircle, 
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

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
}

interface ServiceProvider {
  id: string;
  name: string;
  services: string[];
  status: 'active' | 'inactive';
}

export function NDISDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<NDISPlan | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load NDIS plan from database
        const { data: planData, error: planError } = await supabase
          .from('insurance_policies')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'ndis')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (planError && planError.code !== 'PGRST116') {
          throw planError;
        }
        
        if (planData) {
          // Use actual data from database
          setPlan({
            id: planData.id,
            ndis_number: planData.ndis_number || '12345678901',
            plan_start_date: planData.plan_start_date || '2025-01-01',
            plan_end_date: planData.plan_end_date || '2025-12-31',
            plan_manager: planData.plan_manager || 'agency',
            support_coordinator: planData.support_coordinator,
            funding_categories: planData.funding_categories || [
              { category: 'Core', amount: '25000', used: '8500' },
              { category: 'Capacity Building', amount: '15000', used: '4200' },
              { category: 'Capital', amount: '8500', used: '1200' }
            ]
          });
          
          console.log("Loaded NDIS plan from database:", planData);
        } else {
          // No plan found in database, use mock data
          console.log("No NDIS plan found in database, using mock data");
          setPlan({
            id: 'mock-plan',
            ndis_number: '12345678901',
            plan_start_date: '2025-01-01',
            plan_end_date: '2025-12-31',
            plan_manager: 'agency',
            support_coordinator: 'Jane Smith',
            funding_categories: [
              { category: 'Core', amount: '25000', used: '8500' },
              { category: 'Capacity Building', amount: '15000', used: '4200' },
              { category: 'Capital', amount: '8500', used: '1200' }
            ]
          });
        }
        
        // Mock service providers for now
        // In a real app, you would fetch these from a service_providers table
        setProviders([
          {
            id: '1',
            name: 'Sunshine Support Services',
            services: ['Personal Care', 'Community Access'],
            status: 'active'
          },
          {
            id: '2',
            name: 'Mobility Solutions',
            services: ['Assistive Technology', 'Home Modifications'],
            status: 'active'
          },
          {
            id: '3',
            name: 'Therapy Connect',
            services: ['Occupational Therapy', 'Speech Therapy'],
            status: 'active'
          }
        ]);
        
        // Mock upcoming appointments
        // In a real app, you would fetch these from an appointments table
        setUpcomingAppointments([
          {
            id: '1',
            title: 'Occupational Therapy Session',
            provider: 'Therapy Connect',
            date: new Date(Date.now() + 86400000 * 2), // 2 days from now
            location: 'Therapy Connect Office'
          },
          {
            id: '2',
            title: 'Plan Review Meeting',
            provider: 'NDIS',
            date: new Date(Date.now() + 86400000 * 14), // 14 days from now
            location: 'NDIS Office'
          }
        ]);
        
      } catch (err) {
        console.error('Error loading NDIS data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load NDIS data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

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

  const getDaysRemaining = () => {
    if (!plan) return 0;
    const endDate = new Date(plan.plan_end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-2xl font-semibold mb-2">NDIS Dashboard</h1>
        <p className="text-gray-600">
          Track and manage your NDIS plan, funding, and supports
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Plan Details</h3>
              <p className="text-sm text-gray-500">NDIS Number: {plan?.ndis_number}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">{plan ? formatDate(plan.plan_start_date) : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">End Date:</span>
              <span className="font-medium">{plan ? formatDate(plan.plan_end_date) : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Days Remaining:</span>
              <span className="font-medium">{getDaysRemaining()} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan Manager:</span>
              <span className="font-medium capitalize">
                {plan?.plan_manager === 'agency' ? 'NDIA Managed' : 
                 plan?.plan_manager === 'plan_managed' ? 'Plan Managed' : 
                 plan?.plan_manager === 'self_managed' ? 'Self Managed' : 
                 plan?.plan_manager || 'N/A'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/ndis/plan')}
          >
            View Plan Details
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Budget Overview</h3>
              <p className="text-sm text-gray-500">{getPercentageUsed()}% of funds used</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Total Budget:</span>
              <span className="text-sm font-medium">${getTotalBudget().toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${getPercentageUsed()}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">Used: ${getTotalUsed().toLocaleString()}</span>
              <span className="text-xs text-gray-500">Remaining: ${(getTotalBudget() - getTotalUsed()).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            {plan?.funding_categories.map((category, index) => (
              <div key={index} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">{category.category}:</span>
                  <span className="font-medium">${parseFloat(category.used).toLocaleString()} / ${parseFloat(category.amount).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
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

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/ndis/budget')}
          >
            View Budget Details
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upcoming Appointments</h3>
              <p className="text-sm text-gray-500">{upcomingAppointments.length} scheduled</p>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="text-purple-500 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-medium text-gray-900">{appointment.title}</p>
                    <p className="text-xs text-gray-500">
                      {appointment.date.toLocaleDateString()} with {appointment.provider}
                    </p>
                    {appointment.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        Location: {appointment.location}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No upcoming appointments
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/ndis/coordination')}
          >
            Manage Appointments
          </Button>
        </motion.div>
      </div>

      {/* Service Providers */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Service Providers</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/ndis/providers')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map(provider => (
              <div key={provider.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-indigo-500" size={18} />
                  <h3 className="font-medium text-gray-900">{provider.name}</h3>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-gray-600">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.services.map((service, index) => (
                      <span key={index} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    provider.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {provider.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                    Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
              <Plus className="text-gray-400 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-700">Add New Provider</p>
              <p className="text-xs text-gray-500 mt-1">Add a new service provider to your plan</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/dashboard/ndis/providers')}
              >
                Add Provider
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan Progress */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Plan Progress</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Plan Utilization</span>
                <span className="text-sm font-medium text-gray-700">{getPercentageUsed()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getPercentageUsed()}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Plan Milestones</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-medium text-gray-900">Plan Approved</p>
                      <p className="text-xs text-gray-500">Completed on {formatDate(plan?.plan_start_date || '')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-medium text-gray-900">Service Agreements Signed</p>
                      <p className="text-xs text-gray-500">Completed with 3 providers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-[18px] h-[18px] border-2 border-amber-500 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Mid-Plan Review</p>
                      <p className="text-xs text-gray-500">Scheduled for {formatDate('2025-06-15')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div>
                      <p className="font-medium text-gray-900">Plan Renewal</p>
                      <p className="text-xs text-gray-500">Due on {plan ? formatDate(plan.plan_end_date) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Support Utilization</h3>
                <div className="space-y-3">
                  {plan?.funding_categories.map((category, index) => {
                    const percentUsed = parseFloat(category.amount) > 0 
                      ? Math.round((parseFloat(category.used) / parseFloat(category.amount)) * 100)
                      : 0;
                      
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">{category.category}</span>
                          <span className="text-sm text-gray-600">{percentUsed}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              category.category === 'Core' ? 'bg-blue-500' :
                              category.category === 'Capacity Building' ? 'bg-purple-500' :
                              'bg-amber-500'
                            }`} 
                            style={{ width: `${percentUsed}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-1">
                    <AlertCircle size={16} />
                    <span className="font-medium">Utilization Alert</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Your Core Supports utilization is below the expected rate. Consider reviewing your support schedule to ensure you're getting the supports you need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}