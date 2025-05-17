import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Mail, 
  Calendar, 
  BookMarked,
  Plus,
  Search,
  Filter,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { LegacyDashboard } from './LegacyDashboard';
import { Journal } from './Journal';
import { Letters } from './Letters';
import { Videos } from './Videos';
import { Notes } from './Notes';
import { MemoryBook } from './MemoryBook';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function LegacyManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const navItems: NavItem[] = [
    { 
      id: 'journal', 
      label: 'Journal', 
      icon: <BookOpen size={24} />,
      description: 'Record your daily thoughts and memories',
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      id: 'letters', 
      label: 'Letters', 
      icon: <Mail size={24} />,
      description: 'Write letters to loved ones',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'videos', 
      label: 'Video Messages', 
      icon: <Video size={24} />,
      description: 'Record and store video messages',
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'notes', 
      label: 'Legacy Notes', 
      icon: <FileText size={24} />,
      description: 'Create important notes and wishes',
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 'memorybook', 
      label: 'Memory Book', 
      icon: <BookMarked size={24} />,
      description: 'Compile memories into a keepsake book',
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/legacy/${id}`);
  };

  const handleAddJournalEntry = () => {
    navigate('/dashboard/legacy/journal');
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Legacy Management</h1>
              <p className="text-gray-600 mt-1">
                Preserve your memories and messages for loved ones
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddJournalEntry}
              icon={<Plus size={20} />}
            >
              Add Journal Entry
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search memories and messages..."
              className="flex-1"
            />
            <Button
              variant="outline"
              icon={<Filter size={20} />}
            >
              Filters
            </Button>
          </div>

          {/* Legacy Overview Card */}
          <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-6 border border-amber-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Heart className="text-rose-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Legacy</h2>
                <p className="text-gray-600">Preserve your memories, wisdom, and messages for future generations</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="text-amber-600" size={20} />
                  <span className="font-medium text-gray-900">Journal Entries</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  12
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Memories recorded
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-900">Letters</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  5
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Messages to loved ones
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="text-purple-600" size={20} />
                  <span className="font-medium text-gray-900">Video Messages</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  3
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Recorded memories
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer h-full"
                  onClick={() => handleNavigation(item.id)}
                >
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-idecide-primary flex items-center justify-center text-idecide-dark">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/legacy/journal')}
                >
                  <BookOpen size={20} className="mr-2" />
                  Add Journal Entry
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/legacy/letters')}
                >
                  <Mail size={20} className="mr-2" />
                  Write a Letter
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/legacy/memorybook')}
                >
                  <BookMarked size={20} className="mr-2" />
                  View Memory Book
                </Button>
              </div>
            </div>
          </Card>
        </div>
      } />
      <Route path="/dashboard" element={<LegacyDashboard />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/letters" element={<Letters />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/memorybook" element={<MemoryBook />} />
      <Route path="*" element={<Navigate to="/dashboard/legacy" replace />} />
    </Routes>
  );
}