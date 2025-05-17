import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ClipboardList, 
  FileCheck,
  Plus,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function QualityAssurance() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('incidents');

  useEffect(() => {
    // Simulating data fetch
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Assurance</h1>
          <p className="text-gray-600 mt-1">
            Ensure compliance and manage incidents
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
        >
          Report New Incident
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ClipboardList className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Incidents</p>
              <p className="text-xl font-semibold">23</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Incidents</p>
              <p className="text-xl font-semibold">5</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-xl font-semibold">18</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Audit</p>
              <p className="text-xl font-semibold">Mar 15</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-2 rounded-md text-sm ${activeTab === 'incidents' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setActiveTab('incidents')}
          >
            Incidents
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm ${activeTab === 'compliance' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setActiveTab('compliance')}
          >
            Compliance
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm ${activeTab === 'audits' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            onClick={() => setActiveTab('audits')}
          >
            Audits
          </button>
        </div>
        
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search incidents..."
          className="w-full md:w-auto md:min-w-[300px]"
        />
      </div>

      {/* Main Content */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Incidents</h2>
          
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              {[
                { 
                  id: 'INC-2025-043', 
                  date: '2025-03-02', 
                  type: 'Medication Error', 
                  severity: 'Medium',
                  status: 'Open',
                  participant: 'Jane Smith'
                },
                { 
                  id: 'INC-2025-042', 
                  date: '2025-03-01', 
                  type: 'Staff Absence', 
                  severity: 'Low',
                  status: 'Resolved',
                  participant: 'Robert Johnson'
                },
                { 
                  id: 'INC-2025-041', 
                  date: '2025-02-28', 
                  type: 'Service Delivery Issue', 
                  severity: 'High',
                  status: 'Open',
                  participant: 'Michael Williams'
                },
                { 
                  id: 'INC-2025-040', 
                  date: '2025-02-27', 
                  type: 'Client Complaint', 
                  severity: 'Medium',
                  status: 'Open',
                  participant: 'Sarah Davis'
                },
                { 
                  id: 'INC-2025-039', 
                  date: '2025-02-26', 
                  type: 'Documentation Error', 
                  severity: 'Low',
                  status: 'Resolved',
                  participant: 'Thomas Brown'
                }
              ].map(incident => (
                <div key={incident.id} className="border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        incident.status === 'Open' 
                          ? 'bg-amber-50 text-amber-600' 
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {incident.status === 'Open' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{incident.id}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            incident.severity === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : incident.severity === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{incident.type} - {incident.participant}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-gray-500">{incident.date}</p>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <p className="text-gray-600">Compliance documents and reports will be displayed here.</p>
            </div>
          )}
          
          {activeTab === 'audits' && (
            <div className="space-y-4">
              <p className="text-gray-600">Upcoming and past audits will be displayed here.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Resources */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Resources & Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="text-indigo-600" size={20} />
                <h3 className="font-medium">NDIS Practice Standards</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Reference for quality management and service delivery
              </p>
              <Button variant="link" className="text-indigo-600 p-0 h-auto">
                View Guidelines
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-amber-600" size={20} />
                <h3 className="font-medium">Incident Reporting Templates</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Standardized forms for documenting incidents
              </p>
              <Button variant="link" className="text-indigo-600 p-0 h-auto">
                Download Templates
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-green-600" size={20} />
                <h3 className="font-medium">Quality Toolkit</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Resources for implementing quality management
              </p>
              <Button variant="link" className="text-indigo-600 p-0 h-auto">
                Access Toolkit
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default QualityAssurance;