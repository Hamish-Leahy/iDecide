import React, { useState, useEffect } from 'react';
import { Activity, Filter, Clock, FileText, Key, User, Trash2 } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ActivityItem {
  id: string;
  type: 'document' | 'password' | 'login' | 'account' | 'other';
  action: string;
  target: string;
  timestamp: Date;
  user?: string;
}

interface RecentActivityWidgetProps {
  className?: string;
}

export function RecentActivityWidget({ className = '' }: RecentActivityWidgetProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    const loadActivity = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // In a real app, we would fetch from a user_activity table
      // For now, we'll create mock data based on the user's actual data
      
      try {
        const [assetsResponse, documentsResponse] = await Promise.all([
          supabase
            .from('digital_assets')
            .select('id, name, type, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(5),
          supabase
            .from('legal_documents')
            .select('id, title, type, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(5)
        ]);
        
        const mockActivities: ActivityItem[] = [];
        
        // Add activities from digital assets
        if (assetsResponse.data) {
          assetsResponse.data.forEach(asset => {
            mockActivities.push({
              id: `asset_${asset.id}`,
              type: asset.type === 'password' ? 'password' : 'document',
              action: 'updated',
              target: asset.name,
              timestamp: new Date(asset.updated_at)
            });
          });
        }
        
        // Add activities from legal documents
        if (documentsResponse.data) {
          documentsResponse.data.forEach(doc => {
            mockActivities.push({
              id: `doc_${doc.id}`,
              type: 'document',
              action: 'updated',
              target: doc.title,
              timestamp: new Date(doc.updated_at)
            });
          });
        }
        
        // Add a login activity
        mockActivities.push({
          id: 'login_1',
          type: 'login',
          action: 'logged in',
          target: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
        });
        
        // Sort by timestamp
        mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setActivities(mockActivities.slice(0, 10));
      } catch (error) {
        console.error('Error loading activity data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivity();
  }, [user]);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={16} className="text-[#1E1B4B]" />;
      case 'password':
        return <Key size={16} className="text-[#1E1B4B]" />;
      case 'login':
        return <User size={16} className="text-[#1E1B4B]" />;
      case 'account':
        return <Activity size={16} className="text-[#1E1B4B]" />;
      default:
        return <Activity size={16} className="text-[#1E1B4B]" />;
    }
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };
  
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);
    
  const clearActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity size={18} className="text-[#1E1B4B]" />
            Recent Activity
          </h3>
          <div className="relative">
            <button 
              onClick={() => setFilter(filter === 'all' ? 'document' : filter === 'document' ? 'password' : 'all')}
              className="p-1 rounded-full hover:bg-[#E5EDEB] text-[#1E1B4B]"
              title="Filter activities"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map(activity => (
              <div 
                key={activity.id}
                className="flex items-start justify-between p-2 rounded-lg hover:bg-[#F5F8F7] group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-[#E5EDEB] rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.target}</span> was {activity.action}
                      {activity.user && <span> by {activity.user}</span>}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => clearActivity(activity.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}