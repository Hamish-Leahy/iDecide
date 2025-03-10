import React, { useState } from 'react';
import { UserPlus, Users, Shield, Clock, X, ChevronRight } from 'lucide-react';
import { useAccessStore, AccessLevel, AccessGrant, AccessInvite } from '../../store/accessStore';

interface AccessManagementModalProps {
  onClose: () => void;
}

const AccessLevelBadge = ({ level }: { level: AccessLevel }) => {
  const colors = {
    admin: 'bg-red-100 text-red-800',
    executor: 'bg-blue-100 text-blue-800',
    viewer: 'bg-green-100 text-green-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

const AccessManagementModal: React.FC<AccessManagementModalProps> = ({ onClose }) => {
  const { invites, grants, sendInvite, revokeAccess, updateAccessLevel } = useAccessStore();
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('viewer');
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      sendInvite(email, accessLevel);
      setEmail('');
    }
  };

  const activeGrants = grants.filter(g => !g.revokedAt);
  const pendingInvites = invites.filter(i => i.status === 'pending');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">Access Management</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="mb-8">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
              />
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
              >
                <option value="viewer">Viewer</option>
                <option value="executor">Executor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
              >
                Invite
              </button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 ${
                activeTab === 'members'
                  ? 'border-b-2 border-[#2D5959] text-[#2D5959]'
                  : 'text-gray-500'
              }`}
            >
              Members ({activeGrants.length})
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`px-4 py-2 ${
                activeTab === 'invites'
                  ? 'border-b-2 border-[#2D5959] text-[#2D5959]'
                  : 'text-gray-500'
              }`}
            >
              Pending Invites ({pendingInvites.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'members' ? (
            <div className="space-y-4">
              {activeGrants.map((grant) => (
                <div
                  key={grant.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">User ID: {grant.userId}</p>
                    <p className="text-sm text-gray-500">
                      Added {new Date(grant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={grant.accessLevel}
                      onChange={(e) =>
                        updateAccessLevel(grant.id, e.target.value as AccessLevel)
                      }
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="executor">Executor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => revokeAccess(grant.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-gray-500">
                      Invited {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <AccessLevelBadge level={invite.accessLevel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AccessManagementWidget = () => {
  const [showModal, setShowModal] = useState(false);
  const { grants } = useAccessStore();
  const activeGrants = grants.filter(g => !g.revokedAt);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Access Management</h3>
        <button
          onClick={() => setShowModal(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#2D5959] hover:bg-[#2D5959] hover:text-white transition-colors"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {activeGrants.slice(0, 3).map((grant) => (
          <div
            key={grant.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">User ID: {grant.userId}</p>
              <p className="text-sm text-gray-500">
                <AccessLevelBadge level={grant.accessLevel} />
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}

        {activeGrants.length > 3 && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full text-center text-sm text-[#2D5959] hover:text-[#85B1B1]"
          >
            View all {activeGrants.length} members
          </button>
        )}
      </div>

      {showModal && <AccessManagementModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default AccessManagementWidget;