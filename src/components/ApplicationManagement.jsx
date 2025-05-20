import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, XCircle, Clock, 
  AlertCircle, Calendar, DollarSign, Stethoscope,
  Building, MessageSquare, Eye, Filter, Search,
  Download, Paperclip, ArrowRight, TrendingUp,
  Users, BarChart2, PieChart, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from 'recharts';

// Mock data for applications
const mockApplications = {
  medicalLeave: [
    {
      id: 'ML001',
      studentName: 'John Doe',
      studentId: 'STU2024001',
      reason: 'Medical treatment for flu',
      startDate: '2024-03-15',
      endDate: '2024-03-20',
      status: 'pending',
      documents: ['medical_certificate.pdf'],
      submittedAt: '2024-03-14T10:30:00',
      details: 'Requires 5 days of leave for medical treatment and recovery',
      urgency: 'high'
    },
    {
      id: 'ML002',
      studentName: 'Emma Wilson',
      studentId: 'STU2024005',
      reason: 'Surgery recovery',
      startDate: '2024-03-25',
      endDate: '2024-04-10',
      status: 'pending',
      documents: ['hospital_discharge.pdf', 'doctor_recommendation.pdf'],
      submittedAt: '2024-03-18T09:15:00',
      details: 'Post-surgery recovery requiring extended absence',
      urgency: 'medium'
    },
  ],
  sponsorship: [
    {
      id: 'SP001',
      studentName: 'Jane Smith',
      studentId: 'STU2024002',
      eventName: 'International Conference on AI',
      amount: 2500,
      purpose: 'Conference participation and presentation',
      status: 'pending',
      documents: ['conference_details.pdf', 'budget_breakdown.pdf'],
      submittedAt: '2024-03-13T14:20:00',
      details: 'Requesting sponsorship for attending and presenting research paper',
      urgency: 'medium'
    },
    {
      id: 'SP002',
      studentName: 'Michael Chang',
      studentId: 'STU2024006',
      eventName: 'Global Business Summit',
      amount: 1800,
      purpose: 'Representing university at business competition',
      status: 'pending',
      documents: ['invitation_letter.pdf', 'expense_estimate.pdf'],
      submittedAt: '2024-03-17T11:40:00',
      details: 'Seeking funds for travel and accommodation',
      urgency: 'high'
    },
  ],
  eventPermission: [
    {
      id: 'EP001',
      organizerName: 'Computer Science Club',
      eventName: 'Tech Symposium 2024',
      date: '2024-04-15',
      venue: 'Main Auditorium',
      expectedAttendees: 200,
      status: 'pending',
      documents: ['event_proposal.pdf', 'venue_requirements.pdf'],
      submittedAt: '2024-03-12T09:15:00',
      details: 'Annual technical symposium with workshops and guest lectures',
      urgency: 'medium'
    },
    {
      id: 'EP002',
      organizerName: 'Student Council',
      eventName: 'Annual Cultural Festival',
      date: '2024-05-10',
      venue: 'Campus Grounds',
      expectedAttendees: 500,
      status: 'pending',
      documents: ['event_plan.pdf', 'safety_measures.pdf', 'budget_proposal.pdf'],
      submittedAt: '2024-03-16T13:20:00',
      details: 'Three-day cultural event featuring performances, food stalls, and competitions',
      urgency: 'low'
    },
  ]
};

const ApplicationManagement = () => {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('medicalLeave');
  const [reviewMode, setReviewMode] = useState('view'); // 'view', 'review', 'history'
  
  // New state for statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageProcessingTime: '2.5 days',
    urgentApplications: 0
  });

  // Calculate statistics whenever applications change
  useEffect(() => {
    const calculateStats = () => {
      let total = 0;
      let pending = 0;
      let approved = 0;
      let rejected = 0;
      let urgent = 0;

      Object.values(applications).forEach(appType => {
        appType.forEach(app => {
          total++;
          if (app.status === 'pending') pending++;
          if (app.status === 'approved') approved++;
          if (app.status === 'rejected') rejected++;
          if (app.urgency === 'high') urgent++;
        });
      });

      setStats({
        total,
        pending,
        approved,
        rejected,
        averageProcessingTime: '2.5 days',
        urgentApplications: urgent
      });
    };

    calculateStats();
  }, [applications]);

  // Data for charts
  const getChartData = () => {
    const statusData = [
      { name: 'Pending', value: stats.pending, color: '#F59E0B' },
      { name: 'Approved', value: stats.approved, color: '#10B981' },
      { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
    ];

    const typeData = [
      { name: 'Medical Leave', value: applications.medicalLeave.length, color: '#3B82F6' },
      { name: 'Sponsorship', value: applications.sponsorship.length, color: '#10B981' },
      { name: 'Event Permission', value: applications.eventPermission.length, color: '#8B5CF6' }
    ];

    const trendData = [
      { month: 'Jan', applications: 12, approvals: 8 },
      { month: 'Feb', applications: 15, approvals: 12 },
      { month: 'Mar', applications: 18, approvals: 15 },
      { month: 'Apr', applications: 14, approvals: 11 },
      { month: 'May', applications: 16, approvals: 13 }
    ];

    return { statusData, typeData, trendData };
  };

  const { statusData, typeData, trendData } = getChartData();

  const handleStatusChange = (type, applicationId, newStatus) => {
    setApplications(prev => ({
      ...prev,
      [type]: prev[type].map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, reviewedAt: new Date().toISOString(), reviewComment }
          : app
      )
    }));
    setSelectedApplication(null);
    setReviewComment('');
    setReviewMode('view');
  };

  const filteredApplications = applications[currentTab].filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      (currentTab === 'medicalLeave' && app.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (currentTab === 'sponsorship' && (app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || app.eventName.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (currentTab === 'eventPermission' && (app.organizerName.toLowerCase().includes(searchTerm.toLowerCase()) || app.eventName.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      approved: { variant: 'bg-green-100 text-green-800', icon: CheckCircle2, text: 'Approved' },
      rejected: { variant: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${config.variant}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </div>
    );
  };
  
  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      high: { variant: 'bg-red-50 text-red-700 border-red-300', text: 'High' },
      medium: { variant: 'bg-orange-50 text-orange-700 border-orange-300', text: 'Medium' },
      low: { variant: 'bg-blue-50 text-blue-700 border-blue-300', text: 'Low' }
    };
    
    const config = urgencyConfig[urgency] || urgencyConfig.medium;
    
    return (
      <div className={`text-xs border px-2 py-0.5 rounded ${config.variant}`}>
        {config.text}
      </div>
    );
  };

  const ApplicationCard = ({ application, type }) => {
    const getTypeIcon = () => {
      switch (type) {
        case 'medicalLeave':
          return <Stethoscope className="h-5 w-5 text-blue-600" />;
        case 'sponsorship':
          return <DollarSign className="h-5 w-5 text-green-600" />;
        case 'eventPermission':
          return <Building className="h-5 w-5 text-purple-600" />;
        default:
          return <FileText className="h-5 w-5 text-gray-600" />;
      }
    };

    const formattedDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    return (
      <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                {getTypeIcon()}
              </div>
              <div>
                <h3 className="font-semibold">
                  {type === 'medicalLeave' ? application.studentName :
                   type === 'sponsorship' ? application.studentName :
                   application.organizerName}
                </h3>
                <p className="text-sm text-gray-600">
                  {type === 'medicalLeave' ? `Medical Leave (${application.studentId})` :
                   type === 'sponsorship' ? `Sponsorship (${application.studentId})` :
                   'Event Permission'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(application.status)}
              {getUrgencyBadge(application.urgency)}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {type === 'medicalLeave' && (
              <>
                <p className="font-medium text-gray-900">{application.reason}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate(application.startDate)} - {formattedDate(application.endDate)}</span>
                </div>
              </>
            )}
            {type === 'sponsorship' && (
              <>
                <p className="font-medium text-gray-900">{application.eventName}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">${application.amount.toLocaleString()}</span> - {application.purpose}
                </div>
              </>
            )}
            {type === 'eventPermission' && (
              <>
                <p className="font-medium text-gray-900">{application.eventName}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate(application.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{application.venue} - {application.expectedAttendees} attendees</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="h-3 w-3" />
              Submitted {new Date(application.submittedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-1 mt-3">
            {application.documents.map((doc, index) => (
              <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {doc.split('_')[0]}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${
                application.status === 'pending' 
                  ? 'text-white bg-blue-600 hover:bg-blue-700' 
                  : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => {
                setSelectedApplication({ ...application, type });
                setReviewMode(application.status === 'pending' ? 'review' : 'view');
              }}
            >
              <Eye className="h-4 w-4" />
              {application.status === 'pending' ? 'Review' : 'View'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ApplicationReviewModal = ({ application, onClose }) => {
    if (!application) return null;

    const formattedDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const getModalHeader = () => {
      switch (reviewMode) {
        case 'review':
          return 'Review Application';
        case 'view':
          return 'Application Details';
        case 'history':
          return 'Review History';
        default:
          return 'Application';
      }
    };

    const renderReviewActions = () => {
      if (application.status !== 'pending' || reviewMode !== 'review') return null;

      return (
        <div className="space-y-4 mt-6 border-t pt-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Review Comments</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows="4"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Enter your detailed review comments here..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200"
              onClick={() => handleStatusChange(application.type, application.id, 'rejected')}
            >
              <XCircle className="h-4 w-4" />
              Reject Application
            </button>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleStatusChange(application.type, application.id, 'approved')}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Application
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {application.type === 'medicalLeave' ? <Stethoscope className="h-5 w-5 text-blue-600" /> :
               application.type === 'sponsorship' ? <DollarSign className="h-5 w-5 text-green-600" /> :
               <Building className="h-5 w-5 text-purple-600" />}
              {getModalHeader()}
            </h2>
            <div className="flex items-center gap-3">
              {getStatusBadge(application.status)}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex border-b">
            <button 
              className={`px-4 py-3 font-medium text-sm flex-1 text-center ${reviewMode === 'view' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setReviewMode('view')}
            >
              Application Details
            </button>
            {application.status === 'pending' && (
              <button 
                className={`px-4 py-3 font-medium text-sm flex-1 text-center ${reviewMode === 'review' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setReviewMode('review')}
              >
                Review & Decision
              </button>
            )}
            {application.status !== 'pending' && (
              <button 
                className={`px-4 py-3 font-medium text-sm flex-1 text-center ${reviewMode === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setReviewMode('history')}
              >
                Review History
              </button>
            )}
          </div>
          
          <div className="p-6">
            {reviewMode === 'view' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
                      <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
                        {application.type === 'medicalLeave' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Student</span>
                              <span className="text-sm">{application.studentName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Student ID</span>
                              <span className="text-sm">{application.studentId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Reason</span>
                              <span className="text-sm">{application.reason}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Duration</span>
                              <span className="text-sm">{formattedDate(application.startDate)} to {formattedDate(application.endDate)}</span>
                            </div>
                          </>
                        )}
                        {application.type === 'sponsorship' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Student</span>
                              <span className="text-sm">{application.studentName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Student ID</span>
                              <span className="text-sm">{application.studentId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Event</span>
                              <span className="text-sm">{application.eventName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Amount</span>
                              <span className="text-sm font-semibold">${application.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Purpose</span>
                              <span className="text-sm">{application.purpose}</span>
                            </div>
                          </>
                        )}
                        {application.type === 'eventPermission' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Organizer</span>
                              <span className="text-sm">{application.organizerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Event</span>
                              <span className="text-sm">{application.eventName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Date</span>
                              <span className="text-sm">{formattedDate(application.date)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Venue</span>
                              <span className="text-sm">{application.venue}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Expected Attendees</span>
                              <span className="text-sm">{application.expectedAttendees}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Meta Information</h3>
                      <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Application ID</span>
                          <span className="text-sm font-mono">{application.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Submission Date</span>
                          <span className="text-sm">{formattedDate(application.submittedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Urgency</span>
                          <span className="text-sm">{application.urgency.charAt(0).toUpperCase() + application.urgency.slice(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Status</span>
                          <span className="text-sm">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Details</h3>
                      <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{application.details}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Supporting Documents</h3>
                      <div className="mt-2 space-y-2">
                        {application.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{doc}</span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {application.status === 'pending' && (
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
                      onClick={() => setReviewMode('review')}
                    >
                      Proceed to Review
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {reviewMode === 'review' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Application Summary</h3>
                  <div className="mt-2 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {application.type === 'medicalLeave' 
                        ? `${application.studentName} is requesting a medical leave from ${formattedDate(application.startDate)} to ${formattedDate(application.endDate)} due to ${application.reason}.` 
                        : application.type === 'sponsorship'
                        ? `${application.studentName} is requesting ${application.amount.toLocaleString()} for ${application.eventName}. Purpose: ${application.purpose}.`
                        : `${application.organizerName} is requesting permission for ${application.eventName} at ${application.venue} on ${formattedDate(application.date)} with ${application.expectedAttendees} expected attendees.`
                      }
                    </p>
                  </div>
                </div>
                
                {renderReviewActions()}
              </div>
            )}
            
            {reviewMode === 'history' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {application.status === 'approved' 
                      ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                      : <XCircle className="h-5 w-5 text-red-600" />
                    }
                    <h3 className="font-medium">
                      Application {application.status === 'approved' ? 'Approved' : 'Rejected'}
                    </h3>
                  </div>
                  <p className="text-sm mb-2">Review comment:</p>
                  <p className="text-sm bg-white p-3 rounded border">
                    {application.reviewComment || "No comments provided."}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Reviewed on {formattedDate(application.reviewedAt || new Date())}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-blue-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>12% increase from last month</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Applications</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-yellow-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{stats.urgentApplications} require immediate attention</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Approval Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-green-600">
          <Activity className="h-4 w-4 mr-1" />
          <span>Avg. processing time: {stats.averageProcessingTime}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Reviewers</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full">
            <Users className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm text-purple-600">
          <BarChart2 className="h-4 w-4 mr-1" />
          <span>Processing 15 applications/hour</span>
        </div>
      </div>
    </div>
  );

  // Charts Component
  const AnalyticsCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-500" />
          Application Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="applications" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.2} 
              />
              <Area 
                type="monotone" 
                dataKey="approvals" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-500" />
          Application Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {typeData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
          <p className="mt-1 text-gray-600">Review and process student applications and requests</p>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Analytics Charts */}
        <AnalyticsCharts />
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex space-x-1">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${currentTab === 'medicalLeave' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    setCurrentTab('medicalLeave');
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>Medical Leave</span>
                  </div>
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${currentTab === 'sponsorship' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    setCurrentTab('sponsorship');
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Sponsorship</span>
                  </div>
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${currentTab === 'eventPermission' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    setCurrentTab('eventPermission');
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Event Permission</span>
                  </div>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "No applications match your search criteria."
                    : filterStatus !== 'all'
                    ? `No ${filterStatus} applications available.`
                    : "No applications available at the moment."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map(app => (
                  <ApplicationCard key={app.id} application={app} type={currentTab} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedApplication && (
        <ApplicationReviewModal
          application={selectedApplication}
          onClose={() => {
            setSelectedApplication(null);
            setReviewComment('');
            setReviewMode('view');
          }}
        />
      )}
    </div>
  );
};

export default ApplicationManagement;