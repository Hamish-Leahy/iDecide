import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Heart, UserCheck, Guitar as Hospital, Stethoscope, Pill, Brain, FileText, Clock, AlertTriangle, Upload, Download, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import TabNavigation from '../TabNavigation';
import FileUpload from '../FileUpload/FileUpload';
import PDFPreview from '../PDFPreview/PDFPreview';

interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  bgColor: string;
}

const MetricCard = ({ icon: Icon, title, value, trend, bgColor }: MetricCardProps) => (
  <div className={`${bgColor} rounded-xl p-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.02]`}>
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          trend.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {trend.value}
        </span>
      )}
    </div>
    <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

interface DocumentCardProps {
  title: string;
  type: string;
  documentType: string;
  lastUpdated: string;
  status: 'active' | 'needs_review' | 'expired';
  notes?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DocumentCard = ({
  title,
  type,
  documentType,
  lastUpdated,
  status,
  notes,
  onView,
  onEdit,
  onDelete
}: DocumentCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{type}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-800' :
        status === 'needs_review' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
    
    <div className="space-y-3 mb-4">
      <div>
        <p className="text-sm text-gray-500">Document Type</p>
        <p className="text-base">{documentType}</p>
      </div>
      {notes && (
        <div>
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-sm">{notes}</p>
        </div>
      )}
      <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
    </div>

    <div className="flex gap-2">
      <button
        onClick={onView}
        className="flex items-center gap-1 px-3 py-1 text-sm bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
      >
        <Eye className="w-4 h-4" /> View
      </button>
      <button
        onClick={onEdit}
        className="flex items-center gap-1 px-3 py-1 text-sm border border-[#2D5959] text-[#2D5959] rounded-lg hover:bg-[#2D5959] hover:text-white"
      >
        <Edit className="w-4 h-4" /> Edit
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-1 px-3 py-1 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </div>
  </div>
);

const DocumentSection: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, description, icon: Icon, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-[#B5D3D3] rounded-lg">
        <Icon className="w-6 h-6 text-[#2D5959]" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#2D5959]">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Overview = () => (
  <div className="space-y-8">
    <h2 className="text-3xl font-bold text-[#2D5959] mb-8">Healthcare Overview</h2>
    
    {/* Top Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        icon={Heart}
        title="Active Directives"
        value="4"
        trend={{ value: "All current", isPositive: true }}
        bgColor="bg-[#2D5959]"
      />
      <MetricCard
        icon={Clock}
        title="Last Review"
        value="2 months ago"
        bgColor="bg-[#85B1B1]"
      />
      <MetricCard
        icon={UserCheck}
        title="Healthcare Agents"
        value="2"
        bgColor="bg-[#2D5959]"
      />
    </div>

    {/* Emergency Contacts Box */}
    <div className="bg-gradient-to-br from-[#2D5959] to-[#85B1B1] rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Hospital className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Emergency Contacts</h3>
        </div>
        <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Primary Care */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white bg-opacity-10 rounded-lg">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-80">Primary Care Physician</p>
              <p className="font-semibold">Dr. Emily Chen</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <span className="opacity-80">Phone:</span>
              <span className="font-medium">(555) 123-4567</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="opacity-80">Hospital:</span>
              <span className="font-medium">City General</span>
            </p>
          </div>
        </div>

        {/* Healthcare Agent */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white bg-opacity-10 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-80">Healthcare Agent</p>
              <p className="font-semibold">Sarah Johnson</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <span className="opacity-80">Phone:</span>
              <span className="font-medium">(555) 987-6543</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="opacity-80">Relationship:</span>
              <span className="font-medium">Sister</span>
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white bg-opacity-10 rounded-lg">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-80">Emergency Contact</p>
              <p className="font-semibold">John Doe</p>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <span className="opacity-80">Phone:</span>
              <span className="font-medium">(555) 789-0123</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="opacity-80">Relationship:</span>
              <span className="font-medium">Spouse</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Row - Redesigned Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Action Items */}
      <div className="bg-gradient-to-br from-[#B5D3D3] to-white rounded-xl p-6 shadow-lg transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#2D5959] bg-opacity-10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-[#2D5959]" />
          </div>
          <h3 className="text-lg font-bold text-[#2D5959]">Action Items</h3>
        </div>
        <ul className="space-y-3">
          {[
            'Review advance directive',
            'Update emergency contacts',
            'Schedule annual review'
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-[#2D5959] flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-[#2D5959] rounded-full"></div>
              </div>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Updates */}
      <div className="bg-gradient-to-br from-[#B5D3D3] to-white rounded-xl p-6 shadow-lg transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#2D5959] bg-opacity-10 rounded-lg">
            <FileText className="w-6 h-6 text-[#2D5959]" />
          </div>
          <h3 className="text-lg font-bold text-[#2D5959]">Recent Updates</h3>
        </div>
        <div className="space-y-4">
          {[
            { text: 'Updated POLST form', date: '1 week ago' },
            { text: 'Modified healthcare proxy', date: '1 month ago' },
            { text: 'Added new medication list', date: '2 months ago' }
          ].map((update, index) => (
            <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0">
              <span className="text-gray-700">{update.text}</span>
              <span className="text-sm text-gray-500">{update.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-gradient-to-br from-[#B5D3D3] to-white rounded-xl p-6 shadow-lg transform transition-transform hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#2D5959] bg-opacity-10 rounded-lg">
            <FileText className="w-6 h-6 text-[#2D5959]" />
          </div>
          <h3 className="text-lg font-bold text-[#2D5959]">Quick Access</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Heart, label: 'Living Will' },
            { icon: UserCheck, label: 'Healthcare Proxy' },
            { icon: FileText, label: 'POLST Form' },
            { icon: Pill, label: 'Medications' }
          ].map((item, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <item.icon className="w-6 h-6 text-[#2D5959]" />
              <span className="text-sm text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AdvanceDirective = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Advance Directive</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      <DocumentSection
        title="Living Will"
        description="Your preferences for medical treatment and end-of-life care"
        icon={FileText}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentCard
            title="Living Will"
            type="Advance Directive"
            documentType="Legal Document"
            lastUpdated="2024-01-15"
            status="active"
            notes="Comprehensive end-of-life care preferences"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          <DocumentCard
            title="POLST Form"
            type="Medical Orders"
            documentType="Physician Orders"
            lastUpdated="2023-12-20"
            status="needs_review"
            notes="Review needed for medication updates"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </DocumentSection>

      {showUpload && (
        <div className="mt-8">
          <FileUpload
            onUpload={(files) => {
              setSelectedFile(files[0]);
              setShowUpload(false);
            }}
            maxFiles={1}
            acceptedFileTypes={['application/pdf']}
          />
        </div>
      )}

      {selectedFile && (
        <div className="mt-8">
          <PDFPreview
            file={selectedFile}
            onFileChange={setSelectedFile}
            onError={(error) => console.error(error)}
          />
        </div>
      )}
    </div>
  );
};

const HealthcareProxy = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Healthcare Proxy</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      <DocumentSection
        title="Healthcare Agents"
        description="Your designated healthcare decision makers"
        icon={UserCheck}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentCard
            title="Healthcare Power of Attorney"
            type="Legal Document"
            documentType="Proxy Designation"
            lastUpdated="2024-02-01"
            status="active"
            notes="Primary and alternate agents designated"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          <DocumentCard
            title="Agent Instructions"
            type="Supporting Document"
            documentType="Guidance Document"
            lastUpdated="2024-01-10"
            status="active"
            notes="Detailed instructions for healthcare agents"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </DocumentSection>

      {showUpload && (
        <div className="mt-8">
          <FileUpload
            onUpload={(files) => {
              setSelectedFile(files[0]);
              setShowUpload(false);
            }}
            maxFiles={1}
            acceptedFileTypes={['application/pdf']}
          />
        </div>
      )}

      {selectedFile && (
        <div className="mt-8">
          <PDFPreview
            file={selectedFile}
            onFileChange={setSelectedFile}
            onError={(error) => console.error(error)}
          />
        </div>
      )}
    </div>
  );
};

const MedicalHistory = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Medical History</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      <DocumentSection
        title="Medical Records"
        description="Your comprehensive medical history and records"
        icon={Stethoscope}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentCard
            title="Medical Summary"
            type="Medical Record"
            documentType="Health History"
            lastUpdated="2024-02-15"
            status="active"
            notes="Complete medical history and conditions"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          <DocumentCard
            title="Vaccination Record"
            type="Medical Record"
            documentType="Immunization History"
            lastUpdated="2024-01-20"
            status="active"
            notes="Current vaccination status and history"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </DocumentSection>

      {showUpload && (
        <div className="mt-8">
          <FileUpload
            onUpload={(files) => {
              setSelectedFile(files[0]);
              setShowUpload(false);
            }}
            maxFiles={1}
            acceptedFileTypes={['application/pdf']}
          />
        </div>
      )}

      {selectedFile && (
        <div className="mt-8">
          <PDFPreview
            file={selectedFile}
            onFileChange={setSelectedFile}
            onError={(error) => console.error(error)}
          />
        </div>
      )}
    </div>
  );
};

const Medications = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Medications</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      <DocumentSection
        title="Medication Records"
        description="Current medications, allergies, and preferences"
        icon={Pill}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentCard
            title="Current Medications"
            type="Medical Record"
            documentType="Medication List"
            lastUpdated="2024-02-10"
            status="active"
            notes="Complete list with dosages and schedules"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          <DocumentCard
            title="Allergies & Reactions"
            type="Medical Record"
            documentType="Allergy List"
            lastUpdated="2024-01-15"
            status="needs_review"
            notes="Update needed for new medication reactions"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </DocumentSection>

      {showUpload && (
        <div className="mt-8">
          <FileUpload
            onUpload={(files) => {
              setSelectedFile(files[0]);
              setShowUpload(false);
            }}
            maxFiles={1}
            acceptedFileTypes={['application/pdf']}
          />
        </div>
      )}

      {selectedFile && (
        <div className="mt-8">
          <PDFPreview
            file={selectedFile}
            onFileChange={setSelectedFile}
            onError={(error) => console.error(error)}
          />
        </div>
      )}
    </div>
  );
};

const MentalHealth = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Mental Health</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg"
        >
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      <DocumentSection
        title="Mental Health Records"
        description="Mental health directives and preferences"
        icon={Brain}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentCard
            title="Mental Health Directive"
            type="Legal Document"
            documentType="Treatment Preferences"
            lastUpdated="2024-02-05"
            status="active"
            notes="Preferences for mental health treatment"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
          <DocumentCard
            title="Treatment History"
            type="Medical Record"
            documentType="Mental Health History"
            lastUpdated="2024-01-10"
            status="active"
            notes="Complete mental health treatment history"
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </DocumentSection>

      {showUpload && (
        <div className="mt-8">
          <FileUpload
            onUpload={(files) => {
              setSelectedFile(files[0]);
              setShowUpload(false);
            }}
            maxFiles={1}
            acceptedFileTypes={['application/pdf']}
          />
        </div>
      )}

      {selectedFile && (
        <div className="mt-8">
          <PDFPreview
            file={selectedFile}
            onFileChange={setSelectedFile}
            onError={(error) => console.error(error)}
          />
        </div>
      )}
    </div>
  );
};

const HealthcareSections = () => {
  const tabs = [
    { id: 'overview', label: 'Overview', path: '/healthcare' },
    { id: 'advance-directive', label: 'Advance Directive', path: '/healthcare/advance-directive' },
    { id: 'healthcare-proxy', label: 'Healthcare Proxy', path: '/healthcare/healthcare-proxy' },
    { id: 'medical-history', label: 'Medical History', path: '/healthcare/medical-history' },
    { id: 'medications', label: 'Medications', path: '/healthcare/medications' },
    { id: 'mental-health', label: 'Mental Health', path: '/healthcare/mental-health' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#2D5959] mb-4">Healthcare Wishes</h1>
        <p className="text-gray-600">Manage your healthcare directives and medical information</p>
      </div>

      <TabNavigation tabs={tabs} />

      <div className="mt-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="advance-directive" element={<AdvanceDirective />} />
          <Route path="healthcare-proxy" element={<HealthcareProxy />} />
          <Route path="medical-history" element={<MedicalHistory />} />
          <Route path="medications" element={<Medications />} />
          <Route path="mental-health" element={<MentalHealth />} />
        </Routes>
      </div>
    </div>
  );
};

export default HealthcareSections;