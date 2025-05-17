import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  CreditCard, 
  PiggyBank, 
  Wallet,
  DollarSign,
  TrendingUp,
  LineChart,
  Briefcase,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface FinancialAccount {
  id: string;
  type: string;
  institution: string;
  balance: string;
  currency: string;
  last_updated: string;
}

interface FinancialAsset {
  id: string;
  type: string;
  name: string;
  value: string;
  status: string;
}

export function FinancialDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [assets, setAssets] = useState<FinancialAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock transactions - in a real app, these would come from your backend
  const recentTransactions = [
    { id: '1', description: 'Grocery Store', amount: -85.50, date: new Date(), type: 'expense' },
    { id: '2', description: 'Salary Deposit', amount: 2500.00, date: new Date(Date.now() - 86400000), type: 'income' },
    { id: '3', description: 'Online Shopping', amount: -129.99, date: new Date(Date.now() - 172800000), type: 'expense' },
    { id: '4', description: 'Interest Payment', amount: 12.50, date: new Date(Date.now() - 259200000), type: 'income' },
    { id: '5', description: 'Restaurant', amount: -45.75, date: new Date(Date.now() - 345600000), type: 'expense' },
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [accountsResponse, assetsResponse] = await Promise.all([
        supabase
          .from('financial_accounts')
          .select('*')
          .eq('user_id', user?.id),
        supabase
          .from('financial_assets')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (accountsResponse.error) throw accountsResponse.error;
      if (assetsResponse.error) throw assetsResponse.error;

      setAccounts(accountsResponse.data || []);
      setAssets(assetsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => {
      const balance = parseFloat(account.balance || '0');
      return total + balance;
    }, 0);
  };

  const calculateTotalAssetValue = () => {
    return assets.reduce((total, asset) => {
      const value = parseFloat(asset.value || '0');
      return total + value;
    }, 0);
  };

  const calculateNetWorth = () => {
    return calculateTotalBalance() + calculateTotalAssetValue();
  };

  const getAccountsByType = (type: string) => {
    return accounts.filter(account => account.type === type);
  };

  const getAssetsByType = (type: string) => {
    return assets.filter(asset => asset.type === type);
  };

  const handleAddAccount = () => {
    navigate('/dashboard/financial/bank-accounts');
  };

  const handleAddInvestment = () => {
    navigate('/dashboard/financial/investments');
  };

  const handleAddAsset = () => {
    navigate('/dashboard/financial/assets');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your financial accounts and assets</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={handleAddAccount}
        >
          Add Account
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Financial Overview */}
        <Card className="col-span-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="text-blue-600" size={20} />
                  <span className="font-medium">Bank Accounts</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  ${calculateTotalBalance().toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <span className="font-medium">Investments</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${getAssetsByType('stock').reduce((sum, asset) => sum + parseFloat(asset.value || '0'), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="text-purple-600" size={20} />
                  <span className="font-medium">Assets</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  ${calculateTotalAssetValue().toLocaleString()}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-indigo-600" size={20} />
                  <span className="font-medium">Net Worth</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  ${calculateNetWorth().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-full lg:col-span-2">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(transaction => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="text-green-500" size={20} />
                      ) : (
                        <ArrowDownRight className="text-red-500" size={20} />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                        <p className="text-sm text-gray-500">
                          {transaction.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Account Summary */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="text-blue-500" size={20} />
                  <span className="text-gray-700">Checking</span>
                </div>
                <span className="font-medium">
                  ${getAccountsByType('checking').reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="text-green-500" size={20} />
                  <span className="text-gray-700">Savings</span>
                </div>
                <span className="font-medium">
                  ${getAccountsByType('savings').reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-purple-500" size={20} />
                  <span className="text-gray-700">Credit</span>
                </div>
                <span className="font-medium">
                  ${getAccountsByType('credit').reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="text-amber-500" size={20} />
                  <span className="text-gray-700">Retirement</span>
                </div>
                <span className="font-medium">
                  ${getAccountsByType('retirement').reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

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
              onClick={handleAddAccount}
            >
              <Building2 size={20} className="mr-2" />
              Add Bank Account
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleAddInvestment}
            >
              <TrendingUp size={20} className="mr-2" />
              Track Investment
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleAddAsset}
            >
              <Briefcase size={20} className="mr-2" />
              Add Asset
            </Button>
          </div>
        </div>
      </Card>

      {/* Financial Status Overview */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bank Accounts</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  accounts.some(a => a.type === 'checking' || a.type === 'savings')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {accounts.some(a => a.type === 'checking' || a.type === 'savings')
                    ? 'Active'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Credit Cards</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  accounts.some(a => a.type === 'credit')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {accounts.some(a => a.type === 'credit')
                    ? 'Active'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Investments</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  assets.some(a => a.type === 'stock' || a.type === 'etf' || a.type === 'mutual_fund')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {assets.some(a => a.type === 'stock' || a.type === 'etf' || a.type === 'mutual_fund')
                    ? 'Active'
                    : 'Not Started'}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Retirement</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  accounts.some(a => a.type === 'retirement')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {accounts.some(a => a.type === 'retirement')
                    ? 'Active'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Digital Wallet</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  assets.some(a => a.type === 'cryptocurrency')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {assets.some(a => a.type === 'cryptocurrency')
                    ? 'Active'
                    : 'Not Started'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Other Assets</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  assets.some(a => a.type === 'property' || a.type === 'vehicle' || a.type === 'collectible')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {assets.some(a => a.type === 'property' || a.type === 'vehicle' || a.type === 'collectible')
                    ? 'Active'
                    : 'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}