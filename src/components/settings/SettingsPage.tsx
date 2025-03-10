import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Settings, Lock, Bell, Shield, Trash2, X } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { deleteAccount } = useAuthStore();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/auth/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Settings</h2>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#B5D3D3] rounded-lg">
              <Settings className="w-5 h-5 text-[#2D5959]" />
            </div>
            <h3 className="text-xl font-semibold">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border rounded-lg"
                placeholder="Your email"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#B5D3D3] rounded-lg">
              <Lock className="w-5 h-5 text-[#2D5959]" />
            </div>
            <h3 className="text-xl font-semibold">Security</h3>
          </div>
          <div className="space-y-4">
            <button className="w-full p-3 border rounded-lg text-left hover:bg-gray-50">
              Change Password
            </button>
            <button className="w-full p-3 border rounded-lg text-left hover:bg-gray-50">
              Two-Factor Authentication
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#B5D3D3] rounded-lg">
              <Bell className="w-5 h-5 text-[#2D5959]" />
            </div>
            <h3 className="text-xl font-semibold">Notifications</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span>Email notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span>Push notifications</span>
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#B5D3D3] rounded-lg">
              <Shield className="w-5 h-5 text-[#2D5959]" />
            </div>
            <h3 className="text-xl font-semibold">Privacy</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span>Make profile public</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span>Show online status</span>
            </label>
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-red-600">Delete Account</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Confirm Account Deletion</h3>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you absolutely sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>This will:</p>
                <ul className="list-disc ml-6">
                  <li>Permanently delete your account</li>
                  <li>Remove all your personal information</li>
                  <li>Delete all your documents and data</li>
                  <li>Cancel any active subscriptions</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;