import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Trash2, AlertCircle, TrendingUp, TrendingDown, DollarSign, LineChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface RetirementAccount {
  id: string;
  type: string;
  provider: string;
  account_number: string;
  balance: string;
  contributions_ytd: string;
  employer_match?: string;
  investment_strategy?: string;
  target_retirement_date?: string;
  beneficiaries?: string[];
  notes?: string;
}

export function Retirement() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<RetirementAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    type: 'superannuation',
    provider: '',
    account_number: '',
    balance: '',
    contributions_ytd: '',
    employer_match: '',
    investment_strategy: '',
    target_retirement_date: '',
    beneficiaries: [''],
    notes: ''
  });

  const accountTypes = [
    { value: 'superannuation', label: 'Superannuation' },
    { value: '401k', label: '401(k)' },
    { value: 'ira', label: 'IRA' },
    { value: 'pension', label: 'Pension' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  async function loadAccounts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'retirement');

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load retirement accounts');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAccount = async () => {
    try {
      const accountData = {
        type: 'retirement',
        institution: formData.provider,
        account_number: formData.account_number,
        balance: formData.balance,
        currency: 'AUD',
        notes: formData.notes,
        user_id: user?.id,
        metadata: {
          retirement_type: formData.type,
          contributions_ytd: formData.contributions_ytd,
          employer_match: formData.employer_match,
          investment_strategy: formData.investment_strategy,
          target_retirement_date: formData.target_retirement_date,
          beneficiaries: formData.beneficiaries
        }
      };

      const { data, error } = await supabase
        .from('financial_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        type: 'superannuation',
        provider: '',
        account_number: '',
        balance: '',
        contributions_ytd: '',
        employer_match: '',
        investment_strategy: '',
        target_retirement_date: '',
        beneficiaries: [''],
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save retirement account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete retirement account');
    }
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => {
      const balance = parseFloat(account.balance || '0');
      return total + balance;
    }, 0);
  };

  const calculateTotalContributions = () => {
    return accounts.reduce((total, account) => {
      const contributions = parseFloat(account.contributions_ytd || '0');
      return total + contributions;
    }, 0);
  };

  const filteredAccounts = accounts.filter(account => 
    account.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Retirement Accounts</h1>
          <p className="text-gray-600 mt-1">Track your retirement savings and investments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Account
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
            <p className="text-3xl font-bold">${calculateTotalBalance().toLocaleString()}</p>
            <p className="text-sm mt-2 text-blue-100">Combined retirement savings</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">YTD Contributions</h3>
            <p className="text-3xl font-bold">${calculateTotalContributions().toLocaleString()}</p>
            <p className="text-sm mt-2 text-green-100">Total contributions this year</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Active Accounts</h3>
            <p className="text-3xl font-bold">{accounts.length}</p>
            <p className="text-sm mt-2 text-purple-100">Total retirement accounts</p>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search retirement accounts..."
            className="w-full"
          />
        </div>

        {/* Accounts List */}
        <div className="divide-y">
          {filteredAccounts.map(account => (
            <div key={account.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="text-gray-400" size={24} />
                    <div>
                      <h3 className="font-medium text-gray-900">{account.provider}</h3>
                      <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p className="font-medium text-gray-900">${parseFloat(account.balance).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">YTD Contributions</p>
                      <p className="font-medium text-gray-900">${parseFloat(account.contributions_ytd).toLocaleString()}</p>
                    </div>
                  </div>

                  {account.employer_match && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <DollarSign size={16} />
                      <span>Employer Match: {account.employer_match}%</span>
                    </div>
                  )}

                  {account.investment_strategy && (
                    <p className="text-sm text-gray-600">
                      Strategy: {account.investment_strategy}
                    </p>
                  )}

                  {account.target_retirement_date && (
                    <p className="text-sm text-gray-600">
                      Target Retirement: {new Date(account.target_retirement_date).getFullYear()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {filteredAccounts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? 'No accounts match your search'
                : 'No retirement accounts added yet'}
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Retirement Account"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AustralianSuper, Vanguard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance
              </label>
              <input
                type="text"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YTD Contributions
              </label>
              <input
                type="text"
                value={formData.contributions_ytd}
                onChange={(e) => setFormData({ ...formData, contributions_ytd: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Match
            </label>
            <input
              type="text"
              value={formData.employer_match}
              onChange={(e) => setFormData({ ...formData, employer_match: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="%"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Strategy
            </label>
            <input
              type="text"
              value={formData.investment_strategy}
              onChange={(e) => setFormData({ ...formData, investment_strategy: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Balanced, Growth, Conservative"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Retirement Date
            </label>
            <input
              type="date"
              value={formData.target_retirement_date}
              onChange={(e) => setFormData({ ...formData, target_retirement_date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beneficiaries
            </label>
            {formData.beneficiaries.map((beneficiary, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={beneficiary}
                  onChange={(e) => {
                    const newBeneficiaries = [...formData.beneficiaries];
                    newBeneficiaries[index] = e.target.value;
                    setFormData({ ...formData, beneficiaries: newBeneficiaries });
                  }}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
                <button
                  onClick={() => {
                    const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
                    setFormData({ ...formData, beneficiaries: newBeneficiaries });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setFormData({ 
                ...formData, 
                beneficiaries: [...formData.beneficiaries, ''] 
              })}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Add Beneficiary
            </button>
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
              onClick={handleSaveAccount}
            >
              Save Account
            </Button>
          </div>
        </div>
      </Modal>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}