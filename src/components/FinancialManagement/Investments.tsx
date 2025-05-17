import React, { useState, useEffect } from 'react';
import { LineChart, Plus, Trash2, AlertCircle, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface Investment {
  id: string;
  type: string;
  name: string;
  ticker?: string;
  shares?: number;
  purchase_price: string;
  current_value: string;
  purchase_date: string;
  notes?: string;
  platform?: string;
  category: string;
}

export function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    type: 'stock',
    name: '',
    ticker: '',
    shares: '',
    purchase_price: '',
    current_value: '',
    purchase_date: '',
    notes: '',
    platform: '',
    category: 'stocks'
  });

  const investmentTypes = [
    { value: 'stock', label: 'Stocks' },
    { value: 'etf', label: 'ETFs' },
    { value: 'mutual_fund', label: 'Mutual Funds' },
    { value: 'bond', label: 'Bonds' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { value: 'stocks', label: 'Stocks' },
    { value: 'fixed_income', label: 'Fixed Income' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'crypto', label: 'Cryptocurrency' }
  ];

  useEffect(() => {
    if (user) {
      loadInvestments();
    }
  }, [user]);

  async function loadInvestments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_assets')
        .select('*')
        .eq('user_id', user?.id)
        .in('type', ['stock', 'etf', 'mutual_fund', 'bond', 'crypto']);

      if (error) throw error;
      setInvestments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveInvestment = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_assets')
        .insert([{
          ...formData,
          user_id: user?.id,
          value: formData.current_value
        }])
        .select()
        .single();

      if (error) throw error;

      setInvestments(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        type: 'stock',
        name: '',
        ticker: '',
        shares: '',
        purchase_price: '',
        current_value: '',
        purchase_date: '',
        notes: '',
        platform: '',
        category: 'stocks'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save investment');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInvestments(prev => prev.filter(investment => investment.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete investment');
    }
  };

  const calculateTotalValue = () => {
    return investments.reduce((total, investment) => {
      const value = parseFloat(investment.current_value || '0');
      return total + value;
    }, 0);
  };

  const calculateTotalGain = () => {
    return investments.reduce((total, investment) => {
      const currentValue = parseFloat(investment.current_value || '0');
      const purchaseValue = parseFloat(investment.purchase_price || '0') * (parseFloat(investment.shares?.toString() || '0') || 1);
      return total + (currentValue - purchaseValue);
    }, 0);
  };

  const getPerformanceColor = (currentValue: string, purchasePrice: string, shares?: number) => {
    const current = parseFloat(currentValue);
    const initial = parseFloat(purchasePrice) * (shares || 1);
    return current >= initial ? 'text-green-600' : 'text-red-600';
  };

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = 
      investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investment.ticker?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || investment.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>
          <p className="text-gray-600 mt-1">Track and manage your investments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Investment
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Portfolio Value</h3>
            <p className="text-3xl font-bold">${calculateTotalValue().toLocaleString()}</p>
            <p className="text-sm mt-2 text-blue-100">Across all investments</p>
          </div>
        </Card>

        <Card className={`bg-gradient-to-br ${
          calculateTotalGain() >= 0 
            ? 'from-green-500 to-green-600' 
            : 'from-red-500 to-red-600'
        } text-white`}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Gain/Loss</h3>
            <p className="text-3xl font-bold">
              {calculateTotalGain() >= 0 ? '+' : '-'}${Math.abs(calculateTotalGain()).toLocaleString()}
            </p>
            <p className="text-sm mt-2 text-green-100">Overall performance</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Active Investments</h3>
            <p className="text-3xl font-bold">{investments.length}</p>
            <p className="text-sm mt-2 text-purple-100">Total positions</p>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search investments..."
            className="flex-1"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Investments List */}
        <div className="divide-y">
          {filteredInvestments.length > 0 ? (
            filteredInvestments.map(investment => (
              <div key={investment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{investment.name}</h3>
                      {investment.ticker && (
                        <span className="text-sm text-gray-500">({investment.ticker})</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {investmentTypes.find(t => t.value === investment.type)?.label}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm">
                        <span className="text-gray-500">Current Value:</span>{' '}
                        <span className="font-medium">${parseFloat(investment.current_value).toLocaleString()}</span>
                      </p>
                      {investment.shares && (
                        <p className="text-sm">
                          <span className="text-gray-500">Shares:</span>{' '}
                          <span className="font-medium">{investment.shares}</span>
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="text-gray-500">Purchase Price:</span>{' '}
                        <span className="font-medium">${parseFloat(investment.purchase_price).toLocaleString()}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {parseFloat(investment.current_value) >= parseFloat(investment.purchase_price) * (investment.shares || 1) ? (
                        <TrendingUp className="text-green-600" size={16} />
                      ) : (
                        <TrendingDown className="text-red-600" size={16} />
                      )}
                      <span className={getPerformanceColor(
                        investment.current_value,
                        investment.purchase_price,
                        investment.shares
                      )}>
                        {((parseFloat(investment.current_value) / (parseFloat(investment.purchase_price) * (investment.shares || 1)) - 1) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteInvestment(investment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? 'No investments match your search'
                : 'No investments added yet'}
              {!searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Investment
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Investment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Investment"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {investmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Apple Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticker Symbol
            </label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AAPL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Shares
              </label>
              <input
                type="number"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price per Share
              </label>
              <input
                type="text"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 150.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Value
            </label>
            <input
              type="text"
              value={formData.current_value}
              onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1600.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trading Platform
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Robinhood, E*TRADE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
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
              placeholder="Additional notes about this investment"
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
              onClick={handleSaveInvestment}
            >
              Save Investment
            </Button>
          </div>
        </div>
      </Modal>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}