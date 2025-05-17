import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Laptop, Smartphone, Tablet, HardDrive } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Device {
  id: string;
  name: string;
  type: string;
  serial_number?: string;
  purchase_date?: string;
  storage_location?: string;
  notes?: string;
}

const deviceTypes = [
  { value: 'laptop', label: 'Laptop', icon: Laptop },
  { value: 'smartphone', label: 'Smartphone', icon: Smartphone },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
  { value: 'storage', label: 'Storage Device', icon: HardDrive },
];

export function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDevices();
    }
  }, [user]);

  async function loadDevices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDevice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const device = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        serial_number: formData.get('serial_number') as string,
        purchase_date: formData.get('purchase_date') as string,
        storage_location: formData.get('storage_location') as string,
        notes: formData.get('notes') as string,
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('devices')
        .insert([device])
        .select()
        .single();

      if (error) throw error;

      setDevices(prev => [...prev, data]);
      setShowAddForm(false);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save device');
    }
  }

  async function handleDeleteDevice(id: string) {
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDevices(prev => prev.filter(device => device.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const getDeviceIcon = (type: string) => {
    const deviceType = deviceTypes.find(t => t.value === type);
    const Icon = deviceType?.icon || Laptop;
    return <Icon size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Devices</h2>
          <p className="text-gray-600 mt-1">Manage your physical devices and their information</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#1E1B4B] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1E1B4B]/90"
        >
          <Plus size={20} />
          Add Device
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map(device => (
          <div
            key={device.id}
            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {getDeviceIcon(device.type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{device.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteDevice(device.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {device.serial_number && (
                <p className="text-sm">
                  <span className="font-medium">Serial Number:</span> {device.serial_number}
                </p>
              )}
              {device.purchase_date && (
                <p className="text-sm">
                  <span className="font-medium">Purchase Date:</span>{' '}
                  {new Date(device.purchase_date).toLocaleDateString()}
                </p>
              )}
              {device.storage_location && (
                <p className="text-sm">
                  <span className="font-medium">Storage Location:</span> {device.storage_location}
                </p>
              )}
              {device.notes && (
                <p className="text-sm mt-2 text-gray-600">{device.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && !showAddForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No devices added yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-[#1E1B4B] hover:underline"
          >
            Add your first device
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Add Device</h2>
            <form onSubmit={handleSaveDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                  placeholder="e.g., Personal Laptop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Type
                </label>
                <select
                  name="type"
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                >
                  {deviceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serial_number"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="storage_location"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                  placeholder="e.g., Home Office"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1E1B4B] focus:border-transparent"
                  placeholder="Additional information about the device..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E1B4B] text-white px-4 py-2 rounded-lg hover:bg-[#1E1B4B]/90"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}