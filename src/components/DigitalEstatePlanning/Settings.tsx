import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell, Users, Key } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-8 border border-gray-200"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gray-100 rounded-lg">
            <SettingsIcon className="text-gray-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            <p className="text-gray-600">Configure your digital estate preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-gray-600" size={20} />
              <h3 className="font-medium text-gray-900">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Two-factor authentication</span>
                <button className="text-blue-600 hover:text-blue-700">Enable</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Biometric authentication</span>
                <button className="text-blue-600 hover:text-blue-700">Configure</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-gray-600" size={20} />
              <h3 className="font-medium text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Security alerts</span>
                <button className="text-blue-600 hover:text-blue-700">Configure</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Document updates</span>
                <button className="text-blue-600 hover:text-blue-700">Configure</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-gray-600" size={20} />
              <h3 className="font-medium text-gray-900">Deputy Access</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Default access levels</span>
                <button className="text-blue-600 hover:text-blue-700">Configure</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Emergency access protocol</span>
                <button className="text-blue-600 hover:text-blue-700">Configure</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-gray-600" size={20} />
              <h3 className="font-medium text-gray-900">Data Management</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Export all data</span>
                <button className="text-blue-600 hover:text-blue-700">Export</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Delete account</span>
                <button className="text-red-600 hover:text-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}