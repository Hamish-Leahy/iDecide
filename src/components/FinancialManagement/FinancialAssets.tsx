import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, AlertCircle, Home, Car, Gem, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface FinancialAsset {
  id: string;
  type: string;
  name: string;
  description?: string;
  value: string;
  purchase_date?: string;
  location?: string;
  documentation?: string;
  status: string;
  notes?: string;
}

export function FinancialAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<FinancialAsset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [formData, setFormData] = useState({
    type: 'property',
    name: '',
    description: '',
    value: '',
    purchase_date: '',
    location: '',
    documentation: '',
    status: 'active',
    notes: ''
  });

  const assetTypes = [
    { value: 'property', label: 'Property', icon: Home },
    { value: 'vehicle', label: 'Vehicle', icon: Car },
    { value: 'collectible', label: 'Collectible', icon: Gem },
    { value: 'business', label: 'Business', icon: Building },
    { value: 'other', label: 'Other', icon: Briefcase }
  ];

  useEffect(() => {
    if (user) {
      loadAssets();
    }
  }, [user]);

  async function loadAssets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_assets')
        .select('*')
        .eq('user_id', user?.id)
        .not('type', 'eq', 'cryptocurrency')
        .not('type', 'eq', 'stock')
        .not('type', 'eq', 'etf')
        .not('type', 'eq', 'mutual_fund')
        .not('type', 'eq', 'bond');

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAsset = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_assets')
        .insert([{
          ...formData,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setAssets(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        type: 'property',
        name: '',
        description: '',
        value: '',
        purchase_date: '',
        location: '',
        documentation: '',
        status: 'active',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  };

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => {
      const value = parseFloat(asset.value || '0');
      return total + value;
    }, 0);
  };

  const getAssetsByType = (type: string) => {
    return assets.filter(asset => asset.type === type);
  };

  const getAssetIcon = (type: string) => {
    const assetType = assetTypes.find(t => t.value === type);
    const Icon = assetType?.icon || Briefcase;
    return <Icon size={20} className="text-gray-600" />;
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Assets</h1>
          <p className="text-gray-600 mt-1">Track and manage your valuable assets</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Asset
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Asset Value</h3>
            <p className="text-3xl font-bold">${calculateTotalValue().toLocaleString()}</p>
            <p className="text-sm mt-2 text-blue-100">Combined asset value</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Property Value</h3>
            <p className="text-3xl font-bold">
              ${getAssetsByType('property').reduce((sum, asset) => sum + parseFloat(asset.value || '0'), 0).toLocaleString()}
            </p>
            <p className="text-sm mt-2 text-green-100">Real estate assets</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Assets</h3>
            <p className="text-3xl font-bold">{assets.length}</p>
            <p className="text-sm mt-2 text-purple-100">Tracked assets</p>
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search assets..."
            className="flex-1"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Asset Types</option>
            {assetTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assets List */}
        <div className="divide-y">
          {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <div key={asset.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getAssetIcon(asset.type)}
                      <h3 className="font-medium text-gray-900">{asset.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {assetTypes.find(t => t.value === asset.type)?.label || asset.type}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      Value: ${parseFloat(asset.value).toLocaleString()}
                    </p>
                    {asset.purchase_date && (
                      <p className="text-sm text-gray-600">
                        Purchased: {new Date(asset.purchase_date).toLocaleDateString()}
                      </p>
                    )}
                    {asset.location && (
                      <p className="text-sm text-gray-600">
                        Location: {asset.location}
                      </p>
                    )}
                    {asset.description && (
                      <p className="text-sm text-gray-500 mt-2">{asset.description}</p>
                    )}
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                        ${asset.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        ${asset.status === 'sold' ? 'bg-blue-100 text-blue-800' : ''}
                        ${asset.status === 'transferred' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${asset.status === 'lost' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
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
                ? 'No assets match your search'
                : 'No assets added yet'}
              {!searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Asset
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Financial Asset"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {assetTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Primary Residence, 2022 Tesla Model 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the asset"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500000"
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
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Physical or digital location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documentation
            </label>
            <input
              type="text"
              value={formData.documentation}
              onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Location of related documents"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="transferred">Transferred</option>
              <option value="lost">Lost</option>
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
              placeholder="Additional notes about this asset"
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
              onClick={handleSaveAsset}
            >
              Save Asset
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