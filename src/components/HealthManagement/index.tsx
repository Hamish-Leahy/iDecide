import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Pill, 
  Activity, 
  FileText, 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  Stethoscope, 
  Syringe,
  Thermometer,
  Clipboard
} 

from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { MedicalRecords } from './MedicalRecords';
import { Medications } from './Medications';
import { HealthProviders } from './HealthProviders';
import { Appointments } from './Appointments';
import { Immunizations } from './Immunizations';
import { EmergencyContacts } from './EmergencyContacts';

interface HealthOverview {
  totalProviders: number;
  upcomingAppointments: number;
  activeMedications: number;
  lastCheckup: string;
  nextAppointment: string;
  recentUpdates: number;
}

export function HealthManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<HealthOverview>({
    totalProviders: 0,
    upcomingAppointments: 0,
    activeMedications: 0,
    lastCheckup: '',
    nextAppointment: '',
    recentUpdates: 0
  });

  const navItems = [
    { 
      id: 'records', 
      label: 'Medical Records', 
      icon: <FileText size={24} />,
      description: 'View and manage medical history',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'medications', 
      label: 'Medications', 
      icon: <Pill size={24} />,
      description: 'Track medications and prescriptions',
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'providers', 
      label: 'Healthcare Providers', 
      icon: <Stethoscope size={24} />,
      description: 'Manage your healthcare team',
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: <Calendar size={24} />,
      description: 'Schedule and track appointments',
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      id: 'immunizations', 
      label: 'Immunizations', 
      icon: <Syringe size={24} />,
      description: 'Track vaccinations and boosters',
      color: 'bg-indigo-50 text-indigo-600'
    },
    { 
      id: 'emergency', 
      label: 'Emergency Contacts', 
      icon: <Users size={24} />,
      description: 'Manage emergency contacts',
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  useEffect(() => {
    if (user) {
      loadHealthData();
    }
  }, [user]);

  async function loadHealthData() {
    try {
      setLoading(true);

      // Fetch providers
      const { data: providers, error: providersError } = await supabase
        .from('health_providers')
        .select('*')
        .eq('user_id', user?.id);

      if (providersError) throw providersError;

      // Fetch appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('health_appointments')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // Fetch medications
      const { data: medications, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (medicationsError) throw medicationsError;

      // Update overview
      setOverview({
        totalProviders: providers?.length || 0,
        upcomingAppointments: appointments?.length || 0,
        activeMedications: medications?.length || 0,
        lastCheckup: appointments?.[0]?.date || 'No recent checkups',
        nextAppointment: appointments?.[0]?.date || 'No upcoming appointments',
        recentUpdates: 0
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  }

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/health/${id}`);
  };

  const handleAddRecord = () => {
    navigate('/dashboard/health/records');
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Management</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your health information
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddRecord}
              icon={<Plus size={20} />}
            >
              Add Record
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search health records..."
              className="flex-1"
            />
            <Button
              variant="outline"
              icon={<Filter size={20} />}
            >
              Filters
            </Button>
          </div>

          {/* Health Vitals Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Health Vitals</h2>
                <p className="text-gray-600">Your health at a glance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="text-purple-600" size={20} />
                  <span className="font-medium text-gray-900">Active Medications</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {overview.activeMedications}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Current prescriptions
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-amber-600" size={20} />
                  <span className="font-medium text-gray-900">Upcoming Appointments</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {overview.upcomingAppointments}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Scheduled visits
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="text-green-600" size={20} />
                  <span className="font-medium text-gray-900">Healthcare Team</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {overview.totalProviders}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Active providers
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
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
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
                  onClick={() => navigate('/dashboard/health/records')}
                >
                  <FileText size={20} className="mr-2" />
                  Add Medical Record
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/health/medications')}
                >
                  <Pill size={20} className="mr-2" />
                  Track Medication
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/health/appointments')}
                >
                  <Calendar size={20} className="mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </Card>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
        </div>
      } />
      <Route path="records" element={<MedicalRecords />} />
      <Route path="medications" element={<Medications />} />
      <Route path="providers" element={<HealthProviders />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="immunizations" element={<Immunizations />} />
      <Route path="emergency" element={<EmergencyContacts />} />
      <Route path="*" element={<Navigate to="/dashboard/health" replace />} />
    </Routes>
  );
}