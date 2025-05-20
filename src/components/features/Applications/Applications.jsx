import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { 
  FileText, Clock, CheckCircle, X, AlertCircle, Search, 
  Filter, Plus, Download, Upload, Calendar, ChevronDown, 
  Eye, Edit, Trash2, Info, Bell, RefreshCw, MoreVertical, Paperclip,
  DollarSign, Award, XCircle, AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/alert-dialog';
import { toast } from '../../ui/use-toast';
import { Skeleton } from '../../ui/skeleton';
import ApplicationForm from './ApplicationForm';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for applications
const mockApplications = {
  pending: [
    {
      id: 1,
      type: 'Leave Application',
      submittedDate: '2024-03-10',
      status: 'Pending',
      subject: 'Medical Leave Request',
      description: 'Request for medical leave due to health issues',
      documents: ['medical_certificate.pdf'],
      urgency: 'High'
    },
    {
      id: 2,
      type: 'Course Change',
      submittedDate: '2024-03-08',
      status: 'Under Review',
      subject: 'Request to Change Elective Course',
      description: 'Request to switch from Advanced Mathematics to Data Science',
      documents: ['course_form.pdf'],
      urgency: 'Medium'
    }
  ],
  approved: [
    {
      id: 3,
      type: 'Scholarship',
      submittedDate: '2024-02-15',
      approvedDate: '2024-02-20',
      status: 'Approved',
      subject: 'Merit Scholarship Application',
      description: 'Application for academic merit scholarship',
      documents: ['transcript.pdf', 'recommendation.pdf'],
      urgency: 'Medium'
    }
  ],
  rejected: [
    {
      id: 4,
      type: 'Event Permission',
      submittedDate: '2024-02-01',
      rejectedDate: '2024-02-03',
      status: 'Rejected',
      subject: 'Tech Fest Event Permission',
      description: 'Permission to organize technical workshop',
      documents: ['event_proposal.pdf'],
      reason: 'Venue not available for the requested dates',
      urgency: 'Low'
    }
  ]
};

const applicationTypes = [
  {
    id: 'leave',
    name: 'Leave Application',
    description: 'Apply for medical, personal, or academic leave',
    icon: Calendar,
    fields: ['Start Date', 'End Date', 'Reason', 'Supporting Documents'],
    color: 'bg-blue-50'
  },
  {
    id: 'course',
    name: 'Course Change',
    description: 'Request to change courses or sections',
    icon: Edit,
    fields: ['Current Course', 'Requested Course', 'Reason', 'Academic Advisor'],
    color: 'bg-purple-50'
  },
  {
    id: 'scholarship',
    name: 'Scholarship',
    description: 'Apply for various scholarship programs',
    icon: FileText,
    fields: ['Scholarship Type', 'Academic Records', 'Financial Information'],
    color: 'bg-amber-50'
  },
  {
    id: 'event',
    name: 'Event Permission',
    description: 'Request permission for organizing events',
    icon: Calendar,
    fields: ['Event Type', 'Date', 'Venue', 'Expected Participants'],
    color: 'bg-green-50'
  }
];

// Status Badge Component
const StatusBadge = ({ status }) => {
  let colorClass = '';
  let Icon = Info;

  switch (status.toLowerCase()) {
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      Icon = Clock;
      break;
    case 'under review':
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      Icon = Eye;
      break;
    case 'approved':
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      Icon = CheckCircle;
      break;
    case 'rejected':
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      Icon = X;
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <Badge className={`${colorClass} flex items-center gap-1 py-1 px-2 border`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{status}</span>
    </Badge>
  );
};

// Urgency Badge Component
const UrgencyBadge = ({ level }) => {
  let colorClass = '';
  
  switch (level.toLowerCase()) {
    case 'high':
      colorClass = 'text-red-600 border-red-200 bg-red-50';
      break;
    case 'medium':
      colorClass = 'text-amber-600 border-amber-200 bg-amber-50';
      break;
    case 'low':
      colorClass = 'text-green-600 border-green-200 bg-green-50';
      break;
    default:
      colorClass = 'text-gray-600 border-gray-200 bg-gray-50';
  }

  return (
    <Badge variant="outline" className={`${colorClass} py-1`}>
      {level} Priority
    </Badge>
  );
};

// Document Preview Component
const DocumentPreview = ({ document }) => {
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return "bg-red-100 text-red-700";
    if (['doc', 'docx'].includes(ext)) return "bg-blue-100 text-blue-700";
    if (['xls', 'xlsx', 'csv'].includes(ext)) return "bg-green-100 text-green-700";
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  const iconClass = getFileIcon(document);

  return (
    <div className="flex items-center space-x-2 py-1 px-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group">
      <div className={`p-1.5 rounded ${iconClass}`}>
        <FileText className="h-4 w-4" />
      </div>
      <span className="text-sm truncate">{document}</span>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Application Detail Dialog
const ApplicationDetail = ({ application, isOpen, onClose }) => {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{application.subject}</DialogTitle>
            <StatusBadge status={application.status} />
          </div>
          <DialogDescription>{application.type}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
            <p className="text-gray-800">{application.description}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Submitted Date</h4>
              <p className="text-gray-800 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                {application.submittedDate}
              </p>
            </div>
            
            {application.approvedDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Approved Date</h4>
                <p className="text-gray-800 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {application.approvedDate}
                </p>
              </div>
            )}
            
            {application.rejectedDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Rejected Date</h4>
                <p className="text-gray-800 flex items-center gap-1">
                  <X className="h-4 w-4 text-red-500" />
                  {application.rejectedDate}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
              <UrgencyBadge level={application.urgency} />
            </div>
          </div>
          
          {application.reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Rejection Reason
              </h4>
              <p className="text-red-700 text-sm">{application.reason}</p>
            </div>
          )}
          
          {application.documents && application.documents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
              <div className="space-y-2">
                {application.documents.map((doc, index) => (
                  <DocumentPreview key={index} document={doc} />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Download All Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Application Card Component with animations
const ApplicationCard = ({ application, onViewDetail }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-lg transform translate-y-[-4px]' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold group cursor-pointer" onClick={() => onViewDetail(application)}>
              <span className="text-gray-900 group-hover:text-blue-600 transition-colors">
                {application.subject}
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">{application.type}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <p className="mt-4 text-gray-700 line-clamp-2">{application.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Submitted: {application.submittedDate}</span>
          </div>
          {application.documents.length > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{application.documents.length} document(s)</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <UrgencyBadge level={application.urgency} />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => onViewDetail(application)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {application.status === 'Pending' && (
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-amber-50 hover:text-amber-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Documents
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {application.status === 'Pending' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Application
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center text-red-600 cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Application
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Application Type Selector Component
const ApplicationTypeSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {applicationTypes.map((type) => (
        <div
          key={type.id}
          onClick={() => onSelect(type)}
          className={`${type.color} p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow transition-all cursor-pointer flex flex-col items-center text-center`}
        >
          <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
            <type.icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-1">{type.name}</h3>
          <p className="text-sm text-gray-600">{type.description}</p>
        </div>
      ))}
    </div>
  );
};

// Loading Skeleton Component
const ApplicationSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main Applications Component
const Applications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [viewApplication, setViewApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [applications, setApplications] = useState([]);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newApplication, setNewApplication] = useState({
    type: '',
    title: '',
    description: '',
    requestedAmount: '',
    eventDate: '',
    documents: [],
    priority: 'normal'
  });

  // Combine all applications for the "All" tab
  const allApplications = [
    ...mockApplications.pending,
    ...mockApplications.approved,
    ...mockApplications.rejected
  ];

  // Filter applications based on search query and active tab
  const filteredApplications = allApplications.filter(app => {
    const matchesSearch = 
      app.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    
    if (activeTab === 'pending') {
      return matchesSearch && (app.status.toLowerCase() === 'pending' || app.status.toLowerCase() === 'under review');
    }
    
    return matchesSearch && app.status.toLowerCase().includes(activeTab.toLowerCase());
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.submittedDate) - new Date(a.submittedDate);
    } else if (sortBy === 'urgency') {
      const urgencyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    } else if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }
    return 0;
  });

  const handleNewApplicationClick = (type = null) => {
    setSelectedType(type);
    setShowNewApplicationForm(true);
  };

  const handleViewApplication = (application) => {
    setViewApplication(application);
  };

  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery]);

  // Notification counts
  const notificationCounts = {
    all: allApplications.length,
    pending: mockApplications.pending.length,
    approved: mockApplications.approved.length,
    rejected: mockApplications.rejected.length
  };

  const handleApplicationSubmit = (e) => {
    e.preventDefault();
    // Add API call to submit application
    setApplications([...applications, { 
      ...newApplication,
      id: applications.length + 1,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      submittedBy: 'Current User', // Replace with actual user data
      priority: 'normal',
      comments: []
    }]);
    setShowNewApplicationModal(false);
    setNewApplication({
      type: '',
      title: '',
      description: '',
      requestedAmount: '',
      eventDate: '',
      documents: [],
      priority: 'normal'
    });
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'budget':
        return <DollarSign className="h-5 w-5" />;
      case 'sponsorship':
        return <Award className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search applications by subject, type, or content..."
              className="w-full pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'urgency' ? 'Priority' : 'Type'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Date</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('urgency')}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Priority</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('type')}>
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Type</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="all" className="flex items-center gap-1">
            All Applications
            <Badge className="ml-1 bg-gray-200 text-gray-800">{notificationCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            Pending
            <Badge className="ml-1 bg-yellow-200 text-yellow-800">{notificationCounts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1">
            Approved
            <Badge className="ml-1 bg-green-200 text-green-800">{notificationCounts.approved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-1">
            Rejected
            <Badge className="ml-1 bg-red-200 text-red-800">{notificationCounts.rejected}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Applications Grid with Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ApplicationSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {sortedApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedApplications.map((application) => (
                <ApplicationCard 
                  key={application.id} 
                  application={application} 
                  onViewDetail={handleViewApplication}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "No applications match your search criteria"
                  : "Start by creating a new application"}
              </p>
              <Button
                onClick={() => handleNewApplicationClick()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Application
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Pagination Controls */}
      {sortedApplications.length > 0 && !isLoading && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{sortedApplications.length}</span> of <span className="font-medium">{allApplications.length}</span> applications
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      <ApplicationForm
        isOpen={showNewApplicationForm}
        onClose={() => setShowNewApplicationForm(false)}
        initialType={selectedType}
      />
      
      {/* Application Detail Dialog */}
      <ApplicationDetail
        application={viewApplication}
        isOpen={!!viewApplication}
        onClose={() => setViewApplication(null)}
      />
    </>
  );
};

export default Applications;