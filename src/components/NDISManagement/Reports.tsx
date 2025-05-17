import React, { useState, useEffect } from 'react';
import { 
  BarChart4, 
  FileText, 
  Download, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X, 
  Filter, 
  Printer, 
  Share2 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { motion } from 'framer-motion';

interface Report {
  id: string;
  title: string;
  type: 'progress' | 'review' | 'financial' | 'provider' | 'other';
  date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
}

export function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'progress' as 'progress' | 'review' | 'financial' | 'provider' | 'other',
    date: new Date().toISOString().split('T')[0],
    status: 'draft' as 'draft' | 'submitted' | 'approved' | 'rejected',
    notes: ''
  });

  useEffect(() => {
    const loadReports = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Mock reports for demonstration
        const mockReports: Report[] = [
          {
            id: '1',
            title: 'Quarterly Progress Report',
            type: 'progress',
            date: '2025-03-15',
            status: 'approved',
            notes: 'Regular quarterly progress report showing goal achievements and support utilization'
          },
          {
            id: '2',
            title: 'Annual Plan Review',
            type: 'review',
            date: '2025-02-20',
            status: 'submitted',
            notes: 'Comprehensive review of the past year and recommendations for the next plan'
          },
          {
            id: '3',
            title: 'Budget Utilization Report',
            type: 'financial',
            date: '2025-03-01',
            status: 'approved',
            notes: 'Detailed breakdown of funding usage across all categories'
          },
          {
            id: '4',
            title: 'Service Provider Evaluation',
            type: 'provider',
            date: '2025-01-10',
            status: 'approved',
            notes: 'Evaluation of current service providers and their performance'
          },
          {
            id: '5',
            title: 'Mid-Year Progress Update',
            type: 'progress',
            date: '2024-12-15',
            status: 'approved',
            notes: 'Mid-year update on goal progress and support effectiveness'
          },
          {
            id: '6',
            title: 'Support Coordination Report',
            type: 'other',
            date: '2025-04-05',
            status: 'draft',
            notes: 'Report being prepared by support coordinator'
          }
        ];
        
        setReports(mockReports);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    
    loadReports();
  }, [user]);

  const handleGenerateReport = () => {
    setFormData({
      title: '',
      type: 'progress',
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: ''
    });
    setShowGenerateModal(true);
  };

  const handleSaveReport = () => {
    // Validate form
    if (!formData.title || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Create new report
    const newReport: Report = {
      id: Date.now().toString(),
      title: formData.title,
      type: formData.type,
      date: formData.date,
      status: formData.status,
      notes: formData.notes
    };
    
    // Add to reports list
    setReports([newReport, ...reports]);
    
    // Close modal and reset form
    setShowGenerateModal(false);
    setError(null);
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'progress':
        return 'Progress Report';
      case 'review':
        return 'Plan Review';
      case 'financial':
        return 'Financial Report';
      case 'provider':
        return 'Provider Report';
      default:
        return 'Other Report';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <BarChart4 size={20} className="text-blue-600" />;
      case 'review':
        return <FileText size={20} className="text-purple-600" />;
      case 'financial':
        return <BarChart4 size={20} className="text-green-600" />;
      case 'provider':
        return <FileText size={20} className="text-amber-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock size={12} className="mr-1" />
            Draft
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={12} className="mr-1" />
            Submitted
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredReports = reports.filter(report => {
    // Filter by search query
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by type
    const matchesType = selectedType === 'all' || report.type === selectedType;
    
    // Filter by status
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Reviews</h1>
          <p className="text-gray-600 mt-1">Generate and manage NDIS reports and plan reviews</p>
        </div>
        <Button
          variant="primary"
          onClick={handleGenerateReport}
          icon={<FileText size={20} />}
        >
          Generate Report
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Upcoming Reviews Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Reviews</h2>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Annual Plan Review</h3>
                <p className="text-gray-600 mt-1">
                  Your NDIS plan is due for review on {formatDate('2025-12-31')}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="text-sm text-gray-700">Progress reports up to date</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="text-sm text-gray-700">Service provider feedback collected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-amber-600" size={16} />
                    <span className="text-sm text-gray-700">Goal achievement documentation in progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="text-gray-400" size={16} />
                    <span className="text-sm text-gray-700">Future goals and needs assessment pending</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Prepare for Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Reports List */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Reports</h2>
            <div className="flex items-center gap-2">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search reports..."
                className="w-48 md:w-64"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="progress">Progress</option>
                <option value="review">Review</option>
                <option value="financial">Financial</option>
                <option value="provider">Provider</option>
                <option value="other">Other</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        {getReportTypeIcon(report.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getReportTypeLabel(report.type)} • {formatDate(report.date)}
                        </p>
                        {report.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            {report.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download size={16} />}
                      >
                        Download
                      </Button>
                      <div className="relative group">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Share2 size={16} />}
                        >
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'No reports match your filters'
                  : 'Get started by generating a new report'}
              </p>
              {!searchQuery && selectedType === 'all' && selectedStatus === 'all' && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={handleGenerateReport}
                    icon={<FileText size={20} />}
                  >
                    Generate Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Report Templates */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-blue-600" size={20} />
                <h3 className="font-medium text-gray-900">Progress Report</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Standard template for tracking progress against goals.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    title: 'Progress Report',
                    type: 'progress'
                  });
                  setShowGenerateModal(true);
                }}
              >
                Use Template
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-purple-600" size={20} />
                <h3 className="font-medium text-gray-900">Plan Review</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive template for annual plan reviews.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    title: 'Plan Review Report',
                    type: 'review'
                  });
                  setShowGenerateModal(true);
                }}
              >
                Use Template
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-green-600" size={20} />
                <h3 className="font-medium text-gray-900">Financial Summary</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Detailed financial breakdown of plan utilization.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setFormData({
                    ...formData,
                    title: 'Financial Summary Report',
                    type: 'financial'
                  });
                  setShowGenerateModal(true);
                }}
              >
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Generate Report Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Report"
        maxWidth="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Title*
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter report title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type*
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="progress">Progress Report</option>
                <option value="review">Plan Review</option>
                <option value="financial">Financial Report</option>
                <option value="provider">Provider Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date*
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this report"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveReport}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}