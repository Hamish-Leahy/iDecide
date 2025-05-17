import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, ExternalLink, Star, Shield } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface DigitalAsset {
  id: string;
  name: string;
  type: string;
  url?: string;
  username?: string;
  encrypted_password?: string;
  strength?: 'weak' | 'medium' | 'strong';
  favorite?: boolean;
}

interface DigitalAssetsWidgetProps {
  className?: string;
}

export function DigitalAssetsWidget({ className = '' }: DigitalAssetsWidgetProps) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadAssets = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('digital_assets')
          .select('id, name, type, url, username, encrypted_password, strength, favorite')
          .eq('user_id', user.id)
          .eq('type', 'password')
          .order('favorite', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        setAssets(data || []);
      } catch (error) {
        console.error('Error loading digital assets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAssets();
  }, [user]);
  
  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };
  
  const getStrengthColor = (strength?: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'weak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key size={18} className="text-[#1E1B4B]" />
            Digital Assets
          </h3>
          <a 
            href="/dashboard/digital/security" 
            className="text-xs text-[#1E1B4B] hover:text-[#2D2A6A]"
          >
            View All
          </a>
        </div>
        
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : assets.length > 0 ? (
            assets.map(asset => (
              <div 
                key={asset.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F8F7] group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-full bg-[#E5EDEB] text-[#1E1B4B]">
                    <Key size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{asset.name}</p>
                      {asset.favorite && (
                        <Star size={12} className="text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    {asset.username && (
                      <p className="text-xs text-gray-500 truncate">{asset.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {asset.strength && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStrengthColor(asset.strength)}`}>
                      {asset.strength}
                    </span>
                  )}
                  {asset.encrypted_password && (
                    <button
                      onClick={() => togglePasswordVisibility(asset.id)}
                      className="p-1 text-gray-400 hover:text-[#1E1B4B] opacity-0 group-hover:opacity-100 transition-opacity"
                      title={showPasswords[asset.id] ? 'Hide password' : 'Show password'}
                    >
                      {showPasswords[asset.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                  {asset.username && (
                    <button
                      onClick={() => copyToClipboard(asset.username!, `${asset.id}-username`)}
                      className="p-1 text-gray-400 hover:text-[#1E1B4B] opacity-0 group-hover:opacity-100 transition-opacity relative"
                      title="Copy username"
                    >
                      <Copy size={14} />
                      {copiedId === `${asset.id}-username` && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                          Copied!
                        </span>
                      )}
                    </button>
                  )}
                  {asset.url && (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-[#1E1B4B] opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Open website"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              <p>No digital assets found</p>
              <a 
                href="/dashboard/digital/security" 
                className="mt-2 inline-block text-[#1E1B4B] hover:text-[#2D2A6A]"
              >
                Add your first password
              </a>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield size={12} />
            <span>All passwords are securely encrypted</span>
          </div>
        </div>
      </div>
    </Card>
  );
}