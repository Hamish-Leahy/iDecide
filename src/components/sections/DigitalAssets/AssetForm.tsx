import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useDigitalAssetsStore, DigitalAsset } from '../../../store/digitalAssetsStore';

interface AssetFormProps {
  category: DigitalAsset['category'];
  asset?: DigitalAsset;
  onClose: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ category, asset, onClose }) => {
  const { addAsset, updateAsset } = useDigitalAssetsStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<DigitalAsset>>(
    asset || {
      category,
      title: '',
      username: '',
      password: '',
      url: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      walletAddress: '',
      network: '',
      note: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (asset) {
      updateAsset(asset.id, formData);
    } else {
      addAsset(formData as Omit<DigitalAsset, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">
            {asset ? 'Edit' : 'Add'} {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                required
              />
            </div>

            {category === 'passwords' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>
              </>
            )}

            {category === 'bank-accounts' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={formData.routingNumber}
                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  />
                </div>
              </>
            )}

            {category === 'crypto' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Network
                  </label>
                  <input
                    type="text"
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    required
                  />
                </div>
              </>
            )}

            {category === 'notes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                  rows={6}
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
            >
              {asset ? 'Save Changes' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;