import React, { useState, useEffect } from 'react';
import { Building2, Plus, Eye, EyeOff, Trash2, AlertCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { encryptData, decryptData } from '../../lib/encryption';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface FinancialAccount {
  id: string;
  type: string;
  institution: string;
  account_number_encrypted?: string;
  routing_number_encrypted?: string;
  balance?: string;
  currency: string;
  statements_location?: string;
  notes?: string;
}

export function FinancialAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [formData, setFormData] = useState({
    type: 'checking',
    institution: '',
    account_number: '',
    routing_number: '',
    balance: '',
    currency: 'AUD',
    statements_location: '',
    notes: ''
  });

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit', label: 'Credit Card' },
    { value: 'investment', label: 'Investment Account' },
    { value: 'retirement', label: 'Retirement Account' },
    { value: 'loan', label: 'Loan' },
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
        .eq('user_id', user?.id);

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAccount = async () => {
    try {
      const accountData = {
        ...formData,
        account_number_encrypted: formData.account_number ? await encryptData(formData.account_number) : null,
        routing_number_encrypted: formData.routing_number ? await encryptData(formData.routing_number) : null,
        user_id: user?.id
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
        type: 'checking',
        institution: '',
        account_number: '',
        routing_number: '',
        balance: '',
        currency: 'AUD',
        statements_location: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save account');
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
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  const toggleSensitiveInfo = (accountId: string) => {
    setShowSensitiveInfo(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || account.type === selectedType;
    
    return matchesSearch && matchesType;
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your bank accounts and financial institutions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Account
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search accounts..."
            className="flex-1"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Account Types</option>
            {accountTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Accounts List */}
        <div className="divide-y">
          {filteredAccounts.map(account => (
            <div key={account.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">{account.institution}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {accountTypes.find(t => t.value === account.type)?.label || account.type}
                  </p>
                  {account.balance && (
                    <p className="text-sm font-medium text-gray-900">
                      Balance: {account.balance} {account.currency}
                    </p>
                  )}
                  {(account.account_number_encrypted || account.routing_number_encrypted) && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleSensitiveInfo(account.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {showSensitiveInfo[account.id] ? (
                          <>
                            <EyeOff size={16} />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Show Details
                          </>
                        )}
                      </button>
                      {showSensitiveInfo[account.id] && (
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {account.account_number_encrypted && (
                            <p>Account Number: {account.account_number_encrypted}</p>
                          )}
                          {account.routing_number_encrypted && (
                            <p>Routing Number: {account.routing_number_encrypted}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {account.notes && (
                    <p className="text-sm text-gray-500 mt-2">{account.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
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
                : 'No accounts added yet'}
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Financial Account"
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
              Institution Name
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Routing Number
            </label>
            <input
              type="text"
              value={formData.routing_number}
              onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Balance
              </label>
              <input
                type="text"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statements Location
            </label>
            <input
              type="text"
              value={formData.statements_location}
              onChange={(e) => setFormData({ ...formData, statements_location: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Email or Physical location"
            />
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