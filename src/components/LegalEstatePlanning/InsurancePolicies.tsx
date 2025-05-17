import React, { useState } from 'react';
import { Briefcase, AlertCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface InsurancePolicy {
  id: string;
  type: 'life' | 'disability' | 'longterm' | 'ndis';
  provider: string;
  policy_number: string;
  coverage_amount: string;
  premium: string;
  payment_frequency: string;
  start_date: string;
  renewal_date: string;
  beneficiaries?: string[];
  notes?: string;
}

interface NDISPlan extends InsurancePolicy {
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

export function InsurancePolicies() {
  const { user } = useAuth();
  const [showLifeModal, setShowLifeModal] = useState(false);
  const [showDisabilityModal, setShowDisabilityModal] = useState(false);
  const [showLongTermModal, setShowLongTermModal] = useState(false);
  const [showNDISModal, setShowNDISModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [lifeFormData, setLifeFormData] = useState({
    provider: '',
    policy_number: '',
    coverage_amount: '',
    premium: '',
    payment_frequency: 'monthly',
    start_date: '',
    renewal_date: '',
    beneficiaries: [''],
    notes: ''
  });

  const [disabilityFormData, setDisabilityFormData] = useState({
    provider: '',
    policy_number: '',
    coverage_amount: '',
    premium: '',
    payment_frequency: 'monthly',
    start_date: '',
    renewal_date: '',
    waiting_period: '',
    benefit_period: '',
    coverage_type: 'short-term',
    notes: ''
  });

  const [longTermFormData, setLongTermFormData] = useState({
    provider: '',
    policy_number: '',
    coverage_amount: '',
    premium: '',
    payment_frequency: 'monthly',
    start_date: '',
    renewal_date: '',
    elimination_period: '',
    benefit_period: '',
    daily_benefit: '',
    notes: ''
  });

  const [ndisFormData, setNdisFormData] = useState({
    ndis_number: '',
    plan_start_date: '',
    plan_end_date: '',
    plan_manager: 'agency',
    support_coordinator: '',
    funding_categories: [
      { category: 'Core', amount: '', used: '' },
      { category: 'Capacity Building', amount: '', used: '' },
      { category: 'Capital', amount: '', used: '' }
    ],
    notes: ''
  });

  const handleSaveLifeInsurance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_policies')
        .insert([{
          user_id: user?.id,
          type: 'life',
          ...lifeFormData
        }])
        .select()
        .single();

      if (error) throw error;
      setShowLifeModal(false);
      setLifeFormData({
        provider: '',
        policy_number: '',
        coverage_amount: '',
        premium: '',
        payment_frequency: 'monthly',
        start_date: '',
        renewal_date: '',
        beneficiaries: [''],
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save life insurance policy');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisabilityInsurance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_policies')
        .insert([{
          user_id: user?.id,
          type: 'disability',
          ...disabilityFormData
        }])
        .select()
        .single();

      if (error) throw error;
      setShowDisabilityModal(false);
      setDisabilityFormData({
        provider: '',
        policy_number: '',
        coverage_amount: '',
        premium: '',
        payment_frequency: 'monthly',
        start_date: '',
        renewal_date: '',
        waiting_period: '',
        benefit_period: '',
        coverage_type: 'short-term',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save disability insurance policy');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLongTermCare = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_policies')
        .insert([{
          user_id: user?.id,
          type: 'longterm',
          ...longTermFormData
        }])
        .select()
        .single();

      if (error) throw error;
      setShowLongTermModal(false);
      setLongTermFormData({
        provider: '',
        policy_number: '',
        coverage_amount: '',
        premium: '',
        payment_frequency: 'monthly',
        start_date: '',
        renewal_date: '',
        elimination_period: '',
        benefit_period: '',
        daily_benefit: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save long-term care policy');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNDIS = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insurance_policies')
        .insert([{
          user_id: user?.id,
          type: 'ndis',
          ...ndisFormData
        }])
        .select()
        .single();

      if (error) throw error;
      setShowNDISModal(false);
      setNdisFormData({
        ndis_number: '',
        plan_start_date: '',
        plan_end_date: '',
        plan_manager: 'agency',
        support_coordinator: '',
        funding_categories: [
          { category: 'Core', amount: '', used: '' },
          { category: 'Capacity Building', amount: '', used: '' },
          { category: 'Capital', amount: '', used: '' }
        ],
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save NDIS plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Policies</h1>
          <p className="text-gray-600 mt-1">Track and manage your insurance coverage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Life Insurance</h2>
            <p className="text-gray-600 mb-4">
              Manage your life insurance policies and beneficiary information.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => setShowLifeModal(true)}
              >
                <Briefcase size={20} className="mr-2" />
                Add Life Insurance
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Disability Insurance</h2>
            <p className="text-gray-600 mb-4">
              Track short-term and long-term disability coverage.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => setShowDisabilityModal(true)}
              >
                <Briefcase size={20} className="mr-2" />
                Add Disability Insurance
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Long-term Care</h2>
            <p className="text-gray-600 mb-4">
              Manage long-term care insurance policies.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => setShowLongTermModal(true)}
              >
                <Briefcase size={20} className="mr-2" />
                Add Long-term Care
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">NDIS Plan</h2>
            <p className="text-gray-600 mb-4">
              Manage your NDIS plan and support coordination.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={() => setShowNDISModal(true)}
              >
                <Briefcase size={20} className="mr-2" />
                Add NDIS Plan
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-start gap-3 text-amber-800 bg-amber-50 p-4 rounded-lg">
            <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium mb-2">Insurance Review Reminder</h3>
              <p className="text-sm">
                Regular review of your insurance policies ensures adequate coverage and up-to-date beneficiary information. 
                We recommend reviewing your policies annually or when major life changes occur.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Life Insurance Modal */}
      <Modal
        isOpen={showLifeModal}
        onClose={() => setShowLifeModal(false)}
        title="Add Life Insurance Policy"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <input
              type="text"
              value={lifeFormData.provider}
              onChange={(e) => setLifeFormData({ ...lifeFormData, provider: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Number
            </label>
            <input
              type="text"
              value={lifeFormData.policy_number}
              onChange={(e) => setLifeFormData({ ...lifeFormData, policy_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Amount
            </label>
            <input
              type="text"
              value={lifeFormData.coverage_amount}
              onChange={(e) => setLifeFormData({ ...lifeFormData, coverage_amount: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $500,000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium Amount
              </label>
              <input
                type="text"
                value={lifeFormData.premium}
                onChange={(e) => setLifeFormData({ ...lifeFormData, premium: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Frequency
              </label>
              <select
                value={lifeFormData.payment_frequency}
                onChange={(e) => setLifeFormData({ ...lifeFormData, payment_frequency: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={lifeFormData.start_date}
                onChange={(e) => setLifeFormData({ ...lifeFormData, start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                value={lifeFormData.renewal_date}
                onChange={(e) => setLifeFormData({ ...lifeFormData, renewal_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beneficiaries
            </label>
            {lifeFormData.beneficiaries.map((beneficiary, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={beneficiary}
                  onChange={(e) => {
                    const newBeneficiaries = [...lifeFormData.beneficiaries];
                    newBeneficiaries[index] = e.target.value;
                    setLifeFormData({ ...lifeFormData, beneficiaries: newBeneficiaries });
                  }}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
                <button
                  onClick={() => {
                    const newBeneficiaries = lifeFormData.beneficiaries.filter((_, i) => i !== index);
                    setLifeFormData({ ...lifeFormData, beneficiaries: newBeneficiaries });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setLifeFormData({ 
                ...lifeFormData, 
                beneficiaries: [...lifeFormData.beneficiaries, ''] 
              })}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Beneficiary
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={lifeFormData.notes}
              onChange={(e) => setLifeFormData({ ...lifeFormData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLifeModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveLifeInsurance}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Policy'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Disability Insurance Modal */}
      <Modal
        isOpen={showDisabilityModal}
        onClose={() => setShowDisabilityModal(false)}
        title="Add Disability Insurance Policy"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <input
              type="text"
              value={disabilityFormData.provider}
              onChange={(e) => setDisabilityFormData({ ...disabilityFormData, provider: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Number
            </label>
            <input
              type="text"
              value={disabilityFormData.policy_number}
              onChange={(e) => setDisabilityFormData({ ...disabilityFormData, policy_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Type
            </label>
            <select
              value={disabilityFormData.coverage_type}
              onChange={(e) => setDisabilityFormData({ ...disabilityFormData, coverage_type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="short-term">Short-term Disability</option>
              <option value="long-term">Long-term Disability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Amount
            </label>
            <input
              type="text"
              value={disabilityFormData.coverage_amount}
              onChange={(e) => setDisabilityFormData({ ...disabilityFormData, coverage_amount: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 60% of salary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waiting Period
              </label>
              <input
                type="text"
                value={disabilityFormData.waiting_period}
                onChange={(e) => setDisabilityFormData({ ...disabilityFormData, waiting_period: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 90 days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefit Period
              </label>
              <input
                type="text"
                value={disabilityFormData.benefit_period}
                onChange={(e) => setDisabilityFormData({ ...disabilityFormData, benefit_period: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2 years"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium Amount
              </label>
              <input
                type="text"
                value={disabilityFormData.premium}
                onChange={(e) => setDisabilityFormData({ ...disabilityFormData, premium: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Frequency
              </label>
              <select
                value={disabilityFormData.payment_frequency}
                onChange={(e) => setDisabilityFormData({ ...disabilityFormData, payment_frequency: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={disabilityFormData.start_date}
                onChange={(e) => setDisabilityFormData({ ...disabilityFormData, start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                value={disabilityFormData.renewal_date}
                onChange={(e) => setDisabilityFormData({ ...disabilityFormData, renewal_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={disabilityFormData.notes}
              onChange={(e) => setDisabilityFormData({ ...disabilityFormData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDisabilityModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveDisabilityInsurance}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Policy'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Long-term Care Modal */}
      <Modal
        isOpen={showLongTermModal}
        onClose={() => setShowLongTermModal(false)}
        title="Add Long-term Care Policy"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <input
              type="text"
              value={longTermFormData.provider}
              onChange={(e) => setLongTermFormData({ ...longTermFormData, provider: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Number
            </label>
            <input
              type="text"
              value={longTermFormData.policy_number}
              onChange={(e) => setLongTermFormData({ ...longTermFormData, policy_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Benefit Amount
            </label>
            <input
              type="text"
              value={longTermFormData.daily_benefit}
              onChange={(e) => setLongTermFormData({ ...longTermFormData, daily_benefit: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $300 per day"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Elimination Period
              </label>
              <input
                type="text"
                value={longTermFormData.elimination_period}
                onChange={(e) => setLongTermFormData({ ...longTermFormData, elimination_period: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 90 days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefit Period
              </label>
              <input
                type="text"
                value={longTermFormData.benefit_period}
                onChange={(e) => setLongTermFormData({ ...longTermFormData, benefit_period: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3 years"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium Amount
              </label>
              <input
                type="text"
                value={longTermFormData.premium}
                onChange={(e) => setLongTermFormData({ ...longTermFormData, premium: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Frequency
              </label>
              <select
                value={longTermFormData.payment_frequency}
                onChange={(e) => setLongTermFormData({ ...longTermFormData, payment_frequency: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={longTermFormData.start_date}
                onChange={(e) => setLongTermFormData({ ...longTermFormData, start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                value={longTermFormData.renewal_date}
                onChange={(e) => setLongTermFormData({ ...longTermFormData, renewal_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={longTermFormData.notes}
              onChange={(e) => setLongTermFormData({ ...longTermFormData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLongTermModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveLongTermCare}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Policy'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* NDIS Modal */}
      <Modal
        isOpen={showNDISModal}
        onClose={() => setShowNDISModal(false)}
        title="Add NDIS Plan"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NDIS Number
            </label>
            <input
              type="text"
              value={ndisFormData.ndis_number}
              onChange={(e) => setNdisFormData({ ...ndisFormData, ndis_number: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Start Date
              </label>
              <input
                type="date"
                value={ndisFormData.plan_start_date}
                onChange={(e) => setNdisFormData({ ...ndisFormData, plan_start_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan End Date
              </label>
              <input
                type="date"
                value={ndisFormData.plan_end_date}
                onChange={(e) => setNdisFormData({ ...ndisFormData, plan_end_date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Management
            </label>
            <select
              value={ndisFormData.plan_manager}
              onChange={(e) => setNdisFormData({ ...ndisFormData, plan_manager: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="agency">NDIA Managed</option>
              <option value="plan_managed">Plan Managed</option>
              <option value="self_managed">Self Managed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Support Coordinator
            </label>
            <input
              type="text"
              value={ndisFormData.support_coordinator}
              onChange={(e) => setNdisFormData({ ...ndisFormData, support_coordinator: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Categories
            </label>
            {ndisFormData.funding_categories.map((category, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{category.category}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Total Amount
                    </label>
                    <input
                      type="text"
                      value={category.amount}
                      onChange={(e) => {
                        const newCategories = [...ndisFormData.funding_categories];
                        newCategories[index].amount = e.target.value;
                        setNdisFormData({ ...ndisFormData, funding_categories: newCategories });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Amount Used
                    </label>
                    <input
                      type="text"
                      value={category.used}
                      onChange={(e) => {
                        const newCategories = [...ndisFormData.funding_categories];
                        newCategories[index].used = e.target.value;
                        setNdisFormData({ ...ndisFormData, funding_categories: newCategories });
                      }}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={ndisFormData.notes}
              onChange={(e) => setNdisFormData({ ...ndisFormData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNDISModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNDIS}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save NDIS Plan'}
            </Button>
          </div>
        </div>
      </Modal>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-700 hover:text-red-900"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}