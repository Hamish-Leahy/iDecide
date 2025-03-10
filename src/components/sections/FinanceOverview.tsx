import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Shield, 
  PiggyBank, 
  Receipt, 
  FileText,
  ChevronRight,
  AlertTriangle,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { useFinancialDocumentsStore } from '../../store/financialDocumentsStore';
import { format } from 'date-fns';

const FinanceOverview = () => {
  const { documents, fetchDocuments } = useFinancialDocumentsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const assetSummaries = [
    {
      type: 'Total Assets',
      value: '$2,547,892',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      type: 'Investments',
      value: '$1,250,000',
      change: '+8.3%',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      type: 'Real Estate',
      value: '$850,000',
      change: '+15.2%',
      isPositive: true,
      icon: Building2,
      color: 'bg-purple-500'
    },
    {
      type: 'Insurance',
      value: '$250,000',
      change: '0%',
      isPositive: true,
      icon: Shield,
      color: 'bg-indigo-500'
    }
  ];

  const documentAlerts = [
    {
      type: 'warning',
      message: 'Insurance policy renewal due',
      dueDate: '2024-03-15'
    },
    {
      type: 'info',
      message: 'Review investment portfolio allocation',
      dueDate: '2024-03-20'
    },
    {
      type: 'warning',
      message: 'Update beneficiary information',
      dueDate: '2024-03-25'
    }
  ];

  const recentDocuments = documents.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#2D5959]">Financial Overview</h2>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90">
            <Upload className="w-4 h-4" />
            Import Data
          </button>
        </div>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assetSummaries.map((asset, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${asset.color} rounded-lg`}>
                <asset.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                asset.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {asset.change}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{asset.type}</h3>
            <p className="text-2xl font-bold mt-1">{asset.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Pending Actions
          </h3>
          <div className="space-y-4">
            {documentAlerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50' :
                  alert.type === 'info' ? 'bg-blue-50' : 'bg-green-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-5 h-5 ${
                    alert.type === 'warning' ? 'text-yellow-500' :
                    alert.type === 'info' ? 'text-blue-500' : 'text-green-500'
                  }`} />
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    {alert.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {format(new Date(alert.dueDate), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <button className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  Take Action
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Document Completion</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2D5959] rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Asset Allocation</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2D5959] rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Beneficiary Coverage</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2D5959] rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Recent Documents</h3>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959]"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90">
              <Plus className="w-4 h-4" />
              Add Document
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {recentDocuments.map((doc, index) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#B5D3D3] rounded-lg">
                  <FileText className="w-5 h-5 text-[#2D5959]" />
                </div>
                <div>
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doc.status === 'active' ? 'bg-green-100 text-green-800' :
                  doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceOverview;