import React, { useState } from 'react';
import { Cat, Dog, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'small_mammal' | 'reptile' | 'other';
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  microchipNumber?: string;
  registrationNumber?: string;
  image?: string;
  notes?: string;
}

export function PetProfiles() {
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 5,
      weight: 30,
      color: 'Golden',
      microchipNumber: '123456789012345',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    },
    {
      id: '2',
      name: 'Whiskers',
      species: 'cat',
      breed: 'Domestic Shorthair',
      age: 3,
      weight: 4.5,
      color: 'Tabby',
      microchipNumber: '987654321098765',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog' as Pet['species'],
    breed: '',
    age: '',
    weight: '',
    color: '',
    microchipNumber: '',
    registrationNumber: '',
    image: '',
    notes: ''
  });
  
  const handleAddPet = () => {
    setFormData({
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      weight: '',
      color: '',
      microchipNumber: '',
      registrationNumber: '',
      image: '',
      notes: ''
    });
    setShowAddModal(true);
  };
  
  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age?.toString() || '',
      weight: pet.weight?.toString() || '',
      color: pet.color || '',
      microchipNumber: pet.microchipNumber || '',
      registrationNumber: pet.registrationNumber || '',
      image: pet.image || '',
      notes: pet.notes || ''
    });
    setShowEditModal(true);
  };
  
  const handleSavePet = () => {
    try {
      if (!formData.name) {
        setError('Pet name is required');
        return;
      }
      
      const newPet: Pet = {
        id: Date.now().toString(),
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color || undefined,
        microchipNumber: formData.microchipNumber || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        image: formData.image || undefined,
        notes: formData.notes || undefined
      };
      
      setPets([...pets, newPet]);
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError('Failed to save pet');
    }
  };
  
  const handleUpdatePet = () => {
    try {
      if (!selectedPet || !formData.name) {
        setError('Pet name is required');
        return;
      }
      
      const updatedPet: Pet = {
        ...selectedPet,
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color || undefined,
        microchipNumber: formData.microchipNumber || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        image: formData.image || undefined,
        notes: formData.notes || undefined
      };
      
      setPets(pets.map(pet => pet.id === selectedPet.id ? updatedPet : pet));
      setShowEditModal(false);
      setSelectedPet(null);
      setError(null);
    } catch (err) {
      setError('Failed to update pet');
    }
  };
  
  const handleDeletePet = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      setPets(pets.filter(pet => pet.id !== id));
    }
  };
  
  const getPetIcon = (species: string) => {
    switch (species) {
      case 'dog':
        return <Dog size={24} className="text-amber-600" />;
      case 'cat':
        return <Cat size={24} className="text-gray-600" />;
      default:
        return <Cat size={24} className="text-gray-600" />;
    }
  };
  
  const getSpeciesLabel = (species: string) => {
    switch (species) {
      case 'dog': return 'Dog';
      case 'cat': return 'Cat';
      case 'bird': return 'Bird';
      case 'fish': return 'Fish';
      case 'small_mammal': return 'Small Mammal';
      case 'reptile': return 'Reptile';
      default: return 'Other';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pet Profiles</h1>
          <p className="text-gray-600 mt-1">Manage your pets' information</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddPet}
          icon={<Plus size={20} />}
        >
          Add Pet
        </Button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map(pet => (
          <Card key={pet.id} className="overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              {pet.image ? (
                <img 
                  src={pet.image} 
                  alt={pet.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  {getPetIcon(pet.species)}
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleEditPet(pet)}
                  className="p-1.5 bg-white rounded-full text-gray-600 hover:text-[#1E1B4B] shadow-sm"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDeletePet(pet.id)}
                  className="p-1.5 bg-white rounded-full text-gray-600 hover:text-red-600 shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                <span className="text-xs px-2 py-1 bg-[#E5EDEB] text-[#1E1B4B] rounded-full">
                  {getSpeciesLabel(pet.species)}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                {pet.breed && <p>Breed: {pet.breed}</p>}
                {pet.age && <p>Age: {pet.age} years</p>}
                {pet.weight && <p>Weight: {pet.weight} kg</p>}
                {pet.color && <p>Color: {pet.color}</p>}
                {pet.microchipNumber && (
                  <p className="truncate">Microchip: {pet.microchipNumber}</p>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => handleEditPet(pet)}
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
        
        {/* Add Pet Card */}
        <Card 
          className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-300 hover:border-[#1E1B4B] cursor-pointer"
          onClick={handleAddPet}
        >
          <Plus size={40} className="text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium">Add New Pet</p>
        </Card>
      </div>
      
      {/* Add Pet Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Pet"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter pet name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species*
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value as Pet['species'] })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                required
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="fish">Fish</option>
                <option value="small_mammal">Small Mammal</option>
                <option value="reptile">Reptile</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter breed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter color"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter age"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter weight"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Microchip Number
              </label>
              <input
                type="text"
                value={formData.microchipNumber}
                onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter microchip number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter registration number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
              placeholder="Enter image URL"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
              rows={3}
              placeholder="Enter any additional notes"
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
              onClick={handleSavePet}
            >
              Save Pet
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Pet Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${selectedPet?.name}`}
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter pet name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species*
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value as Pet['species'] })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                required
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="fish">Fish</option>
                <option value="small_mammal">Small Mammal</option>
                <option value="reptile">Reptile</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter breed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter color"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter age"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter weight"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Microchip Number
              </label>
              <input
                type="text"
                value={formData.microchipNumber}
                onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter microchip number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Enter registration number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
              placeholder="Enter image URL"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
              rows={3}
              placeholder="Enter any additional notes"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdatePet}
            >
              Update Pet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}