import React, { useState } from 'react';
import { useDigitalAssetsStore } from '../../../store/digitalAssetsStore';
import { Lock, X, Delete, ChevronLeft } from 'lucide-react';

const VaultCodeModal = () => {
  const { vaultCode, setVaultCode, unlockVault } = useDigitalAssetsStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length < 4 || code.length > 8) {
      setError('Code must be between 4 and 8 digits');
      return;
    }

    if (!vaultCode) {
      setVaultCode(code);
    } else if (!unlockVault(code)) {
      setError('Invalid code');
      return;
    }
  };

  const handleKeyPress = (value: string) => {
    if (code.length < 8) {
      setCode(prev => prev + value);
    }
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCode('');
  };

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['clear', '0', 'delete']
    ];

    return (
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto mt-6">
        {keys.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((key) => {
              if (key === 'delete') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleDelete}
                    className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-[#2D5959] hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                );
              }
              if (key === 'clear') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={handleClear}
                    className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-[#2D5959] hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-xl font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                  {key}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#B5D3D3] rounded-full">
            <Lock className="w-8 h-8 text-[#2D5959]" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          {vaultCode ? 'Enter Vault Code' : 'Set Vault Code'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {vaultCode
            ? 'Enter your vault code to access your digital assets'
            : 'Choose a 4-8 digit code to secure your digital assets'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="code" className="sr-only">
              Vault Code
            </label>
            <input
              type="password"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="block w-full text-center text-2xl tracking-widest py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959] focus:border-transparent"
              placeholder="••••"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              readOnly
            />
          </div>

          {renderKeypad()}

          <button
            type="submit"
            className="w-full py-3 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90 mt-6"
          >
            {vaultCode ? 'Unlock Vault' : 'Set Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VaultCodeModal;