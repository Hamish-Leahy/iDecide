import React from 'react';
import { Gavel, Bell, Lock, Users } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export function LegalSettings() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Settings</h1>
          <p className="text-gray-600 mt-1">Configure your legal document preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Document review reminders</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Policy expiration alerts</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Document access controls</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Two-factor authentication</span>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">Sharing</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Deputy access levels</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Professional access</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">Legal Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Document templates</span>
                <Button variant="outline" size="sm">Customize</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Default settings</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}