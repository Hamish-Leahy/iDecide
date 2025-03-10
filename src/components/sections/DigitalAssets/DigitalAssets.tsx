import React, { useState, useEffect } from 'react';
import { Key, Wallet, Landmark, FileText, Plus, Search, Eye, EyeOff, Edit, Trash2, Lock, ArrowLeft } from 'lucide-react';
import { useDigitalAssetsStore, DigitalAsset } from '../../../store/digitalAssetsStore';
import VaultCodeModal from './VaultCodeModal';
import AssetForm from './AssetForm';

const categories = [
  { id: 'passwords', label: 'Passwords', icon: Key },
  { id: 'bank-accounts', label: 'Bank Accounts', icon: Landmark },
  { id: 'crypto', label: 'Crypto', icon: Wallet },
  { id: 'notes', label: 'Notes', icon: FileText },
];

const DigitalAssets = () => {
  const { assets, isVaultLocked, lockVault } = useDigitalAssetsStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null);

  // Lock vault when component mounts or when navigating back to it
  useEffect(() => {
    lockVault();
  }, []);

  if (isVaultLocked) {
    return <VaultCodeModal />;
  }

  if (!selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#2D5959]">Digital Assets</h1>
          <button
            onClick={lockVault}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
          >
            <Lock className="w-4 h-4" />
            Lock Vault
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#B5D3D3] rounded-lg">
                  <Icon className="w-6 h-6 text-[#2D5959]" />
                </div>
                <h2 className="text-xl font-semibold">{label}</h2>
              </div>
              <p className="text-gray-600">
                {assets.filter((asset) => asset.category === id).length} items stored
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === selectedCategory)!;
  const filteredAssets = assets.filter(
    (asset) =>
      asset.category === selectedCategory &&
      (asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.note?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Back to categories"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-[#2D5959]">{category.label}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={lockVault}
            className="flex items-center gap-2 px-4 py-2 border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-gray-50"
          >
            <Lock className="w-4 h-4" />
            Lock Vault
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      <div className="mb-6 relative">
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#2D5959] focus:border-transparent"
        />
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="space-y-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium">{asset.title}</h3>
                {asset.username && (
                  <p className="text-gray-600">{asset.username}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAsset(asset)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {asset.category === 'passwords' && (
              <div className="space-y-2">
                {asset.url && (
                  <p className="text-sm">
                    <span className="text-gray-500">URL:</span> {asset.url}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Password:</span>
                  <span className="font-mono">••••••••</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {asset.category === 'bank-accounts' && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Bank:</span> {asset.bankName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Account:</span>{' '}
                  {asset.accountNumber?.replace(/\d(?=\d{4})/g, '•')}
                </p>
              </div>
            )}

            {asset.category === 'crypto' && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Network:</span> {asset.network}
                </p>
                <p className="text-sm break-all">
                  <span className="text-gray-500">Address:</span>{' '}
                  {asset.walletAddress}
                </p>
              </div>
            )}

            {asset.category === 'notes' && (
              <p className="text-sm whitespace-pre-wrap">{asset.note}</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <AssetForm
          category={selectedCategory as DigitalAsset['category']}
          onClose={() => setShowForm(false)}
        />
      )}

      {selectedAsset && (
        <AssetForm
          category={selectedCategory as DigitalAsset['category']}
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default DigitalAssets;