import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { encryptData, decryptData } from '../../lib/encryption';

interface BankAccount {
  id: string;
  bank_name: string;
  account_type: string;
  account_number_encrypted?: string;
  routing_number_encrypted?: string;
  notes?: string;
}

const accountTypes = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment Account' },
  { value: 'retirement', label: 'Retirement Account' },
  { value: 'other', label: 'Other' },
];

export function BankAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  async function loadAccounts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bank_accounts')
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

  async function handleSaveAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const accountNumber = formData.get('account_number') as string;
      const routingNumber = formData.get('routing_number') as string;

      const account = {
        bank_name: formData.get('bank_name') as string,
        account_type: formData.get('account_type') as string,
        account_number_encrypted: accountNumber ? await encryptData(accountNumber) : null,
        routing_number_encrypted: routingNumber ? await encryptData(routingNumber) : null,
        notes: formData.get('notes') as string,
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([account])
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data]);
      setShowAddForm(false);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save account');
    }
  }

  async function handleDeleteAccount(id: string) {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  }

  async function toggleSensitiveInfo(accountId: string) {
    setShowSensitiveInfo(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  }

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
          <h2 className="text-xl font-semibold">Bank Accounts</h2>
          <p className="text-gray-600 mt-1">Manage your financial accounts securely</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#1E1B4B] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1E1B4B]/90"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map(account => (
          <div
            key={account.id}
            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {account.account_type === 'credit' ? (
                  <CreditCard size={24} className="text-[#1E1B4B]" />
                ) : (
                  <Building2 size={24} className="text-[#1E1B4B]" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{account.bank_name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{account.account_type}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {account.account_number_encrypted && (
                <div>
                  <button
                    onClick={() => toggleSensitiveInfo(account.id)}
                    className="text-sm text-[#1E1B4B] hover:underline flex items-center gap-1"
                  >
                    {showSensitiveInfo[account.id] ? 'Hide' : 'Show'} Account Details
                  </button>
                  {showSensitiveInfo[account.id] && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Account Number:</span>{' '}
                        {account.account_number_encrypted}
                      </p>
                      {account.routing_number_encrypted && (
                        <p className="text-sm">
                          <span className="font-medium">Routing Number:</span>{' '}
                          {account.routing_number_encrypted}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {account.notes && (
                <p className="text-sm mt-2 text-gray-600">{account.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showAddForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No bank accounts added yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-[#1E1B4B] hover:underline"
          >
            Add your first bank account
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Add Bank Account</h2>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                  placeholder="e.g., Chase Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  name="account_type"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
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
                  Account Number
                </label>
                <input
                  type="text"
                  name="account_number"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  name="routing_number"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                  placeholder="Enter routing number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                  placeholder="Additional information about the account..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E1B4B] text-white px-4 py-2 rounded-lg hover:bg-[#1E1B4B]/90"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}