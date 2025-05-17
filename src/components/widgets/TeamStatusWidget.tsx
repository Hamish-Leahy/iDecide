import React, { useState } from 'react';
import { Users, UserPlus, Search, MessageSquare } from 'lucide-react';
import { Card } from '../common/Card';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  lastActive?: Date;
  role: string;
}

interface TeamStatusWidgetProps {
  className?: string;
}

export function TeamStatusWidget({ className = '' }: TeamStatusWidgetProps) {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'online',
      role: 'Administrator'
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      status: 'away',
      lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      role: 'Deputy'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
      status: 'offline',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      role: 'Viewer'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
      status: 'busy',
      role: 'Editor'
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-amber-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  const getStatusText = (status: string, lastActive?: Date) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return lastActive ? `Away (${formatTime(lastActive)})` : 'Away';
      case 'busy':
        return 'Do not disturb';
      default:
        return lastActive ? `Offline (${formatTime(lastActive)})` : 'Offline';
    }
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ago`;
    }
  };
  
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={18} className="text-violet-500" />
            Team Members
          </h3>
          <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500" title="Add member">
            <UserPlus size={16} />
          </button>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full p-2 pl-8 text-sm border rounded-lg focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span 
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                      title={getStatusText(member.status, member.lastActive)}
                    ></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{member.role}</span>
                      <span className="mx-1">•</span>
                      <span>{getStatusText(member.status, member.lastActive)}</span>
                    </p>
                  </div>
                </div>
                <button
                  className="p-1 text-gray-400 hover:text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Send message"
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No members found
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}