import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  BarChart4, 
  PieChart, 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Filter 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface BudgetCategory {
  category: string;
  amount: string;
  used: string;
  remaining: string;
  percentUsed: number;
}

interface Transaction {
  id: string;
  date: string;
  provider: string;
  service: string;
  category: string;
  amount: number;
  status: 'pending' | 'processed' | 'cancelled';
  notes?: string;
}

export function BudgetTracker() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    provider: '',
    service: '',
    category: '',
    amount: '',
    status: 'pending' as 'pending' | 'processed' | 'cancelled',
    notes: ''
  });

  useEffect(() => {
    const loadBudgetData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load NDIS plan to get budget categories from the database
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
        
        // Process budget categories
        let categories: BudgetCategory[] = [];
        
        if (planData?.funding_categories) {
          console.log("Loaded funding categories from database:", planData.funding_categories);
          
          categories = planData.funding_categories.map((cat: any) => {
            const amount = parseFloat(cat.amount);
            const used = parseFloat(cat.used);
            const remaining = amount - used;
            const percentUsed = amount > 0 ? (used / amount) * 100 : 0;
            
            return {
              category: cat.category,
              amount: amount.toFixed(2),
              used: used.toFixed(2),
              remaining: remaining.toFixed(2),
              percentUsed: Math.round(percentUsed)
            };
          });
        } else {
          // Mock data for demonstration if no plan exists
          categories = [
            {
              category: 'Core',
              amount: '25000.00',
              used: '8500.00',
              remaining: '16500.00',
              percentUsed: 34
            },
            {
              category: 'Capacity Building',
              amount: '15000.00',
              used: '4200.00',
              remaining: '10800.00',
              percentUsed: 28
            },
            {
              category: 'Capital',
              amount: '8500.00',
              used: '1200.00',
              remaining: '7300.00',
              percentUsed: 14
            }
          ];
        }
        
        setBudgetCategories(categories);
        
        // Set initial form category if categories exist
        if (categories.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: categories[0].category
          }));
        }
        
        // Mock transactions for demonstration
        // In a real app, you would fetch these from a transactions table
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            date: '2025-04-15',
            provider: 'Sunshine Support Services',
            service: 'Personal Care',
            category: 'Core',
            amount: 120.00,
            status: 'processed',
            notes: 'Weekly personal care support'
          },
          {
            id: '2',
            date: '2025-04-12',
            provider: 'Therapy Connect',
            service: 'Occupational Therapy',
            category: 'Capacity Building',
            amount: 180.00,
            status: 'processed',
            notes: 'Initial assessment'
          },
          {
            id: '3',
            date: '2025-04-10',
            provider: 'Mobility Solutions',
            service: 'Assistive Technology',
            category: 'Capital',
            amount: 450.00,
            status: 'processed',
            notes: 'Wheelchair maintenance'
          },
          {
            id: '4',
            date: '2025-04-08',
            provider: 'Community Inclusion Group',
            service: 'Community Access',
            category: 'Core',
            amount: 95.00,
            status: 'processed',
            notes: 'Community outing'
          },
          {
            id: '5',
            date: '2025-04-05',
            provider: 'Sunshine Support Services',
            service: 'Personal Care',
            category: 'Core',
            amount: 120.00,
            status: 'processed',
            notes: 'Weekly personal care support'
          },
          {
            id: '6',
            date: '2025-04-02',
            provider: 'Therapy Connect',
            service: 'Speech Therapy',
            category: 'Capacity Building',
            amount: 160.00,
            status: 'processed',
            notes: 'Regular session'
          },
          {
            id: '7',
            date: '2025-04-20',
            provider: 'Home Care Plus',
            service: 'Cleaning',
            category: 'Core',
            amount: 85.00,
            status: 'pending',
            notes: 'Scheduled cleaning service'
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (err) {
        console.error('Error loading budget data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };
    
    loadBudgetData();
  }, [user]);

  const handleAddTransaction = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      provider: '',
      service: '',
      category: budgetCategories.length > 0 ? budgetCategories[0].category : '',
      amount: '',
      status: 'pending',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleSaveTransaction = async () => {
    // Validate form
    if (!formData.provider || !formData.service || !formData.category || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      // Create new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: formData.date,
        provider: formData.provider,
        service: formData.service,
        category: formData.category,
        amount: parseFloat(formData.amount),
        status: formData.status,
        notes: formData.notes
      };
      
      // Add to transactions list
      setTransactions([newTransaction, ...transactions]);
      
      // Update budget category used amount in the database
      const { data: planData, error: fetchError } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'ndis')
        .single();
        
      if (fetchError) throw fetchError;
      
      if (planData) {
        // Update the funding categories
        const updatedCategories = planData.funding_categories.map((cat: any) => {
          if (cat.category === formData.category) {
            const newUsed = parseFloat(cat.used) + parseFloat(formData.amount);
            return {
              ...cat,
              used: newUsed.toString()
            };
          }
          return cat;
        });
        
        // Update the database
        const { error: updateError } = await supabase
          .from('insurance_policies')
          .update({
            funding_categories: updatedCategories
          })
          .eq('id', planData.id);
          
        if (updateError) throw updateError;
        
        // Update local state
        setBudgetCategories(categories => 
          categories.map(cat => {
            if (cat.category === formData.category) {
              const newUsed = parseFloat(cat.used) + parseFloat(formData.amount);
              const newRemaining = parseFloat(cat.amount) - newUsed;
              const newPercentUsed = (newUsed / parseFloat(cat.amount)) * 100;
              
              return {
                ...cat,
                used: newUsed.toFixed(2),
                remaining: newRemaining.toFixed(2),
                percentUsed: Math.round(newPercentUsed)
              };
            }
            return cat;
          })
        );
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
    }
  };

  const getTotalBudget = () => {
    return budgetCategories.reduce((sum, category) => sum + parseFloat(category.amount), 0);
  };

  const getTotalUsed = () => {
    return budgetCategories.reduce((sum, category) => sum + parseFloat(category.used), 0);
  };

  const getTotalRemaining = () => {
    return budgetCategories.reduce((sum, category) => sum + parseFloat(category.remaining), 0);
  };

  const getOverallPercentUsed = () => {
    const total = getTotalBudget();
    const used = getTotalUsed();
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core':
        return 'bg-blue-500';
      case 'Capacity Building':
        return 'bg-purple-500';
      case 'Capital':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by search query
    const matchesSearch = 
      transaction.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    
    // Filter by date range
    let matchesDateRange = true;
    const txDate = new Date(transaction.date);
    const now = new Date();
    
    if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDateRange = txDate >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      matchesDateRange = txDate >= monthAgo;
    } else if (dateRange === 'quarter') {
      const quarterAgo = new Date();
      quarterAgo.setMonth(now.getMonth() - 3);
      matchesDateRange = txDate >= quarterAgo;
    }
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your NDIS funding</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddTransaction}
          icon={<Plus size={20} />}
        >
          Add Transaction
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Budget Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-900">Total Budget</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  ${getTotalBudget().toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Across all categories
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-green-600" size={20} />
                  <span className="font-medium text-gray-900">Remaining</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${getTotalRemaining().toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Available to spend
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart4 className="text-purple-600" size={20} />
                  <span className="font-medium text-gray-900">Utilization</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {getOverallPercentUsed()}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Of total budget used
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {budgetCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.category)}`}></div>
                      <span className="font-medium text-gray-900">{category.category}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${category.used} of ${category.amount} ({category.percentUsed}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getCategoryColor(category.category)}`}
                      style={{ width: `${category.percentUsed}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      Used: ${category.used}
                    </span>
                    <span className="text-xs text-gray-500">
                      Remaining: ${category.remaining}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Budget Breakdown</h2>
            <div className="relative h-48">
              <PieChart className="text-gray-300 mx-auto" size={150} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{getOverallPercentUsed()}%</span>
                <span className="text-sm text-gray-500">Used</span>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {budgetCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.category)}`}></div>
                    <span className="text-sm text-gray-600">{category.category}</span>
                  </div>
                  <span className="text-sm font-medium">{category.percentUsed}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Transactions</h2>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {budgetCategories.map((cat, index) => (
                  <option key={index} value={cat.category}>{cat.category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search transactions..."
              className="w-full"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getCategoryColor(transaction.category)}`}></div>
                          {transaction.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchQuery || selectedCategory !== 'all' || dateRange !== 'all'
                        ? 'No transactions match your filters'
                        : 'No transactions recorded yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && !(searchQuery || selectedCategory !== 'all' || dateRange !== 'all') && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={handleAddTransaction}
                icon={<Plus size={16} />}
              >
                Add Your First Transaction
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date*
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {budgetCategories.map((cat, index) => (
                  <option key={index} value={cat.category}>{cat.category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider*
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter provider name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service*
              </label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter service name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($)*
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
              placeholder="Add any notes about this transaction"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveTransaction}
            >
              Add Transaction
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}