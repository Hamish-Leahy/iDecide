import React, { useState, useEffect } from 'react';
import { Building2, Plus, Eye, EyeOff, Trash2, AlertCircle, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { encryptData, decryptData } from '../../lib/encryption';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface BankAccount {
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

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

export function BankAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'cards' | 'list'>('cards');

  // Mock transactions - in a real app, these would come from your backend
  const mockTransactions: Transaction[] = [
    { date: '2025-03-30', description: 'Grocery Store', amount: 85.50, type: 'debit' },
    { date: '2025-03-29', description: 'Salary Deposit', amount: 2500.00, type: 'credit' },
    { date: '2025-03-28', description: 'Restaurant', amount: 45.75, type: 'debit' },
    { date: '2025-03-27', description: 'Online Shopping', amount: 129.99, type: 'debit' },
    { date: '2025-03-26', description: 'Interest Payment', amount: 12.50, type: 'credit' },
  ];

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
        .eq('user_id', user?.id)
        .in('type', ['checking', 'savings']);

      if (error) throw error;
      setAccounts(data || []);
      
      // If there are accounts, select the first one by default
      if (data && data.length > 0) {
        setSelectedAccount(data[0]);
      }
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
      setSelectedAccount(data);
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
      if (selectedAccount?.id === id) {
        setSelectedAccount(accounts.length > 1 ? accounts.find(a => a.id !== id) || null : null);
      }
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

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      const balance = parseFloat(account.balance || '0');
      return total + balance;
    }, 0);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <CreditCard className="text-[#1E1B4B]" size={24} />;
      case 'savings':
        return <Wallet className="text-[#1E1B4B]" size={24} />;
      default:
        return <Building2 className="text-[#1E1B4B]" size={24} />;
    }
  };

  const filteredAccounts = accounts.filter(account => {
    return account.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
           account.type.toLowerCase().includes(searchQuery.toLowerCase());
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
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your bank accounts and track balances</p>
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
        <Card className="bg-gradient-to-br from-[#1E1B4B] to-[#2D2A6A] text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
            <p className="text-3xl font-bold">${getTotalBalance().toLocaleString()}</p>
            <p className="text-sm mt-2 text-blue-100">Across all accounts</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#1E1B4B] to-[#2D2A6A] text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Active Accounts</h3>
            <p className="text-3xl font-bold">{accounts.length}</p>
            <p className="text-sm mt-2 text-blue-100">Total accounts managed</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-[#1E1B4B] to-[#2D2A6A] text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Last Updated</h3>
            <p className="text-xl font-bold">Today</p>
            <p className="text-sm mt-2 text-blue-100">All accounts up to date</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Accounts</h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search accounts..."
              className="w-64"
            />
          </div>
          <div className="divide-y">
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map(account => (
                <div 
                  key={account.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer
                    ${selectedAccount?.id === account.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setSelectedAccount(account)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {getAccountIcon(account.type)}
                      <div>
                        <h3 className="font-medium text-gray-900">{account.institution}</h3>
                        <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {account.balance} {account.currency}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(account.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {searchQuery ? 'No accounts match your search' : 'No accounts added yet'}
                {!searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Your First Account
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl border shadow-sm">
          {selectedAccount ? (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Account Details</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Transactions</h3>
                  <div className="mt-2 space-y-2">
                    {mockTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {transaction.type === 'credit' ? (
                            <ArrowUpRight className="text-green-500" size={20} />
                          ) : (
                            <ArrowDownRight className="text-red-500" size={20} />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        <span className={`font-medium ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium capitalize">{selectedAccount.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Institution</span>
                      <span className="font-medium">{selectedAccount.institution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Currency</span>
                      <span className="font-medium">{selectedAccount.currency}</span>
                    </div>
                    {selectedAccount.statements_location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Statements</span>
                        <span className="font-medium">{selectedAccount.statements_location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAccount.account_number_encrypted && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500">Sensitive Information</h3>
                      <button
                        onClick={() => toggleSensitiveInfo(selectedAccount.id)}
                        className="text-sm text-[#1E1B4B] hover:text-[#2D2A6A] flex items-center gap-1"
                      >
                        {showSensitiveInfo[selectedAccount.id] ? (
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
                    </div>
                    {showSensitiveInfo[selectedAccount.id] && (
                      <div className="mt-2 space-y-2 text-sm p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Account Number</span>
                          <span className="font-medium">{selectedAccount.account_number_encrypted}</span>
                        </div>
                        {selectedAccount.routing_number_encrypted && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Routing Number</span>
                            <span className="font-medium">{selectedAccount.routing_number_encrypted}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedAccount.notes && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{selectedAccount.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select an account to view details
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Bank Account"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
              placeholder="e.g., Chase Bank, Wells Fargo"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
              placeholder="Enter account number"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
              placeholder="Enter routing number"
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
                placeholder="e.g., 5000.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B]"
              placeholder="Additional notes about this account"
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
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}