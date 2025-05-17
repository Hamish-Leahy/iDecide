import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Shield, 
  QrCode, 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Lock, 
  Fingerprint, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { encryptData, decryptData } from '../../lib/encryption';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface CryptoAsset {
  id: string;
  type: string;
  name: string;
  symbol: string;
  amount: string;
  wallet_address?: string;
  private_key_encrypted?: string;
  seed_phrase_encrypted?: string;
  platform?: string;
  notes?: string;
  security_level: 'standard' | 'high' | 'maximum';
  two_factor_enabled: boolean;
  biometric_enabled: boolean;
  backup_enabled: boolean;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  address: string;
}

export function DigitalWallet() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);

  // Mock market data - in a real app, this would come from a crypto API
  const mockMarketData = {
    'BTC': { price: 65000, change: 2.5 },
    'ETH': { price: 3200, change: -1.2 },
    'SOL': { price: 120, change: 5.8 },
  };

  // Mock transactions
  const mockTransactions: Transaction[] = [
    { id: '1', type: 'receive', amount: '0.25 BTC', timestamp: '2025-03-30T10:30:00Z', status: 'completed', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { id: '2', type: 'send', amount: '2.5 ETH', timestamp: '2025-03-29T15:45:00Z', status: 'completed', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { id: '3', type: 'receive', amount: '100 SOL', timestamp: '2025-03-28T09:15:00Z', status: 'completed', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
  ];

  const [formData, setFormData] = useState({
    type: 'wallet',
    name: '',
    symbol: '',
    amount: '',
    wallet_address: '',
    private_key: '',
    seed_phrase: '',
    platform: '',
    notes: '',
    security_level: 'standard' as const,
    two_factor_enabled: false,
    biometric_enabled: false,
    backup_enabled: false
  });

  const walletTypes = [
    { value: 'hot_wallet', label: 'Hot Wallet' },
    { value: 'cold_wallet', label: 'Cold Storage' },
    { value: 'exchange', label: 'Exchange Account' },
    { value: 'defi', label: 'DeFi Wallet' }
  ];

  const securityLevels = [
    { value: 'standard', label: 'Standard', description: 'Basic encryption and password protection' },
    { value: 'high', label: 'High', description: '2FA and enhanced encryption' },
    { value: 'maximum', label: 'Maximum', description: 'Biometric, 2FA, and advanced encryption' }
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
        .eq('type', 'cryptocurrency');

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load digital assets');
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAsset = async () => {
    try {
      const assetData = {
        type: 'cryptocurrency',
        name: formData.name,
        symbol: formData.symbol,
        value: formData.amount,
        wallet_address: formData.wallet_address,
        private_key_encrypted: formData.private_key ? await encryptData(formData.private_key) : null,
        seed_phrase_encrypted: formData.seed_phrase ? await encryptData(formData.seed_phrase) : null,
        platform: formData.platform,
        notes: formData.notes,
        user_id: user?.id,
        metadata: {
          security_level: formData.security_level,
          two_factor_enabled: formData.two_factor_enabled,
          biometric_enabled: formData.biometric_enabled,
          backup_enabled: formData.backup_enabled
        }
      };

      const { data, error } = await supabase
        .from('financial_assets')
        .insert([assetData])
        .select()
        .single();

      if (error) throw error;

      setAssets(prev => [...prev, data]);
      setShowAddModal(false);
      setFormData({
        type: 'wallet',
        name: '',
        symbol: '',
        amount: '',
        wallet_address: '',
        private_key: '',
        seed_phrase: '',
        platform: '',
        notes: '',
        security_level: 'standard',
        two_factor_enabled: false,
        biometric_enabled: false,
        backup_enabled: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save digital asset');
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
      if (selectedAsset?.id === id) {
        setSelectedAsset(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete digital asset');
    }
  };

  const toggleSensitiveInfo = (assetId: string) => {
    setShowSensitiveInfo(prev => ({
      ...prev,
      [assetId]: !prev[assetId]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => {
      const price = mockMarketData[asset.symbol]?.price || 0;
      const amount = parseFloat(asset.amount || '0');
      return total + (price * amount);
    }, 0);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Digital Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your cryptocurrency and digital assets</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSecurityModal(true)}
            icon={<Shield size={20} />}
          >
            Security Settings
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            icon={<Plus size={20} />}
          >
            Add Asset
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
            <p className="text-3xl font-bold">${calculateTotalValue().toLocaleString()}</p>
            <p className="text-sm mt-2 text-indigo-100">Total crypto assets</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Active Wallets</h3>
            <p className="text-3xl font-bold">{assets.length}</p>
            <p className="text-sm mt-2 text-emerald-100">Secure storage</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Security Status</h3>
            <p className="text-xl font-bold flex items-center gap-2">
              <Shield size={24} />
              Maximum Protection
            </p>
            <p className="text-sm mt-2 text-violet-100">All security features enabled</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Your Assets</h2>
          </div>
          <div className="divide-y">
            {assets.map(asset => (
              <div 
                key={asset.id} 
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer
                  ${selectedAsset?.id === asset.id ? 'bg-gray-50' : ''}`}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{asset.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">{asset.amount} {asset.symbol}</p>
                        <span className={`text-sm ${
                          mockMarketData[asset.symbol]?.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mockMarketData[asset.symbol]?.change > 0 ? '+' : ''}
                          {mockMarketData[asset.symbol]?.change}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ${(parseFloat(asset.amount) * (mockMarketData[asset.symbol]?.price || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.security_level === 'maximum' && (
                      <Shield className="text-green-500" size={16} />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAsset(asset.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {assets.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No digital assets added yet
              </div>
            )}
          </div>
        </div>

        {/* Asset Details */}
        <div className="bg-white rounded-xl border shadow-sm">
          {selectedAsset ? (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Asset Details</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Recent Transactions</h3>
                  <div className="mt-2 space-y-2">
                    {mockTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {transaction.type === 'receive' ? (
                            <ArrowUpRight className="text-green-500" size={20} />
                          ) : (
                            <ArrowDownRight className="text-red-500" size={20} />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.type === 'receive' ? 'Received' : 'Sent'} {transaction.amount}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Wallet Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Type</span>
                      <span className="text-sm font-medium capitalize">{selectedAsset.type}</span>
                    </div>
                    {selectedAsset.wallet_address && (
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500">Wallet Address</label>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <code className="text-xs text-gray-700 flex-1 break-all">
                            {selectedAsset.wallet_address}
                          </code>
                          <button
                            onClick={() => copyToClipboard(selectedAsset.wallet_address!)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Security Level</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        selectedAsset.security_level === 'maximum' ? 'bg-green-100 text-green-800' :
                        selectedAsset.security_level === 'high' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAsset.security_level}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Lock size={16} />
                        <span>2FA {selectedAsset.two_factor_enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Fingerprint size={16} />
                        <span>Biometric {selectedAsset.biometric_enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <RefreshCw size={16} />
                        <span>Backup {selectedAsset.backup_enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAsset.notes && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{selectedAsset.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select an asset to view details
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Digital Asset"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {walletTypes.map(type => (
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
              placeholder="e.g., Bitcoin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., BTC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.wallet_address}
                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter wallet address"
              />
              <button
                className="p-2 text-gray-400 hover:text-gray-600 border rounded-lg"
                title="Scan QR Code"
              >
                <QrCode size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Private Key
            </label>
            <div className="relative">
              <input
                type={showSensitiveInfo['private_key'] ? 'text' : 'password'}
                value={formData.private_key}
                onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter private key"
              />
              <button
                onClick={() => toggleSensitiveInfo('private_key')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSensitiveInfo['private_key'] ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seed Phrase
            </label>
            <div className="relative">
              <textarea
                value={formData.seed_phrase}
                onChange={(e) => setFormData({ ...formData, seed_phrase: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter seed phrase"
              />
              <button
                onClick={() => toggleSensitiveInfo('seed_phrase')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                {showSensitiveInfo['seed_phrase'] ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform/Exchange
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Binance, Coinbase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Level
            </label>
            <div className="space-y-2">
              {securityLevels.map(level => (
                <label key={level.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="security_level"
                    value={level.value}
                    checked={formData.security_level === level.value}
                    onChange={(e) => setFormData({ ...formData, security_level: e.target.value as any })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-sm text-gray-500">{level.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.two_factor_enabled}
                onChange={(e) => setFormData({ ...formData, two_factor_enabled: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.biometric_enabled}
                onChange={(e) => setFormData({ ...formData, biometric_enabled: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Biometric Authentication</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.backup_enabled}
                onChange={(e) => setFormData({ ...formData, backup_enabled: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Automatic Backups</span>
            </label>
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
              onClick={handleSaveAsset}
            >
              Save Asset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Security Settings Modal */}
      <Modal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        title="Security Settings"
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <Shield size={20} />
              <span>Maximum Security Enabled</span>
            </div>
            <p className="text-sm text-green-700">
              Your wallet is protected with the highest level of security features.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Authentication Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Password Protection</p>
                    <p className="text-sm text-gray-500">Strong password required</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <QrCode size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Additional verification required</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Fingerprint size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Biometric Authentication</p>
                    <p className="text-sm text-gray-500">Fingerprint or Face ID</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Enabled</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Backup & Recovery</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <RefreshCw size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Automatic Backups</p>
                    <p className="text-sm text-gray-500">Daily encrypted backups</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Recovery Phrase</p>
                    <p className="text-sm text-gray-500">12-word backup phrase</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Transaction Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Transaction Limits</p>
                    <p className="text-sm text-gray-500">Daily: $10,000</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Adjust</Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Whitelisted Addresses</p>
                    <p className="text-sm text-gray-500">3 addresses</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowSecurityModal(false)}
            >
              Close
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