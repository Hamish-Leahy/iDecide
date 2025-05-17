import React, { useState, useEffect } from 'react';
import { CreditCard as CreditCardIcon, Plus, Trash2, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { encryptData, decryptData } from '../../lib/encryption';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface CreditCard {
  id: string;
  issuer: string;
  card_type: string;
  card_number_encrypted: string;
  expiry_date: string;
  cvv_encrypted: string;
  credit_limit: string;
  current_balance: string;
  payment_due_date: string;
  rewards_program?: string;
  annual_fee?: string;
  interest_rate?: string;
  notes?: string;
}

export function CreditCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    issuer: '',
    card_type: 'visa',
    card_number: '',
    expiry_date: '',
    cvv: '',
    credit_limit: '',
    current_balance: '',
    payment_due_date: '',
    rewards_program: '',
    annual_fee: '',
    interest_rate: '',
    notes: ''
  });

  const cardTypes = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'amex', label: 'American Express' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  async function loadCards() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'credit');

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credit cards');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveCard = async () => {
    try {
      const cardData = {
        type: 'credit',
        institution: formData.issuer,
        account_number_encrypted: await encryptData(formData.card_number),
        routing_number_encrypted: await encryptData(formData.cvv),
        balance: formData.current_balance,
        currency: 'AUD',
        notes: formData.notes,
        user_id: user?.id,
        metadata: {
          card_type: formData.card_type,
          expiry_date: formData.expiry_date,
          credit_limit: formData.credit_limit,
          payment_due_date: formData.payment_due_date,
          rewards_program: formData.rewards_program,
          annual_fee: formData.annual_fee,
          interest_rate: formData.interest_rate
        }
      };

      const { data, error } = await supabase
        .from('financial_accounts')
        .insert([cardData])
        .select()
        .single();

      if (error) throw error;

      setCards(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        issuer: '',
        card_type: 'visa',
        card_number: '',
        expiry_date: '',
        cvv: '',
        credit_limit: '',
        current_balance: '',
        payment_due_date: '',
        rewards_program: '',
        annual_fee: '',
        interest_rate: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credit card');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete credit card');
    }
  };

  const toggleSensitiveInfo = (cardId: string) => {
    setShowSensitiveInfo(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const calculateTotalBalance = () => {
    return cards.reduce((total, card) => {
      const balance = parseFloat(card.current_balance || '0');
      return total + balance;
    }, 0);
  };

  const calculateTotalCredit = () => {
    return cards.reduce((total, card) => {
      const limit = parseFloat(card.credit_limit || '0');
      return total + limit;
    }, 0);
  };

  const getNextPaymentDue = () => {
    const upcomingPayments = cards
      .map(card => new Date(card.payment_due_date))
      .filter(date => date > new Date())
      .sort((a, b) => a.getTime() - b.getTime());
    
    return upcomingPayments[0];
  };

  const filteredCards = cards.filter(card => 
    card.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.card_type.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Credit Cards</h1>
          <p className="text-gray-600 mt-1">Manage your credit cards and track balances</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Credit Card
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
            <p className="text-3xl font-bold">${calculateTotalBalance().toLocaleString()}</p>
            <p className="text-sm mt-2 text-red-100">Current outstanding balance</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Credit</h3>
            <p className="text-3xl font-bold">${calculateTotalCredit().toLocaleString()}</p>
            <p className="text-sm mt-2 text-blue-100">Available credit limit</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Next Payment Due</h3>
            <p className="text-xl font-bold">
              {getNextPaymentDue()
                ? getNextPaymentDue().toLocaleDateString()
                : 'No upcoming payments'}
            </p>
            <p className="text-sm mt-2 text-amber-100">Mark your calendar</p>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search credit cards..."
            className="w-full"
          />
        </div>

        {/* Cards List */}
        <div className="divide-y">
          {filteredCards.map(card => (
            <div key={card.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="text-gray-400" size={24} />
                    <div>
                      <h3 className="font-medium text-gray-900">{card.issuer}</h3>
                      <p className="text-sm text-gray-500 capitalize">{card.card_type}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Current Balance</p>
                      <p className="font-medium text-gray-900">${parseFloat(card.current_balance).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Credit Limit</p>
                      <p className="font-medium text-gray-900">${parseFloat(card.credit_limit).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar size={16} />
                      <span>Due: {new Date(card.payment_due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <DollarSign size={16} />
                      <span>APR: {card.interest_rate}%</span>
                    </div>
                  </div>

                  {card.rewards_program && (
                    <p className="text-sm text-gray-600">
                      Rewards: {card.rewards_program}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleSensitiveInfo(card.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showSensitiveInfo[card.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {showSensitiveInfo[card.id] && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Card Number</p>
                      <p className="font-medium">{card.card_number_encrypted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CVV</p>
                      <p className="font-medium">{card.cvv_encrypted}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredCards.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? 'No credit cards match your search'
                : 'No credit cards added yet'}
            </div>
          )}
        </div>
      </div>

      {/* Add Credit Card Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Credit Card"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Issuer
            </label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Chase, American Express"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Type
            </label>
            <select
              value={formData.card_type}
              onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {cardTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              value={formData.card_number}
              onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="XXXX XXXX XXXX XXXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="XXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit
              </label>
              <input
                type="text"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance
              </label>
              <input
                type="text"
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              value={formData.payment_due_date}
              onChange={(e) => setFormData({ ...formData, payment_due_date: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rewards Program
            </label>
            <input
              type="text"
              value={formData.rewards_program}
              onChange={(e) => setFormData({ ...formData, rewards_program: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Cash back, Travel points"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Fee
              </label>
              <input
                type="text"
                value={formData.annual_fee}
                onChange={(e) => setFormData({ ...formData, annual_fee: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (APR)
              </label>
              <input
                type="text"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="%"
              />
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
              onClick={handleSaveCard}
            >
              Save Card
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