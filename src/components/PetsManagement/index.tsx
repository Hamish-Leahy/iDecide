import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Cat, 
  Syringe, 
  Calendar, 
  ClipboardList, 
  Utensils, 
  Stethoscope,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { PetProfiles } from './PetProfiles';
import { VaccinationRecords } from './VaccinationRecords';
import { VeterinaryAppointments } from './VeterinaryAppointments';
import { PetCareSchedule } from './PetCareSchedule';
import { MedicalHistory } from './MedicalHistory';
import { DietNutrition } from './DietNutrition';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

export function PetsManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const navItems: NavItem[] = [
    { 
      id: 'profiles', 
      label: 'Pet Profiles', 
      icon: <Cat size={24} />,
      description: 'Manage your pet profiles',
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      id: 'vaccinations', 
      label: 'Vaccination Records', 
      icon: <Syringe size={24} />,
      description: 'Track vaccination history',
      color: 'bg-green-50 text-green-600'
    },
    { 
      id: 'appointments', 
      label: 'Veterinary Appointments', 
      icon: <Calendar size={24} />,
      description: 'Schedule vet appointments',
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'care', 
      label: 'Pet Care Schedule', 
      icon: <ClipboardList size={24} />,
      description: 'Manage care routines',
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'medical', 
      label: 'Medical History', 
      icon: <Stethoscope size={24} />,
      description: 'Track medical records',
      color: 'bg-red-50 text-red-600'
    },
    { 
      id: 'diet', 
      label: 'Diet & Nutrition', 
      icon: <Utensils size={24} />,
      description: 'Monitor diet and nutrition',
      color: 'bg-teal-50 text-teal-600'
    }
  ];

  const handleNavigation = (id: string) => {
    navigate(`/dashboard/pets/${id}`);
  };

  const handleAddPet = () => {
    navigate('/dashboard/pets/profiles');
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pet Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your pets' information and care
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddPet}
              icon={<Plus size={20} />}
            >
              Add Pet
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search pets..."
              className="flex-1"
            />
            <Button
              variant="outline"
              icon={<Filter size={20} />}
            >
              Filters
            </Button>
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
                  onClick={() => navigate('/dashboard/pets/profiles')}
                >
                  <Cat size={20} className="mr-2" />
                  Add New Pet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/pets/appointments')}
                >
                  <Calendar size={20} className="mr-2" />
                  Schedule Vet Visit
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/pets/vaccinations')}
                >
                  <Syringe size={20} className="mr-2" />
                  Update Vaccinations
                </Button>
              </div>
            </div>
          </Card>
        </div>
      } />
      <Route path="/profiles" element={<PetProfiles />} />
      <Route path="/vaccinations" element={<VaccinationRecords />} />
      <Route path="/appointments" element={<VeterinaryAppointments />} />
      <Route path="/care" element={<PetCareSchedule />} />
      <Route path="/medical" element={<MedicalHistory />} />
      <Route path="/diet" element={<DietNutrition />} />
      <Route path="*" element={<Navigate to="/dashboard/pets" replace />} />
    </Routes>
  );
}