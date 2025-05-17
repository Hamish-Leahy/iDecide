import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  CreditCard, 
  PiggyBank, 
  Wallet,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  LineChart,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { BankAccounts } from './BankAccounts';
import { CreditCards } from './CreditCards';
import { Investments } from './Investments';
import { Retirement } from './Retirement';
import { DigitalWallet } from './DigitalWallet';
import { FinancialAssets } from './FinancialAssets';
import { FinancialDashboard } from '../FinancialManagement/FinancialDashboard';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const navItems: NavItem[] = [
  { 
    id: 'bank-accounts', 
    label: 'Bank Accounts', 
    icon: <Building2 size={24} />,
    description: 'Manage bank accounts and transactions',
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    id: 'credit-cards', 
    label: 'Credit Cards', 
    icon: <CreditCard size={24} />,
    description: 'Track credit cards and payments',
    color: 'bg-purple-50 text-purple-600'
  },
  { 
    id: 'investments', 
    label: 'Investments', 
    icon: <TrendingUp size={24} />,
    description: 'Monitor investment portfolio',
    color: 'bg-green-50 text-green-600'
  },
  { 
    id: 'retirement', 
    label: 'Retirement', 
    icon: <PiggyBank size={24} />,
    description: 'Plan for retirement',
    color: 'bg-amber-50 text-amber-600'
  },
  { 
    id: 'wallet', 
    label: 'Digital Wallet', 
    icon: <Wallet size={24} />,
    description: 'Manage digital assets and crypto',
    color: 'bg-indigo-50 text-indigo-600'
  },
  { 
    id: 'assets', 
    label: 'Other Assets', 
    icon: <Briefcase size={24} />,
    description: 'Track other financial assets',
    color: 'bg-rose-50 text-rose-600'
  }
];

export function FinancialManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Financial data
  const [accounts, setAccounts] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  
  // Financial overview
  const [overview, setOverview] = useState({
    totalAssets: 0,
    totalInvestments: 0,
    netWorth: 0,
    monthlyChange: 0,
    quarterlyChange: 0,
    yearlyChange: 0
  });

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);

  async function loadFinancialData() {
    try {
      setLoading(true);

      // Fetch all financial accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (accountsError) throw accountsError;

      // Fetch all financial assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('financial_assets')
        .select('*')
        .eq('user_id', user?.id);

      if (assetsError) throw assetsError;

      // Set the data
      setAccounts(accountsData || []);
      setAssets(assetsData || []);
      
      // Filter investments from financial assets
      const investmentAssets = (assetsData || []).filter(asset => 
        ['stock', 'etf', 'mutual_fund', 'bond', 'crypto'].includes(asset.type)
      );
      setInvestments(investmentAssets);

      // Calculate totals
      const totalAssets = (accountsData || []).reduce((sum, account) => {
        const balance = parseFloat(account.balance || '0');
        return sum + balance;
      }, 0);

      const totalInvestments = (assetsData || []).reduce((sum, asset) => {
        const value = parseFloat(asset.value || '0');
        return sum + value;
      }, 0);

      const netWorth = totalAssets + totalInvestments;

      // For demonstration, we'll calculate mock changes
      // In a real app, you'd track historical values
      const monthlyChange = (Math.random() * 10 - 5).toFixed(1);
      const quarterlyChange = (Math.random() * 15 - 7).toFixed(1);
      const yearlyChange = (Math.random() * 20 - 10).toFixed(1);

      setOverview({
        totalAssets,
        totalInvestments,
        netWorth,
        monthlyChange: parseFloat(monthlyChange),
        quarterlyChange: parseFloat(quarterlyChange),
        yearlyChange: parseFloat(yearlyChange)
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/financial/${id}`);
  };
  
  const handleAddAccount = () => {
    navigate('/dashboard/financial/bank-accounts');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your financial accounts and assets
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddAccount}
              icon={<Plus size={20} />}
            >
              Add Account
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search accounts..."
              className="flex-1"
            />
            <Button
              variant="outline"
              icon={<Filter size={20} />}
            >
              Filters
            </Button>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer h-full"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="p-6 space-y-4">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Financial Overview */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-blue-600" size={20} />
                    <span className="font-medium text-blue-900">Total Assets</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${overview.totalAssets.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {overview.monthlyChange >= 0 ? '+' : ''}{overview.monthlyChange}% from last month
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span className="font-medium text-green-900">Investments</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${overview.totalInvestments.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {overview.quarterlyChange >= 0 ? '+' : ''}{overview.quarterlyChange}% this quarter
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LineChart className="text-purple-600" size={20} />
                    <span className="font-medium text-purple-900">Net Worth</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    ${overview.netWorth.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    {overview.yearlyChange >= 0 ? '+' : ''}{overview.yearlyChange}% this year
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Transactions
              </h2>
              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {/* Mock transactions - in a real app, these would come from your backend */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowDownRight className="text-red-500" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Grocery Store</p>
                        <p className="text-sm text-gray-500">Today</p>
                      </div>
                    </div>
                    <span className="font-medium text-red-600">-$85.50</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowUpRight className="text-green-500" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Salary Deposit</p>
                        <p className="text-sm text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <span className="font-medium text-green-600">+$2,500.00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowDownRight className="text-red-500" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Online Shopping</p>
                        <p className="text-sm text-gray-500">Mar 28, 2025</p>
                      </div>
                    </div>
                    <span className="font-medium text-red-600">-$129.99</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No accounts added yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/dashboard/financial/bank-accounts')}
                  >
                    Add Your First Account
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/financial/bank-accounts')}
                >
                  <Building2 size={20} className="mr-2" />
                  Add Bank Account
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/financial/investments')}
                >
                  <TrendingUp size={20} className="mr-2" />
                  Track Investment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/financial/assets')}
                >
                  <Briefcase size={20} className="mr-2" />
                  Add Asset
                </Button>
              </div>
            </div>
          </Card>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
        </div>
      } />
      <Route path="/dashboard" element={<FinancialDashboard />} />
      <Route path="/bank-accounts" element={<BankAccounts />} />
      <Route path="/credit-cards" element={<CreditCards />} />
      <Route path="/investments" element={<Investments />} />
      <Route path="/retirement" element={<Retirement />} />
      <Route path="/wallet" element={<DigitalWallet />} />
      <Route path="/assets" element={<FinancialAssets />} />
      <Route path="*" element={<Navigate to="/dashboard/financial" replace />} />
    </Routes>
  );
}