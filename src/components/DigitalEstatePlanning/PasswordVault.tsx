import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Lock, 
  Plus, 
  Search, 
  Copy, 
  Eye, 
  EyeOff, 
  Folder, 
  RefreshCw, 
  Share2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { encryptData, decryptData } from '../../lib/encryption';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';

interface DigitalAsset {
  id: string;
  name: string;
  type: string;
  url?: string;
  username?: string;
  encrypted_password?: string;
  notes?: string;
  strength?: 'weak' | 'medium' | 'strong';
  favorite?: boolean;
  last_used?: string;
  shared_with?: string[];
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: 'social', name: 'Social Media', color: 'bg-blue-100 text-blue-800' },
  { id: 'financial', name: 'Financial', color: 'bg-green-100 text-green-800' },
  { id: 'email', name: 'Email', color: 'bg-purple-100 text-purple-800' },
  { id: 'shopping', name: 'Shopping', color: 'bg-pink-100 text-pink-800' },
  { id: 'work', name: 'Work', color: 'bg-orange-100 text-orange-800' },
  { id: 'other', name: 'Other', color: 'bg-gray-100 text-gray-800' },
];

export function PasswordVault() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState<DigitalAsset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    category: 'other',
    notes: '',
  });

  // Password generator settings
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  useEffect(() => {
    if (user) {
      loadPasswords();
    }
  }, [user]);

  async function loadPasswords() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('digital_assets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'password');

      if (error) throw error;
      setPasswords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  }

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (generatorSettings.includeUppercase) chars += uppercase;
    if (generatorSettings.includeLowercase) chars += lowercase;
    if (generatorSettings.includeNumbers) chars += numbers;
    if (generatorSettings.includeSymbols) chars += symbols;

    let password = '';
    for (let i = 0; i < generatorSettings.length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setNewPassword({ ...newPassword, password });
  };

  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (!password) return 'weak';
    
    let score = 0;
    
    // Length check
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Determine strength based on score
    if (score >= 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  };

  const handleSavePassword = async () => {
    try {
      const encryptedPassword = await encryptData(newPassword.password);
      const strength = calculatePasswordStrength(newPassword.password);
      
      const { data, error } = await supabase
        .from('digital_assets')
        .insert([{
          user_id: user?.id,
          type: 'password',
          name: newPassword.title,
          username: newPassword.username,
          encrypted_password: encryptedPassword,
          url: newPassword.url,
          category: newPassword.category,
          notes: newPassword.notes,
          strength: strength,
          favorite: false,
          last_used: new Date().toISOString(),
          shared_with: []
        }])
        .select()
        .single();

      if (error) throw error;

      setPasswords(prev => [...prev, data]);
      setShowAddModal(false);
      setNewPassword({
        title: '',
        username: '',
        password: '',
        url: '',
        category: 'other',
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save password');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const togglePasswordVisibility = async (id: string, encryptedPassword?: string) => {
    if (!encryptedPassword) return;

    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleFavorite = async (id: string, currentFavorite: boolean = false) => {
    try {
      const { error } = await supabase
        .from('digital_assets')
        .update({ favorite: !currentFavorite })
        .eq('id', id);

      if (error) throw error;

      setPasswords(prev => 
        prev.map(password => 
          password.id === id 
            ? { ...password, favorite: !currentFavorite } 
            : password
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorite status');
    }
  };

  const updateLastUsed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('digital_assets')
        .update({ last_used: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update last used timestamp:', err);
    }
  };

  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = 
      password.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (password.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesCategory = !selectedCategory || password.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Password Vault</h1>
          <p className="text-gray-600 mt-1">Securely store and manage your passwords</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={20} />}
        >
          Add Password
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <div className="w-64 space-y-6">
          <Card>
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors
                    ${!selectedCategory ? 'bg-idecide-primary text-idecide-accent' : 'hover:bg-gray-100'}`}
                >
                  All Passwords
                </button>
                {defaultCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors
                      ${selectedCategory === category.id ? 'bg-idecide-primary text-idecide-accent' : 'hover:bg-gray-100'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Password Generator</h2>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPasswordGenerator(true)}
              >
                Generate Password
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search passwords..."
              className="flex-1"
            />
          </div>

          <Card>
            <div className="p-6">
              <div className="space-y-4">
                {filteredPasswords.length > 0 ? (
                  filteredPasswords.map(password => (
                    <motion.div
                      key={password.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg">
                          <Lock className="text-gray-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{password.name}</h3>
                          <p className="text-sm text-gray-500">{password.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (password.username) {
                              copyToClipboard(password.username, `${password.id}-username`);
                              updateLastUsed(password.id);
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 relative"
                          title="Copy username"
                          disabled={!password.username}
                        >
                          <Copy size={16} />
                          {copiedId === `${password.id}-username` && (
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                              Copied!
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => togglePasswordVisibility(password.id, password.encrypted_password)}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title={showPasswords[password.id] ? 'Hide password' : 'Show password'}
                          disabled={!password.encrypted_password}
                        >
                          {showPasswords[password.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            if (password.encrypted_password) {
                              copyToClipboard(password.encrypted_password, `${password.id}-password`);
                              updateLastUsed(password.id);
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 relative"
                          title="Copy password"
                          disabled={!password.encrypted_password}
                        >
                          <Copy size={16} />
                          {copiedId === `${password.id}-password` && (
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                              Copied!
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => toggleFavorite(password.id, password.favorite)}
                          className={`p-2 ${password.favorite ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
                          title={password.favorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill={password.favorite ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery 
                      ? 'No passwords match your search' 
                      : 'No passwords found. Add your first password to get started.'}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Password Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Password"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newPassword.title}
              onChange={(e) => setNewPassword({ ...newPassword, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={newPassword.username}
              onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPassword.password}
                onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              />
              <Button
                variant="outline"
                onClick={() => setShowPasswordGenerator(true)}
                icon={<RefreshCw size={16} />}
              >
                Generate
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={newPassword.url}
              onChange={(e) => setNewPassword({ ...newPassword, url: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newPassword.category}
              onChange={(e) => setNewPassword({ ...newPassword, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
            >
              {defaultCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={newPassword.notes}
              onChange={(e) => setNewPassword({ ...newPassword, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-idecide-accent"
              rows={3}
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
              onClick={handleSavePassword}
            >
              Save Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Generator Modal */}
      <Modal
        isOpen={showPasswordGenerator}
        onClose={() => setShowPasswordGenerator(false)}
        title="Password Generator"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Length
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={generatorSettings.length}
              onChange={(e) => setGeneratorSettings({
                ...generatorSettings,
                length: parseInt(e.target.value)
              })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">
              {generatorSettings.length} characters
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={generatorSettings.includeUppercase}
                onChange={(e) => setGeneratorSettings({
                  ...generatorSettings,
                  includeUppercase: e.target.checked
                })}
                className="rounded text-idecide-accent focus:ring-idecide-accent"
              />
              <span>Include uppercase letters (A-Z)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={generatorSettings.includeLowercase}
                onChange={(e) => setGeneratorSettings({
                  ...generatorSettings,
                  includeLowercase: e.target.checked
                })}
                className="rounded text-idecide-accent focus:ring-idecide-accent"
              />
              <span>Include lowercase letters (a-z)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={generatorSettings.includeNumbers}
                onChange={(e) => setGeneratorSettings({
                  ...generatorSettings,
                  includeNumbers: e.target.checked
                })}
                className="rounded text-idecide-accent focus:ring-idecide-accent"
              />
              <span>Include numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={generatorSettings.includeSymbols}
                onChange={(e) => setGeneratorSettings({
                  ...generatorSettings,
                  includeSymbols: e.target.checked
                })}
                className="rounded text-idecide-accent focus:ring-idecide-accent"
              />
              <span>Include symbols (!@#$%^&*)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordGenerator(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                generatePassword();
                setShowPasswordGenerator(false);
              }}
            >
              Generate Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}